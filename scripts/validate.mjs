#!/usr/bin/env node
// validate.mjs — validacao estrutural Life Orchestrator (Estudos + Grana + shared)
// Uso: node scripts/validate.mjs   (ou: npm run validate)
// Saida: OK/AVISO/ERRO por check. Exit code 1 se houver ERRO.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
let erros = 0;
let avisos = 0;

const ok = (m) => console.log(`  [OK]   ${m}`);
const aviso = (m) => { avisos++; console.log(`  [AVISO] ${m}`); };
const erro = (m) => { erros++; console.log(`  [ERRO] ${m}`); };

function read(rel) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf8");
}

function walk(dir, filter = () => true, acc = []) {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return acc;
  for (const entry of readdirSync(abs)) {
    const rel = join(dir, entry);
    const full = join(ROOT, rel);
    if (statSync(full).isDirectory()) walk(rel, filter, acc);
    else if (filter(rel)) acc.push(rel);
  }
  return acc;
}

function frontmatter(raw) {
  if (!raw || !raw.startsWith("---")) return null;
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return null;
  const block = raw.slice(3, end);
  const fm = {};
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (m) fm[m[1]] = m[2].trim();
  }
  return fm;
}

console.log("\n== Life Orchestrator :: validate ==\n");

// ---------- CHECK 1: agents/ ----------
console.log("[1] agents/");
const agentFiles = walk("agents", (r) => r.endsWith(".md"));
const AGENTS = [
  "life-orchestrator",
  "coord-estudos", "coord-ganhos", "coord-pesquisa", "coord-qualidade", "coord-plataforma",
  "teoria-conceito", "teoria-exemplos", "enem-questoes", "enem-slides",
  "pratica-exercicios", "pratica-projetos", "aval-quiz", "aval-feedback",
  "mercado-acoes", "mercado-cripto", "mercado-renda-fixa",
  "negocio-freela", "negocio-digital", "negocio-local",
  "trends-research", "risco-gestao",
  "web-researcher", "web-operator",
  "qa-unit", "qa-contrato", "qa-e2e", "qa-security", "qa-quality",
  "plat-infra", "plat-docs", "plat-observability",
];
for (const a of AGENTS) {
  const raw = read(`agents/${a}.md`);
  if (!raw) { erro(`agents/${a}.md ausente`); continue; }
  const fm = frontmatter(raw);
  if (!fm) { erro(`agents/${a}.md sem frontmatter`); continue; }
  if (fm.mode !== "primary" && fm.mode !== "subagent") erro(`${a}: mode invalido (${fm.mode})`);
  if (fm.temperature && fm.temperature !== "0.1") erro(`${a}: temperature != 0.1`);
  const permBlock = raw.slice(raw.indexOf("permission:"));
  if (!/question:\s*deny/.test(permBlock)) erro(`${a}: question != deny`);
}
ok(`${agentFiles.length} arquivos de agente; ${AGENTS.length} esperados mapeados`);

// ---------- CHECK 2: primary ----------
console.log("\n[2] primary life-orchestrator");
const primary = read("agents/life-orchestrator.md") || "";
if (/mode:\s*primary/.test(primary)) ok("mode: primary");
else erro("life-orchestrator sem mode: primary");
for (const c of ["coord-estudos", "coord-ganhos", "coord-pesquisa", "coord-qualidade", "coord-plataforma"]) {
  if (primary.includes(`"${c}": allow`)) ok(`task allow: ${c}`);
  else erro(`life-orchestrator sem task allow: ${c}`);
}
if (/"\*":\s*deny/.test(primary) && /"coord-estudos":\s*allow/.test(primary)) ok("task allow-list (wildcard deny)");
else erro("life-orchestrator sem task allow-list adequada");
if (/"git push --force\*":\s*deny/.test(primary)) ok("bash deny force-push");
else erro("life-orchestrator sem deny force-push");

// ---------- CHECK 3: coords so delegam seu time ----------
console.log("\n[3] allow-lists dos coords");
const times = {
  "coord-estudos": ["teoria-conceito", "teoria-exemplos", "enem-questoes", "enem-slides", "pratica-exercicios", "pratica-projetos", "aval-quiz", "aval-feedback"],
  "coord-ganhos": ["mercado-acoes", "mercado-cripto", "mercado-renda-fixa", "negocio-freela", "negocio-digital", "negocio-local", "trends-research", "risco-gestao"],
  "coord-pesquisa": ["web-researcher", "web-operator"],
  "coord-qualidade": ["qa-unit", "qa-contrato", "qa-e2e", "qa-security", "qa-quality"],
  "coord-plataforma": ["plat-infra", "plat-docs", "plat-observability"],
};
for (const [coord, team] of Object.entries(times)) {
  const raw = read(`agents/${coord}.md`) || "";
  let all = true;
  for (const t of team) if (!raw.includes(`"${t}": allow`)) { erro(`${coord} sem allow: ${t}`); all = false; }
  if (all) ok(`${coord} -> ${team.length} workers autorizados`);
}

