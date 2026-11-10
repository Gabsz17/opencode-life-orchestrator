# MEMORIA - Life Orchestrator

## Regras permanentes
- 3 primaries: `life-orchestrator` (unificador, default), `orquestrador` (so software), `mentor` (so estudos). Coords compartilhados (pesquisa/qualidade/plataforma); 1 sessao = 1 estrutura de estudos (life->coord-estudos; mentor->coords granulares).
- Roteamento de precisao: tarefa pontual = WORKER direto (life-orchestrator tem os 35 allows); orquestrador/mentor orquestram so via coords; varredura/validacao = COORD.
- Grana: sem promessa lucro, sem recomendacao personalizada; sempre data+fonte; sem fonte = `nao confirmado`.
- Eleicoes 2026 = sensivel (Lei 9.504/97 + Res. TSE 23.610/2019): `base_legal` obrigatorio quando `eleitoral=true`.
- Estudos: questoes oficiais so INEP (ano+caderno/cor+n+link); TRI so conceito; redacao C1-C5 sem nota oficial.
- Disclaimer linkado no topo de todo doc `docs/estudos/**` e `docs/ganhos/**` (validado pelo check 7).
- Segredos: so via env `{env:NOME}`; `.env` fora do git; check 14 NAO varre `agents/` (falso-positivo) - agents/ varrido manualmente + check 15.
- Anti-escala de privilegio: worker com edit amplo DEVE negar no bloco edit: `agents/*`, `scripts/*`, `opencode.jsonc`, `.git/*`, `.github/*`, `API.md` + `git push*`; grants globais do `opencode.jsonc` espelham a mesma base (vale mesmo sem override por agente). Exigido pelo validate (check 4 + 11).
- A11y: 1 H1 por md, ancoras sem acento. `scripts/validate.mjs` tem que ficar VERDE antes de commit-marco.

