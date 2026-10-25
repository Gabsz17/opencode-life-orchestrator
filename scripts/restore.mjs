#!/usr/bin/env node
// restore.mjs — restaura backup tar.gz para docs/<dominio>/<nome>
// Uso: node scripts/restore.mjs <estudos|ganhos> <nome> <caminho.tar.gz>

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const [dominio, nome, arquivo] = process.argv.slice(2);

if (!dominio || !["estudos", "ganhos"].includes(dominio) || !nome || !arquivo) {
  console.error("Uso: node scripts/restore.mjs <estudos|ganhos> <nome> <arquivo.tar.gz>");
  process.exit(1);
}
if (!existsSync(arquivo)) { console.error(`Backup nao encontrado: ${arquivo}`); process.exit(1); }

const dest = join(ROOT, "docs", dominio);
mkdirSync(dest, { recursive: true });

try {
  execFileSync("tar", ["-xzf", arquivo, "-C", dest], { stdio: "inherit" });
  console.log(`[restore] OK -> ${dest}/${nome} (de ${basename(arquivo)})`);
  console.log("[restore] Confira os arquivos antes de commitar (git diff).");
} catch (e) {
  console.error(`[restore] falhou: ${e.message}`);
  process.exit(1);
}
