# PLANO-GANHO.md — template do plano financeiro educacional (Ganha)

> Copie para `docs/ganhos/<objetivo>/PLANO-GANHO.md`. `life-orchestrator` dono da trilha. Mudancas via relatorio (single-writer).
> **EDUCACIONAL**: sem promessa lucro, sem recomendacao personalizada, sem insider/piramide. Sem fonte = `nao confirmado`. Cotacao/relatorio sempre data+fonte.

## 1. Objetivo SMART financeiro
- Objetivo (especifico, mensuravel, atingivel, relevante, temporal):
- Criterio de pronto do plano:
- Capital inicial (faixa, nunca saldo/conta real):
- Horas/semana disponiveis:
- Horizonte (curto/medio/longo + data-alvo):

## 2. Capital tempo risco
- Capital disponivel (faixa: `ate-1k|1k-5k|5k-20k|20k+`; nunca valor exato/conta):
- Tempo disponivel (horas/semana + rotina):
- Tolerancia risco declarada (`baixo|medio|alto`):
- Reserva emergencia antes de investir (sim/nao + onde, sem numeros conta):
- Endividamento atual impede risco? (sim/nao + plano):

## 3. Trilhas paralelas mercado + negocios + trends
| Trilha | Responsavel | Entrega | Status |
|--------|-------------|---------|--------|
| mercado (renda variavel/fixa, cotacao educacional) | `coord-ganhos` -> mercado-* | matriz + fontes BCB/CVM/B3/Tesouro | pendente |
| negocios (renda extra/servicos/produtos) | `coord-ganhos` -> negocio-* | matriz + validacao SEBRAE/gov.br | pendente |
| risco (stop educacional, diversificacao, compliance) | `coord-ganhos` -> risco-gestao | parecer + diario | pendente |
| trends (tendencias tempo real, score 0-100) | `coord-ganhos` -> trends-research | matriz trends + cache 24h | pendente |

## 4. Matriz oportunidade custo retorno risco tempo validado + trends
> Uma linha por oportunidade validada. Sem recomendacao: matriz compara, usuario decide.
| # | Oportunidade | Custo est. | Retorno est. | Risco | Tempo | Validado (fonte+data) | Status |
|---|--------------|------------|--------------|-------|-------|------------------------|--------|
| 1 | ... | ... | ... (educacao, sem promessa) | baixo\|medio\|alto | dias\|semanas\|meses\|longo-prazo | ex. BCB 2026-10-25 / `nao confirmado` | pendente |

## 5. Gestao risco stop-loss diversificacao + compliance eleitoral
- Regra stop-loss educacional (% max perda posicao/mes, sem ordem auto):
- Diversificacao (max % por ativo/trilha; nunca tudo em 1):
- Vedações: sem insider, sem piramide, sem alavancagem sem entender, sem bypass paywall/ToS:
- Eleicoes 2026: `base_legal` obrigatorio (Lei 9.504/97 + Res. TSE 23.610/2019) se `eleitoral=true`:
- Gatilho pausa (`BLOQUEADO: <motivo> + <o que falta> + <proximo passo>`):

## 6. Rotina diaria semanal + trends
- Diaria (`/ganhar-diario`: 1 acao + risco do dia, data+fonte):
- Diaria trends (`/ganhar-trends`: 1 trend + acao trends + risco trends, score 0-100):
- Semanal (revisao matriz + stop-loss + diversificacao + trends + proxima semana):
- Plano 30/60/90 dias (marcos + criterio parada por fase):
- Registro: `diario.md` (fatos, sem PII financeira):

## 7. Metricas + diario
- Metricas (taxa poupanca %/mes, horas aplicadas, n oportunidades validadas, drawdown educacional, trends capturados):
- Diario (`diario.md`: data, o que fez, fonte, aprendeu, proximo passo):
- Revisao mensal (o que funcionou/nao + ajuste SMART):

## 8. Disclaimer
- Material educacional, nao recomendacao investimento, sem promessa lucro, sem garantia resultado. Decisoes = usuario, conta e risco.
- Fontes oficiais: BCB, CVM, B3, Tesouro, gov.br/SEBRAE. Corretora/exchange so referencia operacional.
- Sem segredo repo: chaves so via env (`{env:NOME}`), `.env` fora do git. Dados sensiveis (CPF, saldo, chave) nunca entram.
- Duvida regulatoria/tributaria -> contador certificado + fonte oficial, `nao confirmado` ate la.

## 9. Trends e oportunidades do momento
> Cache JSON 24h `docs/ganhos/trends-cache/YYYY-MM-DD.json`. Score 0-100 educacional (volume*0.4 + velocidade*0.3 + aderencia*0.3). Saturacao: alta|media|baixa. Fonte+data obrigatorios. Sem fonte = `nao confirmado`.

### 9.1 Matriz trends do dia
| Rank | Topico | Fonte | Volume 24h | Score | Saturacao | Aderencia | Status |
|------|--------|-------|------------|-------|-----------|-----------|--------|
| 1 | ... | ... | ... | ... | alta\|media\|baixa | alta\|media\|baixa | validar\|nao confirmado |

### 9.2 Rotina diaria trends
- `/ganhar-trends <objetivo> [fonte]` -> atualiza `trends.md` + `progresso.md` + `oportunidades.md`
- Acao trends do dia: 1 `TrendOportunidade` validada + criterio parada
- Risco trends: saturacao + vies recencia + mudanca rapida algoritmo
- Alerta saturacao: se score >70 E saturacao=alta -> aguardar ou diferenciar nicho

### 9.3 Integracao com trilhas
- Trends -> mercado: setor quente = setor alocar (ex: IA -> tech, educacao -> edtech)
- Trends -> negocios: nicho trend = produto/servico testar (ex: Micro-SaaS -> template Notion)
- Trends -> risco: saturacao alta = reduzir exposicao / diversificar