## Recentes
- 2026-11-10: Gate coord-qualidade (fase 14) = LIBERADO COM PENDENCIAS (0 CRIT/ALTO; F-01..F-08 LOW): `Number("")===0` no SGS (validar trim); data de calendario (31/02) passa regex; semver `>=16 <21` exige range superior; regex de pin line-based casa `uses:` em bloco `run: |` e rejeita SHA UPPERCASE; doctor e validate divergiram no extrator JSONC; PLANO.md agora nos checks 13/14/16/18; fonte vazia (Google/Wikipedia) precisa virar `naoConfirmado`.
- 2026-11-10: check 21 so cobre README; contagens em prosa de agents (arvore com 15/19 evals e 7 fontes) apodrecem sem check - atualizar junto com o dado ou proibir numero em prosa.
- 2026-11-10: Revisao coord-plataforma (fase 14) achou 3 MEDIO: SSH `git@host:path` NAO e credencial (detectar userinfo so em http(s) e redigir a URL no OK); pin de action exige varrer TODOS os workflows + regex ancorada (aspas/reusable/linha comentada); `.env.*` force-add nao era detectado (`git ls-files '.env*'`, so `.env.example` permitido). Corrigidos + F4-F8 (check sem git nao da OK falso; doctor valida conteudo; docs 8 fontes/BCB macro).
- 2026-11-10: doctor deve validar CONTEUDO, nao nome/indice: cache de hoje so OK se `JSON.parse` + `Array.isArray(trends)`; `.env.example` tracked mas ausente no working tree = erro.
- 2026-11-10: docs de fonte contam "7" quando o array tem 8 (reincidencia do B8) - atualizar label junto com a fonte; BCB SGS e contexto macro (dolar serie 1 + IPCA 433), nao "termos economicos em alta".
- 2026-11-10: Fase 14 (debitos DX): `scripts/doctor.mjs` + `npm run doctor` (exit 1 so p/ bloqueio; 0/0 local); BCB SGS real (series 1 dolar + 433 IPCA; 44 itens/41 com fonte); YouTube com chave no header `X-Goog-Api-Key`; actions pinadas por SHA; check 22 (`.env.example` rastreado + pin) = 22 checks VERDE.
- 2026-11-10: BCB SGS as vezes devolve datas FUTURAS (serie 432/Selic: 20/11..09/12/2026 em 10/11/2026) - filtrar ponto com data > hoje e nunca derivar "ultimo" sem validar; series 1 (dolar) e 433 (IPCA) vem com data passada.
- 2026-11-10: chave de API em query string vaza em log/historico/proxy; YouTube Data v3 aceita `X-Goog-Api-Key` no header (getJSON ja repassa headers).
- 2026-11-10: pin de action por SHA + comentario da tag (checkout v4.2.2 = 11bd71901bbe5b1630ceea73d27597364c9af683; setup-node v4.4.0 = 49933ea5288caeca8642d1e84afbd3f7d6820020); check 22 exige 40 hex.
- 2026-11-10: doctor nao substitui validate: validate = gate estrutural (22 checks); doctor = ambiente (node/git/.env/cache/inbox/actions). Inbox so com BOM/whitespace nao e pendencia.
- Copiar agente de outro repo NUNCA e so copiar: rodar grep `Relatorio ao|escale ao` e adaptar ao primario ativo (3 achados em 2026-10-25: mentor, coord-frontend, coord-backend); conferir temperature, comandos e scripts que o texto pressupoem (npm lint/build nao existe aqui).
- Todo check de permissao tem que casar com a correcao aplicada: correcao sem check = regressao silenciosa (visto 2x no gate 4).
- Greps de segredo casam o literal da skill `revisao-segura` - sempre excluir `skills/**` junto com o proprio regex do validate.
- fetch-trends: Google Trends `dailytrends` retorna 404; fallback automatico = Google Noticias RSS BR (sem chave) + Wikipedia pageviews PT (40 itens com fonte).
- trends24.in: hrefs sao `twitter.com/search?q=...` (nao `/brazil/`); regex corrigida.
- PowerShell `Set-Content -Encoding utf8` insere BOM e corrompe `^# ` no a11y-check - remover BOM via Node (buf.slice(3)). Edicao de .md sempre via Node `fs` + utf8 (LF/CRLF: usar `\r?\n` em regex).
- Frontmatter com indentacao 2/4 e `\r?\n` variam entre repos - regex de bloco edit precisa cobrir ambos.
- `git add` em caminho gitignorado = no-op silencioso (`|| true` + `diff --cached --quiet` = "Nada novo." para sempre). Workflow de commit automatico precisa de `git add -f` ou negacao no .gitignore - sempre conferir os dois lados do par (B1, 2026-10-26).
- Check que acusa o fluxo documentado e bug do check: `existsSync(.env) -> ERRO` conflita com `.env.example` mandando criar `.env`. Validar ESTADO NO GIT (`git ls-files --error-unmatch` + `git check-ignore`), nao existencia de arquivo.
- Supressao de falso-positivo tem que ser por MATCH, nao por arquivo: `!raw.includes("{env:")` vira escudo para qualquer segredo real do mesmo arquivo (B6).
- Regex de link relativo precisa cobrir alvo sem `./` (`](disclaimer.md)` e a forma mais comum do repo); escopo do check de links deve incluir README/templates/evals (B5).
- `process.argv` sem guarda de path: `join(ROOT, "docs", tema)` com `tema=../../..` passa no existsSync e grava FORA da trilha - sempre regex `^[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+)*$` antes de montar path/saida (B10/B11).
- Argumento ignorado em wrapper de fetch: helper `getJSON(url, ms)` chamado com 3a posicao de headers descarta o User-Agent - assinatura do wrapper espelha a do helper base (afeta Wikimedia, que exige UA).
- Contagem escrita em label e divida: "7 fontes" ficou errado quando a fallback Wikipedia entrou como 8a - derivar contagem do dado gerado (`out.fontes.length`), nao de texto fixo espalhado (B8).
- Disclaimer "no topo" em md com frontmatter (slides Marp): o check deve PULAR o frontmatter - o disclaimer abre o CORPO do doc (check 7).
- Paths de runtime (`.opencode/memory/inbox/<agente>.md`, criados sob demanda) nao podem ser exigidos pelo validador de paths - validar so o diretorio (check 18).
