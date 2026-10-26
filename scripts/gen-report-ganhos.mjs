#!/usr/bin/env node
// gen-report-ganhos.mjs — gera relatorio mensal de ganhos por objetivo
// Uso: node scripts/gen-report-ganhos.mjs <objetivo> [YYYY-MM]
// EDUCACIONAL: sem recomendacao, sem promessa de lucro; fonte+data obrigatorios.

import { readFileSync, existsSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname, relative as pathRelative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const objetivo = process.argv[2];
const hoje = new Date();
const periodo = process.argv[3] || `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

if (!objetivo) { console.error("Uso: node scripts/gen-report-ganhos.mjs <objetivo> [YYYY-MM]"); process.exit(1); }
if (!/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(objetivo)) { console.error(`Objetivo invalido: "${objetivo}" (letras/numeros/-/_; subpastas com /; sem ".." nem \\)`); process.exit(1); }
if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(periodo)) { console.error(`Periodo invalido: "${periodo}" (esperado YYYY-MM)`); process.exit(1); }

const dir = join(ROOT, "docs", "ganhos", objetivo);
if (!existsSync(dir)) { console.error(`Objetivo nao encontrado: ${dir}`); process.exit(1); }

// disclaimer com path relativo calculado pela profundidade do objetivo
const disclaimerRel = pathRelative(dir, join(ROOT, "docs", "ganhos", "disclaimer.md")).split("\\").join("/");

const ler = (f) => (existsSync(join(dir, f)) ? readFileSync(join(dir, f), "utf8") : "");
const plano = ler("PLANO-GANHO.md");
const progresso = ler("progresso.md");
const trends = ler("trends.md");

const arquivos = readdirSync(dir).filter((f) => f.endsWith(".md"));
const naoConfirmados = ((plano + progresso + trends).match(/nao confirmado/gi) || []).length;
const linhasProgresso = (progresso.match(/^\|/gm) || []).length;

const relatorio = `# Relatorio de ganhos — ${objetivo} (${periodo})

> Conteudo educacional. Nao e recomendacao de investimento. Ha risco de perda. Sem promessa de lucro. Ver [disclaimer](${disclaimerRel}).

## Resumo
- Registros de progresso: ${linhasProgresso}
- Itens \`nao confirmado\` (sem fonte): ${naoConfirmados}
- Arquivos da trilha: ${arquivos.length}
- Trends registrados: ${trends ? "sim" : "nao"}

## Progresso (extrato)
${(progresso || "_sem progresso registrado_").replace(/^# (.*)$/gm, "### $1")}

## Proximos passos
- Validar itens \`nao confirmado\` com fonte oficial + data.
- Revisao semanal: matriz + stop educacional + diversificacao + trends.

## Aviso
Comparacao educacional entre alternativas. A decisao e do usuario, junto com custos, impostos e riscos.

_Gerado por scripts/gen-report-ganhos.mjs em ${new Date().toISOString()}_
`;

const out = join(dir, `relatorio-${periodo}.md`);
writeFileSync(out, relatorio, "utf8");
console.log(`[gen-report-ganhos] OK -> ${out}`);
