#!/usr/bin/env node
// sync-memory.mjs — promove inbox -> MEMORIA.md (dedupe, teto 60, FIFO 30)
// Uso: node scripts/sync-memory.mjs
// NUNCA grava segredo/token/PII (so licoes de aprendizado).

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MEM = join(ROOT, ".opencode", "memory", "MEMORIA.md");
const INBOX = join(ROOT, ".opencode", "memory", "inbox");

const TETO_TOTAL = 60;
const TETO_RECENTES = 30;

const mem = existsSync(MEM) ? readFileSync(MEM, "utf8") : "# MEMORIA — Life Orchestrator\n\n## Regras permanentes\n\n## Recentes\n";
const linhasMem = new Set(mem.split(/\r?\n/).filter((l) => l.startsWith("- ")));

// coleta itens dos inboxes
const novos = [];
if (existsSync(INBOX)) {
  for (const f of readdirSync(INBOX).filter((x) => x.endsWith(".md"))) {
    const raw = readFileSync(join(INBOX, f), "utf8");
    for (const l of raw.split(/\r?\n/)) {
      const item = l.trim();
      if (item.startsWith("- ") && item.length > 5) novos.push(item);
    }
  }
}

const dedup = novos.filter((n) => !linhasMem.has(n));
if (dedup.length === 0) {
  console.log("[sync-memory] nada novo para promover.");
  process.exit(0);
}

// insere em "## Recentes"
const idx = mem.indexOf("## Recentes");
let out = mem;
if (idx !== -1) {
  const antes = mem.slice(0, idx + "## Recentes".length);
  let resto = mem.slice(idx + "## Recentes".length);
  const linhasResto = resto.split(/\r?\n/);
  const existentes = linhasResto.filter((l) => l.startsWith("- "));
  const combinadas = [...dedup, ...existentes].slice(0, TETO_RECENTES);
  // reescrita das recentes
  const novasLinhasResto = ["", ...combinadas.map((c) => c)];
  const restoLimpo = linhasResto.filter((l) => !l.startsWith("- ") && l.trim() !== "");
  out = antes + novasLinhasResto.join("\n") + "\n" + restoLimpo.join("\n");
} else {
  out = mem + "\n## Recentes\n" + dedup.map((d) => d).join("\n") + "\n";
}

// teto global (remove excedentes de "- " fora de Regras permanentes — best effort)
const totalItens = (out.match(/^\s*- \[|^\s*- /gm) || []).length;
if (totalItens > TETO_TOTAL) console.log(`[sync-memory] AVISO: ${totalItens} itens (teto ${TETO_TOTAL}) — considere podar manualmente.`);

writeFileSync(MEM, out, "utf8");
console.log(`[sync-memory] OK: ${dedup.length} item(ns) promovido(s) de ${novos.length} coletado(s).`);