// ---------- CHECK 4: workers edit-scoped ----------
console.log("\n[4] workers (edit-scoped)");
const workers = AGENTS.filter((a) => !a.startsWith("coord-") && a !== "life-orchestrator");
for (const w of workers) {
  const raw = read(`agents/${w}.md`) || "";
  if (/"\*":\s*deny/.test(raw) === false) erro(`${w}: sem deny no wildcard de edit`);
}
ok(`${workers.length} workers com escopo de edicao restrito (checado)`);

// ---------- CHECK 5: commands ----------
console.log("\n[5] commands/");
const CMDS = ["estudar", "estudar-enem", "estudar-relatorio", "ganhar", "ganhar-diario", "ganhar-trends", "ganhar-relatorio", "ganhar-backup"];
for (const c of CMDS) {
  const raw = read(`commands/${c}.md`);
  if (!raw) { erro(`commands/${c}.md ausente`); continue; }
  const expects = c.startsWith("estudar") ? "coord-estudos" : "coord-ganhos";
  if (raw.includes(expects) || raw.includes("life-orchestrator")) ok(`${c} -> ${expects}`);
  else erro(`${c} nao referencia ${expects}`);
  if (c.startsWith("ganhar") && !raw.includes("docs/ganhos/disclaimer.md")) erro(`${c}: sem disclaimer ganhos`);
  if (c.startsWith("estudar") && !raw.includes("docs/estudos/disclaimer.md")) erro(`${c}: sem disclaimer estudos`);
}
ok(`${CMDS.length} comandos checados`);

// ---------- CHECK 6: templates ----------
console.log("\n[6] templates/");
for (const [t, secoes] of [["PLANO-ESTUDOS.md", 9], ["PLANO-GANHO.md", 9]]) {
  const raw = read(`templates/${t}`);
  if (!raw) { erro(`templates/${t} ausente`); continue; }
  let count = 0;
  for (let i = 1; i <= secoes; i++) if (new RegExp(`^## ${i}\\.`, "m").test(raw)) count++;
  if (count === secoes) ok(`${t}: ${secoes}/${secoes} secoes`);
  else erro(`${t}: ${count}/${secoes} secoes`);
}
const schema = read("templates/TREND-SCHEMA.md") || "";
for (const frag of ["TrendOportunidadeSchema", "superRefine", "base_legal", "score_oportunidade", "saturacao", "disclaimer_aceito"]) {
  if (schema.includes(frag)) ok(`TREND-SCHEMA: ${frag}`);
  else erro(`TREND-SCHEMA sem ${frag}`);
}

// ---------- CHECK 7: docs dominios ----------
console.log("\n[7] docs/");
for (const d of ["docs/estudos/README.md", "docs/estudos/disclaimer.md", "docs/estudos/enem-fontes.md",
  "docs/ganhos/README.md", "docs/ganhos/disclaimer.md", "docs/ganhos/fontes-mercado.md", "docs/ganhos/fontes-trends.md",
  "docs/shared/memoria-guia.md"]) {
  if (read(d)) ok(d); else erro(`${d} ausente`);
}
// disclaimer linkado no topo dos docs de conteudo
for (const dir of ["docs/estudos", "docs/ganhos"]) {
  const files = walk(dir, (r) => r.endsWith(".md") && !r.includes("disclaimer") && !r.endsWith("README.md"));
  let falta = 0;
  for (const f of files) {
    const raw = read(f) || "";
    if (!/disclaimer\.md/.test(raw)) { falta++; erro(`${f}: sem link de disclaimer`); }
  }
  if (!falta) ok(`${dir}: todos os docs linkam disclaimer`);
}

// ---------- CHECK 8: trilhas piloto ----------
console.log("\n[8] trilhas piloto (e2e)");
const e2e = [
  ["docs/estudos/enem/exemplo-iniciante/PLANO-ESTUDOS.md", "docs/estudos/enem/exemplo-iniciante/progresso.md"],
  ["docs/ganhos/exemplo-renda-extra/PLANO-GANHO.md", "docs/ganhos/exemplo-renda-extra/progresso.md"],
];
for (const [plano, prog] of e2e) {
  if (read(plano) && read(prog)) ok(`${plano} + progresso rastreaveis`);
  else erro(`trilha piloto incompleta: ${plano}`);
}

