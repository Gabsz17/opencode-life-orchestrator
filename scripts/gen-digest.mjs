// gen-digest.mjs — Digest diario: estudos (revisoes de hoje) + grana (proxima acao) + trends do cache
// Uso: npm run digest            (data de hoje)
//       npm run digest -- 2026-10-25
// Saida: docs/digest/<data>.md   (nao derruba se nao houver trilha nem cache: entrega o que existir)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const _d0 = new Date();
const _hoje = `${_d0.getFullYear()}-${String(_d0.getMonth() + 1).padStart(2, "0")}-${String(_d0.getDate()).padStart(2, "0")}`;
const data = process.argv[2] || _hoje;
const _p = data.match(/^(\d{4})-(\d{2})-(\d{2})$/);
let _okData = false;
if (_p) { const [, a, m, d] = _p.map(Number); const dt = new Date(a, m - 1, d); _okData = dt.getFullYear() === a && dt.getMonth() === m - 1 && dt.getDate() === d; }
if (!_okData) {
  console.error(`[digest] data invalida: ${data} (esperado YYYY-MM-DD real, ex.: ${_hoje})`);
  process.exit(1);
}

const rd = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "");
const walk = (dir, acc = []) => {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith(".md")) acc.push(p);
  }
  return acc;
};

// --- helpers de tabela markdown ---
const ultimaLinhaTabela = (raw) => {
  const ls = raw.split(/\r?\n/).filter((l) => /^\|\s*\S/.test(l) && !/^\|\s*[-: ]+\|/.test(l) && !/^\|\s*(Sessao|Data)\s*\|/.test(l));
  return ls.length ? ls[ls.length - 1] : "";
};
const celulas = (linha) => linha.split("|").slice(1, -1).map((s) => s.trim());

