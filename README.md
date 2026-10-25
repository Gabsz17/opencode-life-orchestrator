# Life Orchestrator — modo unificado Estudos + Grana (OpenCode)

> **Estudos**: conteudo educacional. Sem banco pago, sem questao falsa INEP. Ver [`docs/estudos/disclaimer.md`](docs/estudos/disclaimer.md).
> **Ganhos**: nao e recomendacao de investimento. Ha risco de perda. Sem promessa de lucro. Ver [`docs/ganhos/disclaimer.md`](docs/ganhos/disclaimer.md).

Um so agente primary (`life-orchestrator`) gerencia dois dominios — **Estudos (ENEM)** e **Grana (mercado/negocios/trends)** — roteando automaticamente para o coord certo conforme a necessidade.

## Arquitetura

```
life-orchestrator (primary)
├── coord-estudos   → 8 workers (teoria, ENEM, pratica, avaliacao)
├── coord-ganhos    → 8 workers (mercado, negocios, trends, risco)
├── coord-pesquisa  → web-researcher, web-operator   (compartilhado)
├── coord-qualidade → qa-unit, qa-contrato, qa-e2e, qa-security, qa-quality (compartilhado)
└── coord-plataforma→ plat-infra, plat-docs, plat-observability (compartilhado)
```

Coords especializados isolam cada dominio; coords compartilhados (pesquisa, qualidade, plataforma) servem aos dois.

## Comandos

### Estudos
| Comando | Uso |
|---------|-----|
| `/estudar <tema> [nivel]` | trilha de estudos completa |
| `/estudar-enem <area> <tema>` | trilha ENEM (questoes INEP, slides Marp, simulados) |
| `/estudar-relatorio <tema> [YYYY-MM]` | relatorio mensal |

### Grana
| Comando | Uso |
|---------|-----|
| `/ganhar <objetivo> [capital] [h/sem] [risco]` | PLANO-GANHO (9 secoes) |
| `/ganhar-diario <objetivo>` | rotina diaria (1 acao + risco) |
| `/ganhar-trends <objetivo> [fonte]` | matriz trends do dia (score 0-100) |
| `/ganhar-relatorio <objetivo> [YYYY-MM]` | relatorio mensal |
| `/ganhar-backup <objetivo>` | backup tar.gz |

## Rodar

```bash
npm run validate           # validacao estrutural (14 checks)
npm run fetch-trends       # coleta trends 7 fontes (cache 24h)
npm run gen-report-estudos <tema> [YYYY-MM]
npm run gen-report-ganhos  <objetivo> [YYYY-MM]
npm run backup <estudos|ganhos> <nome>
npm run restore <estudos|ganhos> <nome> <arquivo.tar.gz>
npm run sync-memory        # promove inbox -> MEMORIA.md
```

Requisito: Node >= 18.

## Regras duras (resumo)

- **Grana**: sem promessa de lucro, sem recomendacao personalizada; cotacao/trend **sempre data+fonte**; sem fonte = `nao confirmado`; eleicoes 2026 = sensivel (`base_legal` obrigatorio: Lei 9.504/97 + Res. TSE 23.610/2019).
- **Estudos**: questoes oficiais **so INEP** (ano+caderno/cor+n+link); TRI so conceito; redacao C1-C5 sem nota oficial; `pratica-intercalada`, `recall-ativo`, `repeticao-espacada`.
- **Comuns**: sem segredo no repo (so `{env:NOME}`, `.env` fora do git); sem PII; disclaimer linkado no topo de todo doc.

## Estrutura

Consulte o frontmatter de [`agents/life-orchestrator.md`](agents/life-orchestrator.md) para o mapeamento completo e [`evals/`](evals/) para os comportamentos validados (estudos 15, ganhos 19).

## Licenca

MIT — ver [`LICENSE`](LICENSE).
