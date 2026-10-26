# /dia — digest do dia (estudos + grana + trends)

> Conteudo educacional. Nao e recomendacao de investimento. Ver [Aviso educacional — disclaimer](../docs/ganhos/disclaimer.md). Questoes oficiais so INEP. Ver [disclaimer estudos](../docs/estudos/disclaimer.md).

Invoca `life-orchestrator` -> `coord-plataforma` roda `npm run digest` e os coords de dominio interpretam `docs/digest/YYYY-MM-DD.md`.

## Fluxo

1. Rode `npm run digest` (script `gen-digest.mjs`) — le `progresso.md` das trilhas + cache de trends do dia.
2. Apresente em ORDEM: (a) prioridades de hoje (revisoes HOJE/ATRASADAS primeiro), (b) tabela de estudos, (c) tabela de grana, (d) trends com score > 0 (com fonte + data; cache velho = avise "rode fetch-trends"), (e) software.
3. No maximo 12 linhas + link pro digest completo. Uma acao sugerida por dominio, nunca lista gigante.
4. Sem trilha? Proponha criar a primeira (rota `/estudar` ou `/ganhar`) em 1 frase.

Uso: `/dia` (hoje) — `/dia 2026-10-25` (data especifica).

## Regras duras

- Trends SEMPRE com fonte + data; cache anterior ao dia = `atualizado em <data>`, nunca presente como "hoje".
- Sem promessa de lucro, sem recomendacao personalizada, sem PII/saldo no digest.
- Disclaimer linkado no topo do digest (o script ja inclui).
