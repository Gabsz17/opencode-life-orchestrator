#!/usr/bin/env node
// validate.mjs — validacao estrutural Life Orchestrator (Estudos + Grana + shared)
// Uso: node scripts/validate.mjs   (ou: npm run validate)
// Saida: OK/AVISO/ERRO por check. Exit code 1 se houver ERRO.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
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
const CMDS = ["estudar", "estudar-enem", "estudar-revisao", "estudar-relatorio", "dia", "revisar",
  "ganhar", "ganhar-diario", "ganhar-trends", "ganhar-relatorio", "ganhar-backup"];
const ROTA = {
  "estudar": ["life-orchestrator", "coord-estudos"],
  "estudar-enem": ["life-orchestrator", "coord-estudos"],
  "estudar-revisao": ["life-orchestrator", "coord-estudos"],
  "estudar-relatorio": ["life-orchestrator", "coord-estudos"],
  "dia": ["life-orchestrator", "coord-plataforma"],
  "revisar": ["life-orchestrator", "coord-estudos", "coord-ganhos"],
  "ganhar": ["life-orchestrator", "coord-ganhos"],
  "ganhar-diario": ["life-orchestrator", "coord-ganhos"],
  "ganhar-trends": ["life-orchestrator", "coord-ganhos"],
  "ganhar-relatorio": ["life-orchestrator", "coord-ganhos"],
  "ganhar-backup": ["life-orchestrator", "coord-ganhos"],
};
let cmdsOk = 0;
for (const c of CMDS) {
  const raw = read(`commands/${c}.md`);
  if (!raw) { erro(`commands/${c}.md ausente`); continue; }
  const linhaInv = raw.split(/\r?\n/).find((l) => l.startsWith("Invoca")) || "";
  const faltando = ROTA[c].filter((r) => !linhaInv.includes(r));
  if (faltando.length) erro(`${c}: nao referencia ${faltando.join(" + ")}`);
  const naoVazias = raw.split(/\r?\n/).filter((l) => l.trim() !== "");
  const idx = naoVazias.findIndex((l) => /\]\([^)]*disclaimer\.md\)/.test(l));
  if (idx === -1 || idx > 2) erro(`${c}: disclaimer nao e LINK nas 3 primeiras linhas (idx=${idx})`);
  if (c.startsWith("estudar") && !/estudos\/disclaimer\.md/.test(raw)) erro(`${c}: sem disclaimer estudos`);
  if (c.startsWith("ganhar") && !/ganhos\/disclaimer\.md/.test(raw)) erro(`${c}: sem disclaimer ganhos`);
  if (!faltando.length && idx !== -1 && idx <= 2) cmdsOk++;
}
if (cmdsOk === CMDS.length) ok(`${CMDS.length} comandos: rota correta + disclaimer LINK no topo`);

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
// disclaimer LINKADO no topo dos docs de conteudo (README incluido; disclaimer.md auto-excluido)
for (const dir of ["docs/estudos", "docs/ganhos"]) {
  const files = walk(dir, (r) => r.endsWith(".md") && !r.endsWith("disclaimer.md"));
  let falta = 0;
  for (const f of files) {
    const raw = read(f) || "";
    // pula frontmatter YAML (ex.: slides Marp) — o disclaimer deve abrir o CORPO
    const fm = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
    const corpo = fm ? raw.slice(fm[0].length) : raw;
    const naoVazias = corpo.split(/\r?\n/).filter((l) => l.trim() !== "");
    const idx = naoVazias.findIndex((l) => /\]\([^)]*disclaimer\.md\)/.test(l));
    if (idx === -1) { falta++; erro(`${f}: sem link de disclaimer`); }
    else if (idx > 2) { falta++; erro(`${f}: disclaimer fora do topo (3a linha nao-vazia = ${idx})`); }
  }
  if (!falta) ok(`${dir}: disclaimer LINK no topo nos ${files.length} docs`);
}
// docs compartilhados (misturam estudos+grana) tambem linkam
const sharedRaw = read("docs/shared/memoria-guia.md") || "";
if (/estudos\/disclaimer\.md/.test(sharedRaw) && /ganhos\/disclaimer\.md/.test(sharedRaw)) ok("docs/shared: linka os 2 disclaimers");
else erro("docs/shared/memoria-guia.md: sem os 2 disclaimers linkados");

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
const evalStats = [["evals/estudos.md", 21, /^## E\d+/gm], ["evals/ganhos.md", 23, /^## E\d+/gm], ["evals/software.md", 4, /^## S\d+/gm]];
for (const [f, min, pat] of evalStats) {
  const raw = read(f);
  if (!raw) { erro(`${f} ausente`); continue; }
  const n = (raw.match(pat) || []).length;
  if (n >= min) ok(`${f}: ${n} evals (min ${min})`);
  else erro(`${f}: ${n} evals (< ${min})`);
}

// ---------- CHECK 10: scripts + package.json ----------
console.log("\n[10] scripts + package.json");
let sintaxeErr = 0;
for (const s of ["validate.mjs", "fetch-trends.mjs", "gen-report-estudos.mjs", "gen-report-ganhos.mjs", "gen-digest.mjs", "backup.mjs", "restore.mjs", "sync-memory.mjs"]) {
  const p = join(ROOT, "scripts", s);
  if (!existsSync(p)) { erro(`scripts/${s} ausente`); sintaxeErr++; continue; }
  try { execFileSync(process.execPath, ["--check", p], { stdio: "pipe" }); }
  catch (e) { erro(`scripts/${s}: erro de sintaxe -> ${String(e.stderr || "").split("\n")[0]}`); sintaxeErr++; }
}
if (!sintaxeErr) ok("8 scripts passam em node --check");
const pkgRaw = read("package.json");
if (pkgRaw) {
  const pkg = JSON.parse(pkgRaw);
  for (const s of ["validate", "fetch-trends", "gen-report-estudos", "gen-report-ganhos", "digest", "backup", "restore", "sync-memory"]) {
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
if (gitignore.includes("!.env.example")) ok(".gitignore: !.env.example (negacao do par .env.*)");
else erro(".gitignore sem !.env.example (.env.example seria ignorado)");
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
const mdFiles = walk("docs", (r) => r.endsWith(".md")).concat(walk("templates", (r) => r.endsWith(".md")), walk("commands", (r) => r.endsWith(".md")), walk("evals", (r) => r.endsWith(".md")));
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
  if (m && !m[0].includes("{env:")) { erro(`${f}: possivel segredo (${m[0].slice(0, 12)}...)`); secretHits++; }
}
if (!secretHits) ok(`sem segredos em ${secretScope.length} arquivos (agents/ e skills/ pulados p/ falso-positivo)`);
// .env LOCAL e legitimo (.env.example manda criar); o erro e estar VERSIONADO ou fora do .gitignore
let gitDisp = false;
try { execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd: ROOT, stdio: "ignore" }); gitDisp = true; } catch { /* git ausente */ }
if (!gitDisp) {
  if (existsSync(join(ROOT, ".env"))) aviso(".env local presente (git indisponivel p/ confirmar ignorancia)");
  else ok(".env ausente");
} else {
  let tracked = false, ignorado = false;
  try { execFileSync("git", ["ls-files", "--error-unmatch", "--", ".env"], { cwd: ROOT, stdio: "ignore" }); tracked = true; } catch { /* nao versionado */ }
  try { execFileSync("git", ["check-ignore", "-q", "--", ".env"], { cwd: ROOT, stdio: "ignore" }); ignorado = true; } catch { /* nao ignorado */ }
  const existe = existsSync(join(ROOT, ".env"));
  if (tracked) erro(".env VERSIONADO no git (git rm --cached .env + manter no .gitignore)");
  else if (existe && !ignorado) erro(".env existe e NAO esta no .gitignore (risco de commitar segredo)");
  else if (existe) ok(".env local presente e ignorado pelo git (fora do repo)");
  else ok(".env ausente (nada para commitar)");
}

// ---------- CHECK 15: encoding (mojibake UTF-8 mal decodificado) ----------
console.log("\n[15] encoding (mojibake)");
const MOJI = /Ã[\x80-\xbf]|â€|Â[\x80-\xbf]/;
let mojiHits = 0;
for (const f of walk("docs", (r) => r.endsWith(".md"))
  .concat(walk("templates", (r) => r.endsWith(".md")), walk("commands", (r) => r.endsWith(".md")),
          walk("evals", (r) => r.endsWith(".md")), walk("agents", (r) => r.endsWith(".md")),
          walk("skills", (r) => r.endsWith(".md")), ["README.md"])) {
  const raw = read(f) || "";
  const m = raw.match(MOJI);
  if (m) { erro(`${f}: mojibake/encoding (${m[0]}...)`); mojiHits++; }
  if (raw.charCodeAt(0) === 0xfeff) { erro(`${f}: BOM (U+FEFF) no inicio do arquivo`); mojiHits++; }
  if (/param\(\$m\)|\.Value\.Replace\(/.test(raw)) { erro(`${f}: residuo de script PowerShell no conteudo`); mojiHits++; }
}
if (!mojiHits) ok("sem mojibake/BOM/residuo (UTF-8 integro em docs/templates/commands/evals/agents/skills/README)");

// ---------- CHECK 16: links relativos resolvem p/ arquivo existente ----------
console.log("\n[16] links relativos");
// cobre ./x, ../x e x.md (mesma pasta); exclui http(s)://, mailto: e ancoras puras
const LINK = /\]\((?!https?:\/\/|mailto:|#)([^)\s]+)\)/;
let linkHits = 0;
let linkTotal = 0;
for (const f of walk("docs", (r) => r.endsWith(".md")).concat(walk("commands", (r) => r.endsWith(".md")),
          walk("templates", (r) => r.endsWith(".md")), walk("evals", (r) => r.endsWith(".md")), ["README.md"])) {
  const raw = read(f) || "";
  for (const [, rel] of raw.matchAll(new RegExp(LINK.source, "g"))) {
    linkTotal++;
    const rel0 = rel.split("#")[0];
    if (!rel0) continue;
    const alvo = join(dirname(join(ROOT, f)), rel0);
    if (!existsSync(alvo)) { erro(`${f}: link quebrado -> ${rel}`); linkHits++; }
  }
}
if (!linkHits) ok(`${linkTotal} links relativos resolvem para arquivos existentes`);

// ---------- CHECK 17: skills ----------
console.log("\n[17] skills/");
const SKILLS = ["debug-sistematico", "delegacao-verificada", "explicar-para-aprender", "pratica-intercalada",
  "recall-ativo", "repeticao-espacada", "revisao-segura", "testes-eficazes"];
for (const s of SKILLS) {
  const raw = read(`skills/${s}/SKILL.md`);
  if (!raw) { erro(`skills/${s}/SKILL.md ausente`); continue; }
  const fmS = frontmatter(raw);
  if (fmS && fmS.name === s) ok(`skills/${s}`);
  else erro(`skills/${s}/SKILL.md: frontmatter name="${fmS ? fmS.name : "ausente"}" != "${s}"`);
}
const citadas = new Set();
let skillH = 0;
for (const f of walk("agents", (r) => r.endsWith(".md"))) {
  const raw = read(f) || "";
  for (const [, s] of raw.matchAll(/skills[\\/]([a-z0-9-]+)[\\/]/g)) {
    if (!SKILLS.includes(s)) { erro(`${f}: cita skill inexistente skills/${s}/`); skillH++; }
  }
  for (const s of SKILLS) if (new RegExp(`(^|[^a-z0-9-])${s}([^a-z0-9-]|$)`).test(raw)) citadas.add(s);
}
if (!skillH) ok("agents citam somente skills existentes");
for (const s of SKILLS) if (!citadas.has(s)) aviso(`skills/${s}: nao citada por nome em nenhum agent`);

// ---------- CHECK 18: paths em backtick existem ----------
console.log("\n[18] paths em backtick");
const PATHY = /^(docs|templates|commands|scripts|agents|evals|skills|\.github|\.opencode)\//;
const RAIZF = ["README.md", "package.json", "opencode.jsonc", ".env.example", "LICENSE"];
let pathH = 0, pathT = 0;
for (const f of walk("docs", (r) => r.endsWith(".md")).concat(
    walk("commands", (r) => r.endsWith(".md")), walk("agents", (r) => r.endsWith(".md")),
    walk("templates", (r) => r.endsWith(".md")), walk("evals", (r) => r.endsWith(".md")), ["README.md"])) {
  const raw = (read(f) || "").replace(/```[\s\S]*?```/g, "");
  for (const [, tok] of raw.matchAll(/`([^\`\n]+)`/g)) {
    const p = tok.trim();
    if (/[<>\*{}]/.test(p) || /YYYY|DD-|HH-/.test(p) || p.includes("|") || p.includes(" ")) continue;
    if (p.startsWith(".opencode/memory/inbox/")) continue; // arquivo criado em runtime pelo sync-memory
    if (!PATHY.test(p) && !RAIZF.includes(p)) continue;
    pathT++;
    if (!existsSync(join(ROOT, p))) { erro(`${f}: path inexistente -> ${p}`); pathH++; }
  }
}
if (!pathH) ok(`${pathT} paths em backtick existem no repo`);

// ---------- CHECK 19: cabecalho de evals coerente com o conteudo ----------
console.log("\n[19] cabecalhos de evals");
for (const [f, pat] of [["evals/estudos.md", /^## E\d+/gm], ["evals/ganhos.md", /^## E\d+/gm], ["evals/software.md", /^## S\d+/gm]]) {
  const raw = read(f);
  if (!raw) continue;
  const real = (raw.match(pat) || []).length;
  const decl = raw.match(/QA valida (\d+)\/(\d+)/);
  if (!decl) erro(`${f}: sem "QA valida N/M" no cabecalho`);
  else if (+decl[1] !== real || +decl[2] !== real) erro(`${f}: cabecalho diz ${decl[1]}/${decl[2]}, real ${real}`);
  else ok(`${f}: cabecalho ${decl[1]}/${decl[2]} == ${real} evals`);
}

// ---------- CHECK 20: invariantes de trend nos exemplos ----------
console.log("\n[20] invariantes de trend");
let invH = 0;
for (const f of walk("docs/ganhos", (r) => r.endsWith("trends.md"))) {
  const raw = read(f) || "";
  for (const line of raw.split(/\r?\n/)) {
    if (!/^\|/.test(line) || /^\|\s*[-: ]+\|/.test(line)) continue;
    const c = line.split("|").slice(1, -1).map((s) => s.trim());
    const score = parseFloat((c[5] || "").replace(/\./g, "").replace(",", "."));
    if (Number.isFinite(score) && score > 0) {
      const vol = parseFloat((c[4] || "").replace(/\./g, ""));
      if (!(vol > 0)) { erro(`${f}: score ${score} com volume "${c[4]}" (exige volume > 0)`); invH++; }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(c[3] || "")) { erro(`${f}: score ${score} com data invalida "${c[3]}"`); invH++; }
      if (!c[2] || /^nao confirmado/i.test(c[2])) { erro(`${f}: score ${score} sem fonte valida ("${c[2]}")`); invH++; }
    }
    if (/eleitoral\s*=\s*true/i.test(line) && !/base_legal/i.test(line)) { erro(`${f}: linha eleitoral=true sem base_legal`); invH++; }
  }
}
if (!invH) ok("trends: score>0 exige volume+data+fonte; eleitoral exige base_legal");

// ---------- CHECK 21: contagens do README x realidade ----------
console.log("\n[21] contagens do README");
const nAgentsR = walk("agents", (r) => r.endsWith(".md")).length;
const nCmdsR = walk("commands", (r) => r.endsWith(".md")).length;
const nSkillsR = walk("skills", (r) => r.endsWith("SKILL.md")).length;
const rd = read("README.md") || "";
let contH = 0;
const mA = rd.match(/(\d+)\s+agentes?\b/);
if (!mA || +mA[1] !== nAgentsR) { erro(`README declara "${mA ? mA[1] : "?"} agentes", real ${nAgentsR}`); contH++; }
const mc = rd.match(/(\d+)\s+comandos?\b/);
if (!mc || +mc[1] !== nCmdsR) { erro(`README declara "${mc ? mc[1] : "?"} comandos", real ${nCmdsR}`); contH++; }
const mS = rd.match(/(\d+)\s+skills?\b/);
if (!mS || +mS[1] !== nSkillsR) { erro(`README declara "${mS ? mS[1] : "?"} skills", real ${nSkillsR}`); contH++; }
const realE = [21, 23, 4].map((_, i) => ((read(["evals/estudos.md", "evals/ganhos.md", "evals/software.md"][i]) || "").match(/^## [ES]\d+/gm) || []).length);
const mE = rd.match(/estudos (\d+), ganhos (\d+), software (\d+)/);
if (!mE || +mE[1] !== realE[0] || +mE[2] !== realE[1] || +mE[3] !== realE[2]) {
  erro(`README declara evals "${mE ? mE.slice(1).join("/") : "?"}", real ${realE.join("/")}`); contH++;
}
const realChecks = ((read("scripts/validate.mjs") || "").match(/---------- CHECK \d+/g) || []).length;
const mK = rd.match(/\((\d+)\s+checks?\)/);
if (!mK || +mK[1] !== realChecks) { erro(`README declara "${mK ? mK[1] : "?"} checks", real ${realChecks}`); contH++; }
if (!contH) ok(`README: ${nAgentsR} agents + ${nCmdsR} comandos + ${nSkillsR} skills + evals ${realE.join("/")} + ${realChecks} checks conferem`);

// ---------- resumo ----------
console.log(`\n== RESULTADO: ${erros} ERRO(S), ${avisos} AVISO(S) ==`);
if (erros > 0) { console.log("STATUS: REPROVADO\n"); process.exit(1); }
console.log("STATUS: VERDE\n");
