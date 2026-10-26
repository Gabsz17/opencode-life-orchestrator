# Life Orchestrator — modo unificado Estudos + Grana (OpenCode)

> **Estudos**: conteudo educacional. Sem banco pago, sem questao falsa INEP. Ver [`docs/estudos/disclaimer.md`](docs/estudos/disclaimer.md).
> **Ganhos**: nao e recomendacao de investimento. Ha risco de perda. Sem promessa de lucro. Ver [`docs/ganhos/disclaimer.md`](docs/ganhos/disclaimer.md).

Um so agente primary (`life-orchestrator`) gerencia tres dominios — **Estudos (ENEM)**, **Grana (mercado/negocios/trends)** e **Software (projeto de codigo)** — roteando automaticamente para o coord certo conforme a necessidade.

Ha tambem dois primarios alternativos para missao focada: `orquestrador` (so software) e `mentor` (so estudos).

## Arquitetura (48 agentes: 3 primaries, 10 coords, 35 workers)

```
life-orchestrator (primary unificador — roteia pelos 3 dominios)
├── coord-estudos   → 8 workers (teoria, ENEM, pratica, avaliacao)
├── coord-ganhos    → 8 workers (mercado, negocios, trends, risco)
├── coord-frontend  → fe-pages, fe-components, fe-state, fe-a11y         (software)
├── coord-backend   → be-api, be-auth, be-domain, be-data, be-integrations (software)
├── coord-pesquisa  → web-researcher, web-operator   (compartilhado)
├── coord-qualidade → qa-unit, qa-contrato, qa-e2e, qa-security, qa-quality (compartilhado)
└── coord-plataforma→ plat-infra, plat-docs, plat-observability (compartilhado)

Primarios alternativos (mesma equipe, foco estreito):
- orquestrador → coord-frontend, coord-backend + coords compartilhados  (missao so de codigo)
- mentor       → coord-teoria, coord-pratica, coord-avaliacao + coord-pesquisa (missao so de estudos)
```

Coords especializados isolam cada dominio; coords compartilhados (pesquisa, qualidade, plataforma) servem aos tres. Os coords granulares de estudos (`coord-teoria`, `coord-pratica`, `coord-avaliacao`) pertencem ao `mentor`; o `life-orchestrator` usa `coord-estudos` (agregado) — as duas estruturas convivem sem conflito. **Regra**: 1 sessao = 1 estrutura de estudos (`life-orchestrator` -> `coord-estudos`; `mentor` -> coords granulares), nunca os dois caminhos concorrendo na mesma sessao.

## Fusao com o orquestrador (2026-10-25)

Os 32 agentes originais foram mantidos e os 16 que so existiam no orquestrador global
(`~/.config/opencode/agents`) foram copiados para ca: `orquestrador`, `mentor`,
`coord-frontend`, `coord-backend`, `coord-teoria`, `coord-pratica`, `coord-avaliacao`,
`fe-pages`, `fe-components`, `fe-state`, `fe-a11y`, `be-api`, `be-auth`, `be-domain`,
`be-data`, `be-integrations` — total **48**.

Arbitragens do contrato do orquestrador (arquivo `API.md` multi-projeto, fora deste repo) — resumo abaixo:
- `fe`/`be` mantem `temperature` 0.1-0.3 e `edit` amplo (calibracao original), porem com
  `agents/*`, `scripts/*`, `opencode.jsonc`, `.git/*`, `.github/*`, `API.md` e `git push` **negados**
  (anti-escala de privilegio, exigido pelo `validate.mjs`).
- `orquestrador` e `mentor` entram como **primarios alternativos**; `default_agent` continua
  `life-orchestrator`.
- Grants globais do `opencode.jsonc` ja negam os artefatos de governanca (base segura mesmo sem
  override por agente).

## Comandos — 11 comandos

### Estudos
| Comando | Uso |
|---------|-----|
| `/estudar <tema> [nivel]` | trilha de estudos completa |
| `/estudar-enem <area> <tema>` | trilha ENEM (questoes INEP, slides Marp, simulados) |
| `/estudar-relatorio <tema> [YYYY-MM]` | relatorio mensal |