// ---------- CHECK 9: evals ----------
console.log("\n[9] evals/");
const evalStats = [["evals/estudos.md", 15], ["evals/ganhos.md", 19]];
for (const [f, min] of evalStats) {
  const raw = read(f);
  if (!raw) { erro(`${f} ausente`); continue; }
  const n = (raw.match(/^## E\d+/gm) || []).length;
  if (n >= min) ok(`${f}: ${n} evals (min ${min})`);
  else erro(`${f}: ${n} evals (< ${min})`);
}

// ---------- CHECK 10: scripts + package.json ----------
console.log("\n[10] scripts + package.json");
for (const s of ["validate.mjs", "fetch-trends.mjs", "gen-report-estudos.mjs", "gen-report-ganhos.mjs", "backup.mjs", "restore.mjs", "sync-memory.mjs"]) {
  if (existsSync(join(ROOT, "scripts", s))) ok(`scripts/${s}`);
  else erro(`scripts/${s} ausente`);
}
const pkgRaw = read("package.json");
if (pkgRaw) {
  const pkg = JSON.parse(pkgRaw);
  for (const s of ["validate", "fetch-trends", "gen-report-estudos", "gen-report-ganhos", "backup", "restore", "sync-memory"]) {
    if (pkg.scripts && pkg.scripts[s]) ok(`npm run ${s}`);
    else erro(`package.json sem script: ${s}`);
  }
} else erro("package.json ausente");

// ---------- CHECK 11: configs ----------
console.log("\n[11] configs");
const cfg = read("opencode.jsonc") || "";
if (cfg.includes('"default_agent": "life-orchestrator"')) ok("default_agent: life-orchestrator");
else erro("opencode.jsonc sem default_agent life-orchestrator");
if (cfg.includes('"*": "allow"') === false && !/bash[\s\S]*"regex"/.test(cfg)) aviso("opencode.jsonc: revisar grant bash (Opcao A)");
if (read(".env.example")) ok(".env.example presente"); else erro(".env.example ausente");
const gitignore = read(".gitignore") || "";
for (const g of [".env", "node_modules", "trends-cache", "backups"]) {
  if (gitignore.includes(g)) ok(`.gitignore: ${g}`);
  else erro(`.gitignore sem ${g}`);
}
if (read("README.md")) ok("README.md"); else erro("README.md ausente");
if (read("LICENSE")) ok("LICENSE"); else erro("LICENSE ausente");

// ---------- CHECK 12: workflows ----------
console.log("\n[12] workflows");
for (const w of ["trends.yml", "validate.yml"]) {
  if (existsSync(join(ROOT, ".github", "workflows", w))) ok(`.github/workflows/${w}`);
  else erro(`workflow ausente: ${w}`);
}

// ---------- CHECK 13: a11y markdown ----------
console.log("\n[13] a11y markdown");
const mdFiles = walk("docs", (r) => r.endsWith(".md")).concat(walk("templates", (r) => r.endsWith(".md")), walk("commands", (r) => r.endsWith(".md")));
let a11yErr = 0;
for (const f of mdFiles) {
  const raw = read(f) || "";
  const h1 = (raw.match(/^# (?!\#)/gm) || []).length;
  if (h1 !== 1) { erro(`${f}: ${h1} H1 (esperado 1)`); a11yErr++; }
  if (/H1\s*->\s*H3/.test(raw)) { aviso(`${f}: referencia a pulo de heading`); }
}
if (!a11yErr) ok(`${mdFiles.length} md com H1 unico`);

// ---------- CHECK 14: segredos (docs/templates/commands/evals/scripts — NAO agents) ----------
console.log("\n[14] segredos (fora de agents/)");
const SECRET = /(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|BEGIN [A-Z ]*PRIVATE KEY|password\s*=\s*["'][^"']+["'])/;
let secretHits = 0;
const secretScope = walk("docs", (r) => r.endsWith(".md"))
  .concat(walk("templates", (r) => r.endsWith(".md")), walk("commands", (r) => r.endsWith(".md")),
          walk("evals", (r) => r.endsWith(".md")), walk("scripts", (r) => r.endsWith(".mjs")));
for (const f of secretScope) {
  const raw = read(f) || "";
  const m = raw.match(SECRET);
  if (m && !raw.includes("{env:")) { erro(`${f}: possivel segredo (${m[0].slice(0, 12)}...)`); secretHits++; }
}
if (!secretHits) ok(`sem segredos em ${secretScope.length} arquivos (agents/ pulado p/ falso-positivo)`);
if (existsSync(join(ROOT, ".env"))) erro(".env presente no repo (deve estar fora do git)");
else ok(".env fora do repo");

// ---------- resumo ----------
console.log(`\n== RESULTADO: ${erros} ERRO(S), ${avisos} AVISO(S) ==`);
if (erros > 0) { console.log("STATUS: REPROVADO\n"); process.exit(1); }
console.log("STATUS: VERDE\n");
