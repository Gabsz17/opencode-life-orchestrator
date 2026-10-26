#!/usr/bin/env node
// backup.mjs — backup zipado (tar.gz) de uma trilha (estudos ou ganhos)
// Uso: node scripts/backup.mjs <estudos|ganhos> <nome>
// Saida: backups/<nome>-backup-<ts>.tar.gz   (fora do git)

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const [dominio, nome] = process.argv.slice(2);

if (!dominio || !["estudos", "ganhos"].includes(dominio) || !nome) {
  console.error("Uso: node scripts/backup.mjs <estudos|ganhos> <nome>");
  process.exit(1);
}
if (!/^[\w-]+$/.test(nome)) { console.error(`Nome invalido: "${nome}" (use letras/numeros/-/_)`); process.exit(1); }

const src = join(ROOT, "docs", dominio, nome);
if (!existsSync(src)) { console.error(`Trilha nao encontrada: ${src}`); process.exit(1); }

const outDir = join(ROOT, "backups");
mkdirSync(outDir, { recursive: true });
const ts = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
const out = join(outDir, `${nome}-backup-${ts}.tar.gz`);

try {
  execFileSync("tar", ["-czf", out, "-C", join(ROOT, "docs", dominio), nome], { stdio: "inherit" });
  console.log(`[backup] OK -> ${out}`);
} catch (e) {
  console.error(`[backup] falhou: ${e.message}`);
  process.exit(1);
}
