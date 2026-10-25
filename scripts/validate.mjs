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
  "life-orchestrator", "orquestrador", "mentor",
  "coord-estudos", "coord-ganhos", "coord-pesquisa", "coord-qualidade", "coord-plataforma",
  "coord-teoria", "coord-pratica", "coord-avaliacao", "coord-frontend", "coord-backend",
  "teoria-conceito", "teoria-exemplos", "enem-questoes", "enem-slides",
  "pratica-exercicios", "pratica-projetos", "aval-quiz", "aval-feedback",
  "mercado-acoes", "mercado-cripto", "mercado-renda-fixa",
  "negocio-freela", "negocio-digital", "negocio-local",
  "trends-research", "risco-gestao",
  "fe-pages", "fe-components", "fe-state", "fe-a11y",
  "be-api", "be-auth", "be-domain", "be-data", "be-integrations",
  "web-researcher", "web-operator",
  "qa-unit", "qa-contrato", "qa-e2e", "qa-security", "qa-quality",
  "plat-infra", "plat-docs", "plat-observability",
];
const PRIMARY = ["life-orchestrator", "orquestrador", "mentor"];
const SW_WORKERS = /^(fe|be)-/; // workers de software: temp 0.2-0.3 + edit amplo (calibracao do orquestrador)
for (const a of AGENTS) {
  const raw = read(`agents/${a}.md`);
  if (!raw) { erro(`agents/${a}.md ausente`); continue; }
  const fm = frontmatter(raw);
  if (!fm) { erro(`agents/${a}.md sem frontmatter`); continue; }
  if (fm.mode !== "primary" && fm.mode !== "subagent") erro(`${a}: mode invalido (${fm.mode})`);
  if (fm.temperature) {
    const t = parseFloat(fm.temperature);
    const max = SW_WORKERS.test(a) ? 0.3 : 0.1;
    if (!(t >= 0.1 && t <= max)) erro(`${a}: temperature ${fm.temperature} fora de [0.1, ${max}]`);
  }
  const permBlock = raw.slice(raw.indexOf("permission:"));
  if (!/question:\s*deny/.test(permBlock)) erro(`${a}: question != deny`);
}
// igualdade de conjuntos: nenhum .md orfao em agents/ e nenhum esperado ausente
const fileNames = agentFiles.map((f) => f.replace(/^agents[\\/]/, "").replace(/\.md$/, "")).sort();
const listed = [...AGENTS].sort();
if (JSON.stringify(fileNames) !== JSON.stringify(listed)) {
  const orfaos = fileNames.filter((n) => !AGENTS.includes(n));
  const ausentes = listed.filter((n) => !fileNames.includes(n));
  erro(`agents/ divergente do AGENTS[] (orfao: ${orfaos.join(",") || "-"} | ausente: ${ausentes.join(",") || "-"})`);
} else ok(`${agentFiles.length} arquivos = ${AGENTS.length} esperados (conjuntos identicos)`);

// ---------- CHECK 2: primary ----------
console.log("\n[2] primary life-orchestrator");
const primary = read("agents/life-orchestrator.md") || "";
if (/mode:\s*primary/.test(primary)) ok("mode: primary");
else erro("life-orchestrator sem mode: primary");
for (const c of ["coord-estudos", "coord-ganhos", "coord-frontend", "coord-backend", "coord-pesquisa", "coord-qualidade", "coord-plataforma"]) {
  if (primary.includes(`"${c}": allow`)) ok(`task allow: ${c}`);
  else erro(`life-orchestrator sem task allow: ${c}`);
}
if (/"\*":\s*deny/.test(primary) && /"coord-estudos":\s*allow/.test(primary)) ok("task allow-list (wildcard deny)");
else erro("life-orchestrator sem task allow-list adequada");
if (/"git push --force\*":\s*deny/.test(primary)) ok("bash deny force-push");
else erro("life-orchestrator sem deny force-push");
// roteamento de PRECISAO: os 35 workers devem ter allow explicito (apagar 1 = rota morta com validate verde)
const SW_ALL = /^(fe|be)-/;
const TODOS_WORKERS = AGENTS.filter((a) => !a.startsWith("coord-") && !PRIMARY.includes(a));
let rotasMortas = 0;
for (const w of TODOS_WORKERS) {
  if (!primary.includes(`"${w}": allow`)) { erro(`life-orchestrator sem task allow (rota de precisao morta): ${w}`); rotasMortas++; }
}
if (!rotasMortas) ok(`life-orchestrator -> ${TODOS_WORKERS.length} worker-allows de precisao completos`);
// primarios alternativos: nao podem ter worker direto (orchestram so via coords) nem allow entre si
for (const p of ["orquestrador", "mentor"]) {
  const raw = read(`agents/${p}.md`) || "";
  const comWorker = TODOS_WORKERS.filter((w) => raw.includes(`"${w}": allow`));
  const comPrimary = PRIMARY.filter((x) => x !== p && raw.includes(`"${x}": allow`));
  if (comWorker.length) erro(`${p} tem allow direto de worker (desenhado so-via-coords): ${comWorker.join(",")}`);
  else ok(`${p} orquestra so via coords (sem worker direto)`);
  if (comPrimary.length) erro(`${p} delega a outro primary: ${comPrimary.join(",")}`);
}
// primarios secundarios existem e delegam ao time certo
const orc = read("agents/orquestrador.md") || "";
if (/mode:\s*primary/.test(orc) && orc.includes('"coord-frontend": allow') && orc.includes('"coord-backend": allow')) ok("orquestrador (primary software) -> coords fe/be");
else erro("orquestrador sem primary ou sem allow coord-frontend/coord-backend");
const men = read("agents/mentor.md") || "";
if (/mode:\s*primary/.test(men) && men.includes('"coord-teoria": allow') && men.includes('"coord-avaliacao": allow')) ok("mentor (primary estudos) -> coords granulares");
else erro("mentor sem primary ou sem allow coord-teoria/coord-avaliacao");

