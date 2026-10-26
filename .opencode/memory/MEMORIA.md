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
