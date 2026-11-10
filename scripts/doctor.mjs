#!/usr/bin/env node
// doctor.mjs — diagnostico de ambiente do Life Orchestrator
// Uso: node scripts/doctor.mjs   (ou: npm run doctor)
// Exit 1 apenas para BLOQUEIO (ERRO). Avisos nao falham.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
let bloqueios = 0;
let avisos = 0;

const ok = (m) => console.log(`  [OK]    ${m}`);
const aviso = (m) => { avisos++; console.log(`  [AVISO] ${m}`); };
const erro = (m) => { bloqueios++; console.log(`  [ERRO]  ${m}`); };
const git = (args) => execFileSync("git", args, { cwd: ROOT, stdio: "pipe", encoding: "utf8" });
const _d = new Date();
const hoje = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, "0")}-${String(_d.getDate()).padStart(2, "0")}`;

console.log("\n== Life Orchestrator :: doctor ==\n");

// ---------- 1. Node x engines ----------
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const faixa = String(pkg.engines?.node || "");
function atendeNode(f, versao) {
  const v = versao.split(".").map(Number);
  const cmp = (alvo) => (v[0] - alvo[0]) || (v[1] - alvo[1]) || (v[2] - alvo[2]);
  const partes = String(f).trim().replace(/(>=|<=|>|<|=|\^)\s+/g, "$1").split(/\s+/).filter(Boolean);
  if (!partes.length) return null;
  for (const p of partes) {
    const m = p.match(/^(>=|<=|>|<|=|\^)?(\d+)(?:\.(\d+))?(?:\.(\d+))?$/);
    if (!m) return null;
    const alvo = [Number(m[2]), Number(m[3] || 0), Number(m[4] || 0)];
    const c = cmp(alvo);
    const op = m[1] || "=";
    if (op === "^") { if (!(v[0] === alvo[0] && c >= 0)) return false; }
    else if (op === ">=" ? c < 0 : op === ">" ? c <= 0 : op === "<=" ? c > 0 : op === "<" ? c >= 0 : c !== 0) return false;
  }
  return true;
}
const atende = atendeNode(faixa, process.versions.node);
if (atende === null) aviso(`engines.node ilegivel ("${faixa}"); rodando Node ${process.versions.node}`);
else if (!atende) erro(`Node ${process.versions.node} nao atende engines "${faixa}"`);
else ok(`Node ${process.versions.node} atende engines "${faixa}"`);

// ---------- 2. scripts npm obrigatorios ----------
const EXPECT = ["validate", "fetch-trends", "gen-report-estudos", "gen-report-ganhos", "doctor", "digest", "backup", "restore", "sync-memory"];
const faltando = EXPECT.filter((s) => !pkg.scripts?.[s]);
if (faltando.length) erro(`package.json sem script(s): ${faltando.join(", ")}`);
else ok(`${EXPECT.length} scripts npm declarados`);

// ---------- 3. sintaxe dos scripts ----------
const scriptsDir = join(ROOT, "scripts");
const mjs = readdirSync(scriptsDir).filter((f) => f.endsWith(".mjs")).sort();
let bad = 0;
for (const f of mjs) {
  try { execFileSync(process.execPath, ["--check", join(scriptsDir, f)], { stdio: "pipe" }); }
  catch { erro(`scripts/${f}: erro de sintaxe`); bad++; }
}
if (!bad) ok(`${mjs.length} scripts passam em node --check`);

// ---------- 4. git + remote ----------
let gitOk = false;
try { git(["rev-parse", "--is-inside-work-tree"]); gitOk = true; ok("repo git detectado"); }
catch { erro("git indisponivel ou diretorio fora de um repo"); }
if (gitOk) {
  try {
    const url = git(["remote", "get-url", "origin"]).trim();
    if (/^https?:\/\//i.test(url)) {
      let u = null;
      try { u = new URL(url); } catch { erro("remote origin HTTPS invalido (corrija a URL)"); }
      if (u) {
        if (u.username || u.password) erro("remote origin com credencial embutida (limpe a URL)");
        else ok(`remote origin limpo (${u.protocol}//${u.host}${u.pathname})`);
      }
    } else if (/^[\w.-]+@[\w.-]+:/.test(url) || /^ssh:\/\//i.test(url)) {
      ok("remote origin SSH (git@host:path) sem credencial na URL");
    } else {
      ok("remote origin local/sem credencial na URL");
    }
  } catch { aviso("remote origin ausente (sem push/CI)"); }
}

