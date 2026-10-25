# Ganhos — como usar

> Conteudo educacional. Nao e recomendacao de investimento. Ha risco de perda. Sem promessa de lucro. Ver [Aviso educacional — disclaimer](disclaimer.md).

## Inicio rapido
1. `/ganhar <objetivo> [capital] [h/sem] [risco]` — cria PLANO-GANHO + delega mercado/negocios/risco/trends.
2. `/ganhar-trends <objetivo> [fonte]` — matriz trends do dia (score 0-100).
3. `/ganhar-diario <objetivo>` — rotina diaria (1 acao + risco).
4. `/ganhar-relatorio <objetivo> [YYYY-MM]` — relatorio mensal.
5. `/ganhar-backup <objetivo>` — backup zipado.

## Estrutura por objetivo
| Arquivo | Conteudo | Quem atualiza |
|---------|----------|---------------|
| `PLANO-GANHO.md` | SMART + matriz + risco + trends (9 secoes) | life-orchestrator via coord-ganhos |
| `progresso.md` | estado, metricas, proxima acao | life-orchestrator |
| `oportunidades.md` | matriz Oportunidade/TrendOportunidade | coord-ganhos |
| `trends.md` | matriz trends do dia (score/saturacao) | trends-research |
| `diario.md` | fatos diarios sem PII financeira | aluno/coord-ganhos |
| `relatorio-YYYY-MM.md` | relatorio mensal | gen-report-ganhos.mjs |

## Fontes
- [Fontes mercado (BCB, CVM, B3, Tesouro, SEBRAE, TSE)](fontes-mercado.md)
- [Fontes trends (7 fontes tempo real)](fontes-trends.md)

## Regras
- Cotacao/trend **sempre data+fonte**. Sem fonte = `nao confirmado`.
- Eleicoes 2026 = sensivel (Lei 9.504/97 + Res. TSE 23.610/2019): `base_legal` obrigatorio.
- Sem segredo no repo: chaves so via env `{env:NOME}`, `.env` fora do git.
- Cache trends 24h em `trends-cache/YYYY-MM-DD.json` (fora do git).

## Sua primeira sessao
1. Life-orchestrator le seu objetivo, capital (faixa), horas/semana e tolerancia a risco.
2. Monta matriz comparativa (custo/retorno/risco/tempo/trends) — voce decide.
3. Progresso em `progresso.md`: onde parou, metricas, proxima acao. Sem fonte = `nao confirmado`.