// --- 1) ESTUDOS: revisoes pendentes/hoje ---
const estudos = [];
for (const f of walk(path.join(ROOT, "docs", "estudos"))) {
  if (!f.endsWith("progresso.md")) continue;
  const raw = rd(f);
  const titulo = ((raw.match(/^# (.+)$/m) || [])[1] || path.basename(path.dirname(f))).replace(/^progresso\s*-\s*/i, "");
  const linha = ultimaLinhaTabela(raw);
  const c = celulas(linha);
  // formato estudos: | Sessao | Data | Modulo | O que fez | Metrica | Proxima revisao |
  const prox = c[5] || "";
  const dataRev = (prox.match(/\d{4}-\d{2}-\d{2}/) || [])[0];
  const status = !dataRev ? "sem data" : dataRev <= data ? (dataRev === data ? "HOJE" : "ATRASADA") : `em ${dataRev}`;
  estudos.push({ titulo, rel: path.relative(ROOT, f).replace(/\\/g, "/"), ultima: c[3] || c[1] || "-", prox, status });
}

// --- 2) GRANA: proxima acao ---
const ganhos = [];
for (const f of walk(path.join(ROOT, "docs", "ganhos"))) {
  if (!f.endsWith("progresso.md")) continue;
  const raw = rd(f);
  const titulo = ((raw.match(/^# (.+)$/m) || [])[1] || path.basename(path.dirname(f))).replace(/^progresso\s*-\s*/i, "");
  const linha = ultimaLinhaTabela(raw);
  const c = celulas(linha);
  // formato ganhos: | Data | Dominio | O que fez | Metrica | Proxima acao |
  ganhos.push({ titulo, rel: path.relative(ROOT, f).replace(/\\/g, "/"), fez: c[2] || "-", prox: c[4] || "-" });
}

// --- 3) TRENDS do cache de hoje (ou ultimo disponivel) ---
let trends = null, cacheData = null;
const dirCache = path.join(ROOT, "docs", "ganhos", "trends-cache");
if (fs.existsSync(dirCache)) {
  const alvo = path.join(dirCache, `${data}.json`);
  const disponiveis = fs.readdirSync(dirCache).filter((n) => n.endsWith(".json")).sort();
  const arquivo = fs.existsSync(alvo) ? alvo : (disponiveis.length ? path.join(dirCache, disponiveis[disponiveis.length - 1]) : null);
  if (arquivo) {
    try {
      const j = JSON.parse(fs.readFileSync(arquivo, "utf8"));
      trends = { ...j, arquivo: path.basename(arquivo) };
      cacheData = j.data || (path.basename(arquivo).replace(".json", ""));
    } catch (e) { console.warn(`[digest] cache ilegivel (${e.message}) — segue sem trends`); }
  }
}

// --- montagem ---
const linhas = [];
linhas.push(`# Digest diario — ${data}`, "");
linhas.push("> Estudos: ver [disclaimer](../estudos/disclaimer.md). Grana: ver [disclaimer](../ganhos/disclaimer.md).");
linhas.push("> Conteudo educacional. Sem promessa de lucro, sem recomendacao personalizada, sem questao falsa INEP.", "");

// prioridades
const pendentes = [
  ...estudos.filter((e) => e.status === "HOJE" || e.status === "ATRASADA").map((e) => `revisao de estudos: ${e.titulo} (${e.status})`),
  ...ganhos.map((g) => `proximo passo de grana: ${g.titulo} -> ${g.prox}`),
];
linhas.push("## Prioridades de hoje", "");
if (pendentes.length) pendentes.forEach((p) => linhas.push(`- [ ] ${p}`));
else linhas.push("- nenhuma pendencia datada encontrada (rode /estudar ou /ganhar para criar trilhas).");
linhas.push("");

// estudos
linhas.push(`## Estudos (${estudos.length} trilha${estudos.length === 1 ? "" : "s"})`, "");
if (estudos.length) {
  linhas.push("| Trilha | Ultima sessao | Proxima revisao | Status |", "|---|---|---|---|");
  for (const e of estudos) linhas.push(`| ${e.titulo} | ${e.ultima} | ${e.prox || "-"} | ${e.status} |`);
} else linhas.push("nenhum `progresso.md` em `docs/estudos/`.");
linhas.push("");

// grana
linhas.push(`## Grana (${ganhos.length} trilha${ganhos.length === 1 ? "" : "s"})`, "");
if (ganhos.length) {
  linhas.push("| Trilha | Ultima acao | Proxima acao |", "|---|---|---|");
  for (const g of ganhos) linhas.push(`| ${g.titulo} | ${g.fez} | ${g.prox} |`);
} else linhas.push("nenhum `progresso.md` em `docs/ganhos/`.");
linhas.push("");

// trends
linhas.push("## Trends", "");
if (trends) {
  const top = [...(trends.trends || [])].sort((a, b) => (b.score_oportunidade || 0) - (a.score_oportunidade || 0)).slice(0, 5);
  const comScore = top.filter((t) => (t.score_oportunidade || 0) > 0);
  linhas.push(`- cache: \`${trends.arquivo}\` (${trends.total ?? (trends.trends || []).length} itens, ${trends.com_fonte ?? "?"} com fonte${cacheData && cacheData !== data ? `; coleta de ${cacheData} — RODE npm run fetch-trends` : ""})`);
  if (comScore.length) for (const t of comScore) linhas.push(`- **${t.trend_tema || t.termo || t.trend_categoria}** — score ${t.score_oportunidade} (${t.trend_fonte}, ${t.trend_data_coleta})`);
  else linhas.push("- nenhum item com score > 0 hoje (volume + persistencia >= 3d exigidos pelo schema).");
} else linhas.push("sem cache de trends — rode `npm run fetch-trends`.");
linhas.push("");

// software
const plano = path.join(ROOT, "PLANO.md");
linhas.push("## Software", "");
linhas.push(fs.existsSync(plano) ? "- `PLANO.md` ativo — leia as Fases/Progresso antes de decidir." : "nenhum `PLANO.md` na raiz (sem projeto de codigo ativo neste repo).");
linhas.push("");
linhas.push(`--- Gerado por \`scripts/gen-digest.mjs\` as ${new Date().toISOString().slice(11, 16)}Z.`);

const outDir = path.join(ROOT, "docs", "digest");
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${data}.md`);
fs.writeFileSync(out, linhas.join("\n") + "\n", "utf8");
console.log(`[digest] ${path.relative(ROOT, out).replace(/\\/g, "/")} — ${estudos.length} trilha(s) estudos, ${ganhos.length} grana, trends: ${trends ? "sim" : "nao"}`);
