#!/usr/bin/env node
// gen-report-estudos.mjs — gera relatorio mensal de estudos por tema
// Uso: node scripts/gen-report-estudos.mjs <tema> [YYYY-MM]
// Le docs/estudos/<tema>/ e emite relatorio-YYYY-MM.md

import { readFileSync, existsSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname, relative as pathRelative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const tema = process.argv[2];
const hoje = new Date();
const periodo = process.argv[3] || `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

if (!tema) { console.error("Uso: node scripts/gen-report-estudos.mjs <tema> [YYYY-MM]"); process.exit(1); }

const dir = join(ROOT, "docs", "estudos", tema);
if (!existsSync(dir)) { console.error(`Tema nao encontrado: ${dir}`); process.exit(1); }

// disclaimer com path relativo calculado pela profundidade do tema (aceita subpastas: enem/<area>/<tema>)
const disclaimerRel = pathRelative(dir, join(ROOT, "docs", "estudos", "disclaimer.md")).split("\\").join("/");

const ler = (f) => (existsSync(join(dir, f)) ? readFileSync(join(dir, f), "utf8") : "");
const plano = ler("PLANO-ESTUDOS.md");
const progresso = ler("progresso.md");

// conta quizzes e status
const arquivos = readdirSync(dir).filter((f) => f.endsWith(".md"));
const quizzes = arquivos.filter((f) => f.startsWith("quiz-"));
const gabaritos = arquivos.filter((f) => f.startsWith("gabarito-"));

const linhasProgresso = (progresso.match(/^\|/gm) || []).length;
const modulosConcluidos = (plano.match(/\|\s*concluido/gi) || []).length;
const modulosPendentes = (plano.match(/\|\s*pendente/gi) || []).length;

const relatorio = `# Relatorio de estudos — ${tema} (${periodo})

> Conteudo educacional. Ver [disclaimer](${disclaimerRel}).

## Resumo
- Quizzes: ${quizzes.length} | Gabaritos: ${gabaritos.length}
- Modulos concluidos: ${modulosConcluidos} | pendentes: ${modulosPendentes}
- Registros de progresso: ${linhasProgresso}
- Arquivos na trilha: ${arquivos.length}

## Progresso (extrato)
${(progresso || "_sem progresso registrado_").replace(/^# (.*)$/gm, "### $1")}

## Proximos passos
- Revisao espacada pendente (recall, nunca releitura).
- Quiz com score < 70% = \`BLOQUEADO + reaprendizagem\`.

_Gerado por scripts/gen-report-estudos.mjs em ${new Date().toISOString()}_
`;

const out = join(dir, `relatorio-${periodo}.md`);
writeFileSync(out, relatorio, "utf8");
console.log(`[gen-report-estudos] OK -> ${out}`);
