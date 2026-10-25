# PLANO-GANHO — exemplo-renda-extra (renda extra 2k)

> Conteudo educacional. Nao e recomendacao de investimento. Ha risco de perda. Ver [disclaimer](../disclaimer.md). Sem promessa de lucro.

## 1. Objetivo SMART
- Objetivo: montar 2 fontes de renda extra educacionais validadas em 90 dias (freela digital + produto digital).
- Pronto quando: matriz completa com fonte+data e 1 validacao real por trilha.

## 2. Capital tempo risco
- Capital: faixa `ate-1k` (nunca saldo exato).
- Tempo: 8 h/semana.
- Risco declarado: `medio`.
- Reserva de emergencia: sim (sem numeros de conta).

## 3. Trilhas paralelas
| Trilha | Responsavel | Entrega | Status |
|--------|-------------|---------|--------|
| mercado | coord-ganhos -> mercado-* | matriz + fontes BCB/CVM | pendente |
| negocios | coord-ganhos -> negocio-* | matriz + validacao SEBRAE | em curso |
| risco | coord-ganhos -> risco-gestao | parecer + diario | pendente |
| trends | coord-ganhos -> trends-research | matriz trends + cache 24h | pendente |

## 4. Matriz oportunidade
| # | Oportunidade | Custo est. | Retorno est. | Risco | Tempo | Validado (fonte+data) | Status |
|---|--------------|------------|--------------|-------|-------|------------------------|--------|
| 1 | Freela design/automacao | ate-1k | educacao por hora/pacote (sem promessa) | medio | semanas | SEBRAE 2026-10-25 | pendente |
| 2 | Template/produto digital | ate-1k | educacao por unidade (sem promessa) | alto | meses | `nao confirmado` | pendente |

## 5. Gestao risco + compliance
- Stop educacional: sem aportes novos em 1 trilha se 3 validacoes falharem seguidas (sem ordem automatica).
- Diversificacao: no maximo 50% do esforco em 1 trilha.
- Vedações: sem insider, sem piramide, sem bypass paywall/ToS.
- Eleicoes 2026: `nao aplicado` (sem `eleitoral=true`).

## 6. Rotina
- Diaria: `/ganhar-diario renda-extra-2k` (1 acao + risco, data+fonte).
- Trends: `/ganhar-trends renda-extra-2k all`.
- Semanal: revisao matriz + stop + trends.

## 7. Metricas + diario
- Horas aplicadas/semana, n oportunidades validadas, trends capturados. Diario: `diario.md`.

## 8. Disclaimer
- Educativo, sem recomendacao, sem promessa lucro. Decisoes do usuario. Fontes oficiais; sem fonte = `nao confirmado`. Chaves so via env (`{env:NOME}`); `.env` fora do git; PII/saldo/CPF nunca entram.

## 9. Trends e oportunidades do momento
### 9.1 Matriz trends do dia
| Rank | Topico | Fonte | Volume 24h | Score | Saturacao | Aderencia | Status |
|------|--------|-------|------------|-------|-----------|-----------|--------|
| 1 | templates IA para freela | Google Trends BR | 12.000 | 68 | media | alta | validar |

### 9.2 Rotina diaria trends
- Acao trends do dia: validar topico 1 com fonte oficial.
- Risco trends: saturacao media + vies recencia.

### 9.3 Integracao com trilhas
- Trends -> negocios: nicho trend = produto/servico a testar.