### Digest e revisao (rotina curta)
| Comando | Uso |
|---------|-----|
| `/dia` | digest do dia: prioridades + estudos + grana + trends (`npm run digest`) |
| `/revisar` | revisao semanal executiva (5 linhas por dominio) |
| `/estudar-revisao <tema>` | revisao espacada de 10-15 min (recall) |

### Grana
| Comando | Uso |
|---------|-----|
| `/ganhar <objetivo> [capital] [h/sem] [risco]` | PLANO-GANHO (9 secoes) |
| `/ganhar-diario <objetivo>` | rotina diaria (1 acao + risco) |
| `/ganhar-trends <objetivo> [capital] [h/sem] [risco] [fonte]` | matriz trends do dia (score 0-100) |
| `/ganhar-relatorio <objetivo> [YYYY-MM]` | relatorio mensal |
| `/ganhar-backup <objetivo>` | backup tar.gz |

## Rodar

```bash
npm run validate           # validacao estrutural (21 checks)
npm run digest             # digest do dia -> docs/digest/YYYY-MM-DD.md
npm run fetch-trends       # coleta 7 fontes oficiais + fallback Wikipedia (cache 24h; --force rebusca)
npm run gen-report-estudos <tema> [YYYY-MM]
npm run gen-report-ganhos  <objetivo> [YYYY-MM]
npm run backup <estudos|ganhos> <nome>
npm run restore <estudos|ganhos> <nome> <arquivo.tar.gz>
npm run sync-memory        # promove inbox -> MEMORIA.md
```

Requisito: Node >= 18.

## Casos de uso (modos treinados)

O `life-orchestrator` detecta o CONTEXTO pela primeira frase do usuario e adapta cadencia,
profundidade e comandos. Os 6 modos e a regra de desempate estao na secao
**MODOS DE USO** de [`agents/life-orchestrator.md`](agents/life-orchestrator.md),
comportamentos validados em [`evals/`](evals/) (estudos 21, ganhos 23, software 4):

| Modo | Quem | Comandos tipicos |
|------|------|------------------|
| 1. ENEM trabalhando (1h/dia) | carga limitada por TEMPO | `/estudar`, `/estudar-revisao`, `/dia` |
| 2. Renda extra pouco capital | matriz pre-filtrada por faixa de capital + horas | `/ganhar`, `/dia` |
| 3. Dev solo com side-project | contrato antes do paralelo + gates + evidencia | workers diretos (`fe-pages`, `be-api`) |
| 4. Pai/mae que estuda a noite | retomada sem culpa, 100% revisao em semana ruim | `/estudar-revisao`, `/dia` |
| 5. Revisao semanal de 15 min | 5 linhas por dominio, nunca relatorio gigante | `/revisar` |
| 6. Transicao de carreira | 2 trilhas separadas com prioridade de horas | `/estudar` + `/ganhar`, `/revisar` |

## Regras duras (resumo)

- **Grana**: sem promessa de lucro, sem recomendacao personalizada; cotacao/trend **sempre data+fonte**; sem fonte = `nao confirmado`; eleicoes 2026 = sensivel (`base_legal` obrigatorio: Lei 9.504/97 + Res. TSE 23.610/2019).
- **Estudos**: questoes oficiais **so INEP** (ano+caderno/cor+n+link); TRI so conceito; redacao C1-C5 sem nota oficial; `pratica-intercalada`, `recall-ativo`, `repeticao-espacada`.
- **Comuns**: sem segredo no repo (so `{env:NOME}`, `.env` fora do git); sem PII; disclaimer linkado no topo de todo doc em `docs/estudos/**` e `docs/ganhos/**`.

## Estrutura

Consulte o frontmatter de [`agents/life-orchestrator.md`](agents/life-orchestrator.md) para o mapeamento completo e [`evals/`](evals/) para os comportamentos validados (estudos 21, ganhos 23, software 4). O repo tem 8 skills em `skills/`.

## Licenca

MIT — ver [`LICENSE`](LICENSE).
