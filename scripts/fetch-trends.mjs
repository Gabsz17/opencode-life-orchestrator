#!/usr/bin/env node
// fetch-trends.mjs — coleta trends das 7 fontes oficiais (+ fallback Wikipedia pageviews = 8 no array "fontes") com cache diario (TTL 24h)
// Uso: node scripts/fetch-trends.mjs [--force]
// Saida: docs/ganhos/trends-cache/YYYY-MM-DD.json
// Regra: sem fonte = "nao confirmado"; credenciais so via env ({env:NOME} no opencode).

import { mkdirSync, writeFileSync, readdirSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = join(ROOT, "docs", "ganhos", "trends-cache");
const _d = new Date();
const hoje = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, "0")}-${String(_d.getDate()).padStart(2, "0")}`;
const arquivo = join(CACHE_DIR, `${hoje}.json`);
const force = process.argv.includes("--force");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 life-orchestrator/1.0";

// TTL 24h: se ja existe de hoje e nao force, sai
if (existsSync(arquivo) && !force) {
  console.log(`[cache] ${arquivo} ja existe (TTL 24h). Use --force para rebuscar.`);
  process.exit(0);
}
mkdirSync(CACHE_DIR, { recursive: true });

const trends = [];
const naoConfirmado = (categoria, motivo) => ({
  trend_categoria: categoria,
  trend_fonte: "nao confirmado",
  trend_data_coleta: hoje,
  trend_volume: 0,
  trend_crescimento_pct: 0,
  trend_persistencia_dias: 0,
  score_oportunidade: 0, // schema exige volume>0 e persistencia>=3 p/ score>0
  saturacao: "baixa",
  _aviso: motivo,
});

async function getText(url, timeoutMs = 10000, headers = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": UA, ...headers } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally { clearTimeout(t); }
}
async function getJSON(url, timeoutMs = 10000, headers = {}) {
  return JSON.parse(await getText(url, timeoutMs, headers));
}
const decodeEntities = (s) => s
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n));

// ---------- 1. Google Trends (tentativa) -> fallback Google Noticias RSS BR ----------
async function fetchGoogle() {
  try {
    const data = JSON.parse(await getText("https://trends.google.com/trends/api/dailytrends?geo=BR&hl=pt-BR"));
    const days = data?.default?.trendingSearchesDays || [];
    if (!days.length) throw new Error("vazio");
    for (const s of (days[0].trendingSearches || []).slice(0, 10)) {
      const q = s.title?.query;
      const vol = s.formattedTraffic ? parseInt(String(s.formattedTraffic).replace(/[^\d]/g, ""), 10) || 0 : 0;
      if (q) trends.push({
        trend_categoria: "google_trends",
        trend_fonte: `Google Trends dailytrends BR ${hoje}`,
        trend_data_coleta: hoje, trend_volume: vol, trend_crescimento_pct: 0,
        trend_persistencia_dias: 1, score_oportunidade: 0, saturacao: "media", topico: q,
      });
    }
  } catch {
    // Fallback: Google Noticias RSS BR (gratis, estavel, sem chave)
    try {
      const xml = await getText("https://news.google.com/rss/headlines?hl=pt-BR&gl=BR&ceid=BR:pt-419");
      const itens = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 12);
      for (const [, bloco] of itens) {
        const t = bloco.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
        const d = bloco.match(/<pubDate>(.*?)<\/pubDate>/);
        if (!t) continue;
        trends.push({
          trend_categoria: "outro",
          trend_fonte: `Google Noticias RSS BR (fallback Google Trends) ${hoje}`,
          trend_data_coleta: hoje, trend_volume: 0, trend_crescimento_pct: 0,
          trend_persistencia_dias: 1, score_oportunidade: 0, saturacao: "media",
          topico: decodeEntities(t[1].trim()), pubDate: d ? d[1] : undefined,
          _aviso: "Google Trends indisponivel (endpoint 404); substituido por Google Noticias RSS BR",
        });
      }
      if (itens.length) return;
      trends.push(naoConfirmado("google_trends", "Google Trends 404 e fallback RSS sem itens"));
    } catch (e2) {
      trends.push(naoConfirmado("google_trends", `Google Trends + RSS BR falharam: ${e2.message}`));
    }
  }
}

// ---------- 2. X trends24 BR (HTML) ----------
async function fetchXTrends() {
  try {
    const html = await getText("https://trends24.in/brazil/");
    const itens = [...html.matchAll(/<a[^>]+href="https:\/\/twitter\.com\/search\?q=([^"]+)"[^>]*>([^<]{2,70})<\/a>/g)];
    const vistos = new Set();
    let n = 0;
    for (const [, q, txt] of itens) {
      if (n >= 15) break;
      const termo = decodeEntities(txt.trim());
      if (!termo || vistos.has(termo)) continue;
      vistos.add(termo); n++;
      trends.push({
        trend_categoria: "x_twitter",
        trend_fonte: `trends24.in/brazil ${hoje}`,
        trend_data_coleta: hoje, trend_volume: 0, trend_crescimento_pct: 0,
        trend_persistencia_dias: 1, score_oportunidade: 0, saturacao: "media",
        topico: termo, _query: decodeURIComponent(q),
      });
    }
    if (!n) trends.push(naoConfirmado("x_twitter", "trends24 sem itens extraiveis"));
  } catch (e) { trends.push(naoConfirmado("x_twitter", `falha trends24: ${e.message}`)); }
}

// ---------- 3. Wikipedia top pageviews PT (fonte gratis, proxy trends BR) ----------
async function fetchWikipedia() {
  try {
    const ay = new Date(Date.now() - 86400000).toISOString();
    const [Y, M, D] = [ay.slice(0, 4), ay.slice(5, 7), ay.slice(8, 10)];
    const data = await getJSON(`https://wikimedia.org/api/rest_v1/metrics/pageviews/top/pt.wikipedia.org/all-access/${Y}/${M}/${D}`,
      10000, { "User-Agent": "life-orchestrator/1.0 (educational)" });
    const arts = data?.items?.[0]?.articles || [];
    for (const a of arts.filter((x) => !/^(Wikip|Especial|Arquivo|Categoria):/i.test(x.article)).slice(0, 12)) {
      trends.push({
        trend_categoria: "outro",
        trend_fonte: `Wikipedia pt.pageviews ${Y}-${M}-${D}`,
        trend_data_coleta: hoje, trend_volume: a.views || 0, trend_crescimento_pct: 0,
        trend_persistencia_dias: 1, score_oportunidade: 0, saturacao: "media",
        topico: decodeEntities(a.article.replace(/_/g, " ")),
        _aviso: "pagina mais vista ontem (proxy de interesse; nao e volume de busca oficial)",
      });
    }
  } catch (e) { trends.push(naoConfirmado("outro", `falha Wikipedia pageviews: ${e.message}`)); }
}

