# /revisar — revisao semanal executiva (5 linhas por dominio)

> Conteudo educacional. Nao e recomendacao de investimento. Ver [Aviso educacional — disclaimer](../docs/ganhos/disclaimer.md). Questoes oficiais so INEP. Ver [disclaimer estudos](../docs/estudos/disclaimer.md).

Invoca `life-orchestrator` -> delega em PARALELO a `coord-estudos` + `coord-ganhos` (+ `coord-backend` se houver `PLANO.md` ativo) para consolidar a semana.

## Fluxo

1. Cada coord devolve NO MAXIMO 5 LINHAS: (1) numero do periodo, (2) o que avancou, (3) 1 bloqueio, (4) proxima acao da semana, (5) evidencia (arquivo/data).
2. O primario monta `docs/<dominio>/<trilha>/relatorio-semanal-YYYY-Www.md` consolidado (opcional, so se o usuario pedir arquivo).
3. Resposta padrao: 5 linhas por dominio, no maximo 15 linhas no total + link para relatorio mensal completo.

Uso: `/revisar` (semana atual) — `/revisar 2026-W42`.

## Regras duras

- NUNCA reempacote o relatorio mensal inteiro: 5 linhas = 5 linhas (evals E20 estudos / E22 ganhos).
- Metricas com fonte+data; sem fonte = `nao confirmado`.
- Sem promessa de lucro; nota TRI/redacao = conceito/C1-C5, nunca "nota do ENEM".