// ---------- CHECK 3: coords so delegam seu time ----------
console.log("\n[3] allow-lists dos coords");
const times = {
  "coord-estudos": ["teoria-conceito", "teoria-exemplos", "enem-questoes", "enem-slides", "pratica-exercicios", "pratica-projetos", "aval-quiz", "aval-feedback"],
  "coord-ganhos": ["mercado-acoes", "mercado-cripto", "mercado-renda-fixa", "negocio-freela", "negocio-digital", "negocio-local", "trends-research", "risco-gestao"],
  "coord-teoria": ["teoria-conceito", "teoria-exemplos", "enem-slides"],
  "coord-pratica": ["pratica-exercicios", "pratica-projetos", "enem-questoes"],
  "coord-avaliacao": ["aval-quiz", "aval-feedback"],
  "coord-frontend": ["fe-pages", "fe-components", "fe-state", "fe-a11y"],
  "coord-backend": ["be-api", "be-auth", "be-domain", "be-data", "be-integrations"],
  "coord-pesquisa": ["web-researcher", "web-operator"],
  "coord-qualidade": ["qa-unit", "qa-contrato", "qa-e2e", "qa-security", "qa-quality"],
  "coord-plataforma": ["plat-infra", "plat-docs", "plat-observability"],
};
for (const [coord, team] of Object.entries(times)) {
  const raw = read(`agents/${coord}.md`) || "";
  // igualdade de conjuntos (nao presence-only): extrai TODOS os task allow e compara
  const allowed = [...raw.matchAll(/"([a-z0-9-]+)":\s*allow/g)]
    .map((m) => m[1])
    .filter((n) => AGENTS.includes(n) && n !== coord)
    .sort();
  const esperado = [...team].sort();
  if (JSON.stringify(allowed) !== JSON.stringify(esperado)) {
    const extra = allowed.filter((n) => !team.includes(n));
    const faltando = team.filter((n) => !allowed.includes(n));
    erro(`${coord} allow divergente (extra: ${extra.join(",") || "-"} | faltando: ${faltando.join(",") || "-"})`);
  } else ok(`${coord} -> ${team.length} workers autorizados (exatos)`);
}

