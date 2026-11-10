# PLANO - Life Orchestrator (fase 14: debitos DX/infra)

## Escopo
Fechar os debitos registrados na fase 13:
1. DX-1: `scripts/doctor.mjs` + `npm run doctor` (ambiente: node, git, .env, cache, inbox, scripts).
2. DX-4: fonte 8 (BCB) real via SGS publico (dolar + IPCA; sem chave), fallback `nao confirmado`.
3. Chave do YouTube fora da query string (header `X-Goog-Api-Key`).
4. Actions pinadas por SHA (checkout v4.2.2, setup-node v4.4.0).
5. Check 22: `.env.example` rastreado + actions pinadas por SHA.
6. README/API.md/MEMORIA sincronizados (contagem de checks 21 -> 22).

## Contratos
- `API.md` (raiz do workspace, secao Life Orchestrator) e single-writer do orquestrador; anexar Fase 14.
- `scripts/validate.mjs` e a fonte da verdade: todo check novo entra na contagem do README (check 21).
- Doctor: exit 1 SO para bloqueio (ERRO); AVISO nao falha.
- Sem segredo em URL/log; `.env` fora do git; cache trends continua gitignorado (CI usa `git add -f`).

## Fases e Ownership
| Fase | Descricao | Dono | Repo | Status |
|------|-----------|------|------|--------|
| 14.1 | doctor.mjs + npm run doctor | plat-infra | opencode-life-orchestrator | CONCLUIDA |
| 14.2 | BCB SGS real no fetch-trends | coord-pesquisa (contrato) + orquestrador | opencode-life-orchestrator | CONCLUIDA |
| 14.3 | YouTube header + actions pinadas | plat-infra | opencode-life-orchestrator | CONCLUIDA |
| 14.4 | check 22 + README/API.md/MEMORIA | orquestrador | opencode-life-orchestrator | CONCLUIDA |
| 14.5 | validate + doctor + fetch-trends + digest | orquestrador | opencode-life-orchestrator | CONCLUIDA |
| 14.6 | gate coord-qualidade | coord-qualidade | opencode-life-orchestrator | LIBERADO COM PENDENCIAS (CI) |

## Progresso
- [x] Levantamento dos debitos (fase 13 -> 14)
- [x] doctor.mjs
- [x] BCB SGS real
- [x] YouTube header
- [x] actions pinadas
- [x] check 22
- [x] README/API.md/MEMORIA
- [x] Evidencia local (validate/doctor/fetch-trends/digest)
- [x] Revisao coord-plataforma (APROVADO COM RESSALVAS) + correcoes F1-F8
- [x] Gate coord-qualidade (LIBERADO COM PENDENCIAS: 0 CRITICO/ALTO; 8 LOW corrigidos; resta CI)
- [ ] Commit + push + CI verde do delta

## Decisoes
- BCB serie 432 (Selic meta) retorna datas FUTURAS no SGS (20/11..09/12/2026 em 10/11/2026):
  o doctor/fetch descartam ponto com data > hoje; Selic fica fora do resumo ate normalizar.
  Series usadas: 1 (dolar comercial venda) e 433 (IPCA mensal), ambas com data passada.
- YouTube: chave vai em `X-Goog-Api-Key` (header), nunca em query string (evita log/historico).
- Actions: pin por SHA + comentario da tag; atualizacao manual documentada.
- Doctor nao substitui o validate: validate e gate estrutural; doctor e diagnostico de ambiente.
- Revisao do coord-plataforma (3 MEDIO + 5 BAIXO) corrigida antes do gate: SSH `git@` nao e
  credencial; pin scanning cobre todos os workflows; `.env.*` force-add e erro; check sem git
  avisa (nao OK falso); doctor valida conteudo; docs alinhados em 8 fontes/BCB macro.
- CI do delta so sera declarado verde depois do push + run do GitHub Actions (nao usar run local
  como CI).
- Gate 14.6: LIBERADO COM PENDENCIAS; 8 LOW (F-01..F-08) corrigidos e re-validados; pendencia
  unica = CI do delta.