// ---------- 4. TikTok Creative Center (chave opcional) ----------
async function fetchTikTok() {
  const key = process.env.TIKTOK_CREATIVE_CENTER_KEY;
  if (!key) { trends.push(naoConfirmado("tiktok", "TIKTOK_CREATIVE_CENTER_KEY nao configurada (env)")); return; }
  trends.push(naoConfirmado("tiktok", "credencial presente; endpoint requer mapeamento especifico"));
}

// ---------- 5. Meta Ads Library (token opcional) ----------
async function fetchMeta() {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) { trends.push(naoConfirmado("meta", "META_ACCESS_TOKEN nao configurada (env)")); return; }
  trends.push(naoConfirmado("meta", "credencial presente; endpoint requer app_id/plat"));
}

// ---------- 6. YouTube (API key opcional) ----------
async function fetchYouTube() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) { trends.push(naoConfirmado("youtube", "YOUTUBE_API_KEY nao configurada (env) — fallback web-operator")); return; }
  try {
    const data = await getJSON(`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=BR&maxResults=10&key=${key}`);
    for (const v of data?.items || []) trends.push({
      trend_categoria: "youtube",
      trend_fonte: `YouTube Data v3 BR ${hoje}`,
      trend_data_coleta: hoje, trend_volume: 0, trend_crescimento_pct: 0,
      trend_persistencia_dias: 1, score_oportunidade: 0, saturacao: "media",
      topico: v.snippet?.title,
    });
  } catch (e) { trends.push(naoConfirmado("youtube", `falha YouTube API: ${e.message}`)); }
}

// ---------- 7. TSE (eleitoral — SENSIVEL, monitoramento educacional) ----------
function fetchTSE() {
  trends.push({
    trend_categoria: "tse",
    trend_fonte: `TSE dados abertos ${hoje}`,
    trend_data_coleta: hoje, trend_volume: 0, trend_crescimento_pct: 0,
    trend_persistencia_dias: 0, score_oportunidade: 0, saturacao: "baixa",
    eleitoral: true,
    base_legal: "Lei 9.504/1997 + Res. TSE 23.610/2019",
    topico: "eleicoes-2026 (monitoramento educacional)",
    _aviso: "eleitoral=true: sensivel; nao e esquema de renda",
  });
}

// ---------- 8. IBGE/BCB (demanda especifica) ----------
function fetchEconomico() {
  trends.push(naoConfirmado("bcb", "IBGE/BCB: demanda especifica via coord-pesquisa"));
}

console.log(`[fetch-trends] iniciando coleta ${hoje}...`);
await Promise.all([fetchGoogle(), fetchXTrends(), fetchWikipedia(), fetchTikTok(), fetchMeta(), fetchYouTube(), fetchEconomico()]);
fetchTSE();

const comFonte = trends.filter((t) => t.trend_fonte !== "nao confirmado").length;
const out = {
  data: hoje,
  gerado_em: new Date().toISOString(),
  total: trends.length,
  com_fonte: comFonte,
  fontes: ["google_trends(fallback news RSS)", "x_twitter", "wikipedia_pt", "tiktok", "meta", "youtube", "tse", "ibge_bcb"],
  disclaimer: "EDUCACIONAL — sem recomendacao de investimento, sem promessa de lucro. Fonte+data obrigatorios; sem fonte = 'nao confirmado'.",
  criterios_score: "score = volume*0.4 + velocidade*0.3 + aderencia*0.3 (0-100); score>0 exige volume>0 e persistencia>=3d",
  trends,
};
writeFileSync(arquivo, JSON.stringify(out, null, 2), "utf8");

// limpeza: caches > 7 dias (apenas arquivos do proprio cache)
try {
  const cd = new Date(Date.now() - 7 * 86400000);
  const corte = `${cd.getFullYear()}-${String(cd.getMonth() + 1).padStart(2, "0")}-${String(cd.getDate()).padStart(2, "0")}`;
  for (const f of readdirSync(CACHE_DIR)) {
    const data = f.replace(/\.json$/, "");
    if (/^\d{4}-\d{2}-\d{2}$/.test(data) && data < corte) rmSync(join(CACHE_DIR, f), { force: true });
  }
} catch { /* best effort */ }

console.log(`[fetch-trends] OK -> ${arquivo} (${trends.length} itens, ${comFonte} com fonte, ${out.fontes.length} fontes consultadas)`);