// ---------- CHECK 4: workers edit-scoped ----------
console.log("\n[4] workers (edit-scoped)");
const workers = AGENTS.filter((a) => !a.startsWith("coord-") && !PRIMARY.includes(a));
const editBloco = (raw) => (raw.match(/permission:[\s\S]{0,600}?edit:\s*\r?\n((?:[ \t]+"[^"]+":\s*\w+\r?\n)+)/) || [])[1] || "";
const errsAntesDoCheck4 = erros;
for (const w of workers) {
  const raw = read(`agents/${w}.md`) || "";
  const eb = editBloco(raw);
  const editInlineDeny = /^\s*edit:\s*deny\s*$/m.test(raw);
  if (SW_WORKERS.test(w)) {
    if (!eb) { erro(`${w}: nao consegui isolar o bloco edit`); continue; }
    // workers de software escrevem no codigo do projeto, mas NUNCA no contrato unico nem fazem push
    // (aceita `"*": deny` no bloco edit — read-only total — ou escopo aberto com deny explicito em API.md)
    const readOnlyTotal = /"\*":\s*deny/.test(eb);
    if (!readOnlyTotal && !/"API\.md":\s*deny/.test(eb)) erro(`${w}: sem protecao de API.md no bloco edit`);
    // anti-escala de privilegio (so para quem tem edit amplo): nao pode reescrever agents/ nem a config
    if (!readOnlyTotal) {
      if (!/"agents\/\*":\s*deny/.test(eb)) erro(`${w}: sem deny em agents/* (escala de privilegio)`);
      if (!/"scripts\/\*":\s*deny/.test(eb)) erro(`${w}: sem deny em scripts/* (escala de privilegio)`);
      if (!/"opencode\.jsonc":\s*deny/.test(eb)) erro(`${w}: sem deny em opencode.jsonc`);
      if (!/"\.git\/\*":\s*deny/.test(eb)) erro(`${w}: sem deny em .git/* (hooks)`);
      if (!/"\.github\/\*":\s*deny/.test(eb)) erro(`${w}: sem deny em .github/* (workflows)`);
    }
    if (!/"git push\*":\s*deny/.test(raw)) erro(`${w}: sem deny em git push`);
  } else if (editInlineDeny) {
    // edit negado em linha unica = escopo fechado total
  } else if (!eb || !/"\*":\s*deny/.test(eb)) {
    erro(`${w}: sem deny no wildcard do bloco edit`);
  }
}
if (erros === errsAntesDoCheck4) ok(`${workers.length} workers com escopo de edicao restrito (checado no bloco edit)`);

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
// parse real do JSONC (remove // comentarios de linha) — sem isso, quebra silencioso no runtime
try {
  const parsed = JSON.parse(cfg.replace(/^\s*\/\/.*$/gm, ""));
  ok(`opencode.jsonc parseia (JSON valido, ${Object.keys(parsed).length} chaves raiz)`);
  const ge = parsed?.permission?.edit;
  if (ge && typeof ge === "object") {
    for (const d of ["agents/*", "scripts/*", "opencode.jsonc", ".git/*", ".github/*", ".env"]) {
      if (ge[d] === "deny") ok(`grant global edit deny: ${d}`);
      else erro(`grant global edit sem deny: ${d} (base segura dos gates 4-5)`);
    }
  } else erro("permission.edit do opencode.jsonc nao e mapa com denies de governanca");
} catch (e) { erro(`opencode.jsonc invalido: ${e.message}`); }
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

// ---------- CHECK 14: segredos (docs/templates/commands/evals/scripts — NAO agents/ nem skills/) ----------
console.log("\n[14] segredos (fora de agents/ e skills/)");
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
if (!secretHits) ok(`sem segredos em ${secretScope.length} arquivos (agents/ e skills/ pulados p/ falso-positivo)`);
if (existsSync(join(ROOT, ".env"))) erro(".env presente no repo (deve estar fora do git)");
else ok(".env fora do repo");

// ---------- CHECK 15: encoding (mojibake UTF-8 mal decodificado) ----------
console.log("\n[15] encoding (mojibake)");
const MOJI = /Ã[\x80-\xbf]|â€|Â[\x80-\xbf]/;
let mojiHits = 0;
for (const f of walk("docs", (r) => r.endsWith(".md"))
  .concat(walk("templates", (r) => r.endsWith(".md")), walk("commands", (r) => r.endsWith(".md")),
          walk("evals", (r) => r.endsWith(".md")), walk("agents", (r) => r.endsWith(".md")))) {
  const raw = read(f) || "";
  const m = raw.match(MOJI);
  if (m) { erro(`${f}: mojibake/encoding (${m[0]}...)`); mojiHits++; }
}
if (!mojiHits) ok("sem mojibake (UTF-8 integro em docs/templates/commands/evals/agents)");

// ---------- CHECK 16: links relativos resolvem p/ arquivo existente ----------
console.log("\n[16] links relativos");
const LINK = /\]\((\.{1,2}\/[^)#\s]+)\)/;
let linkHits = 0;
let linkTotal = 0;
for (const f of walk("docs", (r) => r.endsWith(".md")).concat(walk("commands", (r) => r.endsWith(".md")))) {
  const raw = read(f) || "";
  for (const [, rel] of raw.matchAll(new RegExp(LINK.source, "g"))) {
    linkTotal++;
    const alvo = join(dirname(join(ROOT, f)), rel);
    if (!existsSync(alvo)) { erro(`${f}: link quebrado -> ${rel}`); linkHits++; }
  }
}
if (!linkHits) ok(`${linkTotal} links relativos resolvem para arquivos existentes`);

// ---------- resumo ----------
console.log(`\n== RESULTADO: ${erros} ERRO(S), ${avisos} AVISO(S) ==`);
if (erros > 0) { console.log("STATUS: REPROVADO\n"); process.exit(1); }
console.log("STATUS: VERDE\n");
