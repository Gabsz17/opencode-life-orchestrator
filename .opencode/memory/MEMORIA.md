# MEMORIA — Life Orchestrator

## Regras permanentes
- Um so primary (`life-orchestrator`), dois dominios (Estudos + Grana), coords compartilhados (pesquisa/qualidade/plataforma).
- Roteamento de precisao: tarefa pontual = WORKER direto; varredura/validacao = COORD.
- Grana: sem promessa lucro, sem recomendacao personalizada; sempre data+fonte; sem fonte = `nao confirmado`.
- Eleicoes 2026 = sensivel (Lei 9.504/97 + Res. TSE 23.610/2019): `base_legal` obrigatorio quando `eleitoral=true`.
- Estudos: questoes oficiais so INEP (ano+caderno/cor+n+link); TRI so conceito; redacao C1-C5 sem nota oficial.
- Disclaimer linkado no topo de todo doc `docs/estudos/**` e `docs/ganhos/**` (validado pelo check 7).
- Segredos: so via env `{env:NOME}`; `.env` fora do git; check 14 NAO varre `agents/` (falso-positivo).
- A11y: 1 H1 por md, ancoras sem acento. `scripts/validate.mjs` tem que ficar VERDE antes de commit-marco.

## Recentes
- fetch-trends: Google Trends `dailytrends` retorna 404; fallback automatico = Google Noticias RSS BR (sem chave) + Wikipedia pageviews PT (40 itens com fonte).
- trends24.in: hrefs sao `twitter.com/search?q=...` (nao `/brazil/`); regex corrigida.
- PowerShell `Set-Content -Encoding utf8` insere BOM e corrompe `^# ` no a11y-check — remover BOM via Node (buf.slice(3)).