// ---------- 5. .env e .env.example ----------
if (gitOk) {
  const tracked = (rel) => { try { git(["ls-files", "--error-unmatch", "--", rel]); return true; } catch { return false; } };
  const ignored = (rel) => { try { git(["check-ignore", "-q", "--", rel]); return true; } catch { return false; } };
  const envExiste = existsSync(join(ROOT, ".env"));
  if (tracked(".env")) erro(".env VERSIONADO no git (git rm --cached .env)");
  else if (envExiste && !ignored(".env")) erro(".env existe e NAO esta no .gitignore");
  else if (envExiste) ok(".env local presente e ignorado pelo git");
  else ok(".env ausente (opcional; copie de .env.example)");
  if (!tracked(".env.example")) erro(".env.example nao rastreado no git");
  else if (!existsSync(join(ROOT, ".env.example"))) erro(".env.example rastreado mas ausente no working tree");
  else if (ignored(".env.example")) erro(".env.example ignorado (modelo nao chega ao clone)");
  else ok(".env.example rastreado (modelo publico)");
  let envsGit = "";
  try { envsGit = git(["ls-files", "--", ".env*"]).trim(); } catch { /* sem git */ }
  const envsExtras = envsGit.split(/\r?\n/).filter(Boolean).filter((f) => f !== ".env.example");
  if (envsExtras.length) erro(`arquivo(s) .env versionado(s): ${envsExtras.join(", ")}`);
  else ok("nenhum .env.* versionado alem do .env.example");
} else {
  aviso(".env/.env.example: checagem de git pulada");
}

// ---------- 6. cache de trends ----------
const cacheDir = join(ROOT, "docs", "ganhos", "trends-cache");
const caches = existsSync(cacheDir) ? readdirSync(cacheDir).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort() : [];
if (caches.includes(`${hoje}.json`)) {
  try {
    const parsed = JSON.parse(readFileSync(join(cacheDir, `${hoje}.json`), "utf8"));
    if (!Array.isArray(parsed.trends)) throw new Error("sem array trends");
    ok(`cache de trends de hoje integro (${hoje}.json, ${parsed.trends.length} itens)`);
  } catch (e) { erro(`cache de hoje invalido (${hoje}.json): ${e.message}`); }
}
else if (caches.length) {
  const ultimo = caches[caches.length - 1].replace(".json", "");
  const dias = Math.round((new Date(hoje) - new Date(ultimo)) / 86400000);
  aviso(`sem cache de hoje; ultimo ${ultimo} (${dias}d) - rode npm run fetch-trends`);
} else aviso("nenhum cache de trends; rode npm run fetch-trends");

// ---------- 7. inbox da memoria ----------
const inboxDir = join(ROOT, ".opencode", "memory", "inbox");
const pend = [];
if (existsSync(inboxDir)) {
  for (const f of readdirSync(inboxDir)) {
    if (!f.endsWith(".md")) continue;
    try {
      const p = join(inboxDir, f);
      if (statSync(p).size > 0 && readFileSync(p, "utf8").replace(/^\ufeff/, "").trim() !== "") pend.push(f);
    } catch { aviso(`inbox: nao consegui ler ${f} (permissao/bloqueio)`); }
  }
}
if (pend.length) aviso(`${pend.length} arquivo(s) no inbox com conteudo - rode npm run sync-memory (${pend.join(", ")})`);
else ok("inbox vazio (nada para promover)");

// ---------- 8. workflows: actions pinadas ----------
let tagSolta = 0;
const wfDir = join(ROOT, ".github", "workflows");
const wfs = existsSync(wfDir) ? readdirSync(wfDir).filter((f) => /\.ya?ml$/.test(f)) : [];
for (const w of wfs) {
  const raw = readFileSync(join(wfDir, w), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^(\s*)-?\s*uses:\s*["']?([^"'\s#]+)["']?/);
    if (!m || m[1].length > 8) continue; // ignora bloco run: | (indentacao maior)
    const ref = m[2];
    if (ref.startsWith("./") || ref.startsWith("docker://")) continue; // acao local / imagem
    const at = ref.lastIndexOf("@");
    if (at === -1 || !/^[0-9a-fA-F]{40}$/.test(ref.slice(at + 1))) {
      aviso(`${w}: ${ref} nao pinada por SHA (recomendado pin)`);
      tagSolta++;
    }
  }
}
if (!wfs.length) aviso("nenhum workflow encontrado em .github/workflows");
else if (!tagSolta) ok(`${wfs.length} workflow(s) com actions pinadas por SHA`);

// ---------- 9. opencode.jsonc ----------
try {
  const cfg = readFileSync(join(ROOT, "opencode.jsonc"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
  JSON.parse(cfg);
  ok("opencode.jsonc parseia como JSON (comentarios removidos)");
} catch (e) { erro(`opencode.jsonc invalido: ${e.message}`); }

// ---------- resumo ----------
console.log(`\n== DOCTOR: ${bloqueios} BLOQUEIO(S), ${avisos} AVISO(S) ==`);
if (bloqueios > 0) { console.log("STATUS: BLOQUEADO\n"); process.exit(1); }
console.log("STATUS: PRONTO\n");
