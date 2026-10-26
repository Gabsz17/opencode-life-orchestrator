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
if (!/^[\w-]+$/.test(nome)) { console.error(`Nome invalido: "${nome}" (use letras/numeros/-/_)`); process.exit(1); }
if (!/\.(tar\.gz|tgz)$/.test(arquivo)) { console.error(`Arquivo invalido: "${arquivo}" (esperado .tar.gz ou .tgz)`); process.exit(1); }
if (!existsSync(arquivo)) { console.error(`Backup nao encontrado: ${arquivo}`); process.exit(1); }
let _membros = [];
try { _membros = execFileSync("tar", ["-tzf", arquivo], { encoding: "utf8" }).split(/\r?\n/).filter(Boolean); }
catch (e) { console.error(`Backup ilegivel (tar): ${e.message}`); process.exit(1); }
// anti path traversal: TODO membro precisa ficar sob <nome>/ (sem "..", sem absoluto)
const _fora = _membros.find((m) => m.includes("..") || m.startsWith("/") || !(m === nome || m === `${nome}/` || m.startsWith(`${nome}/`)));
if (_fora) { console.error(`Membro fora de "${nome}": "${_fora}" — restore abortado`); process.exit(1); }

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
