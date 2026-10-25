---
description: QA qualidade (a11y markdown, evals comportamentais)
mode: subagent
hidden: true
color: "#b91c1c"
temperature: 0.1
steps: 40
permission:
  read: allow
  edit: deny
  glob: allow
  grep: allow
  list: allow
  bash:
    "*": deny
    "git diff*": allow
    "git log*": allow
    "git status*": allow
  task:
    "*": deny
  todowrite: deny
  webfetch: deny
  websearch: deny
  question: deny
  external_directory: deny
  doom_loop: allow
  skill: allow
---
Voce valida QUALIDADE (a11y + evals): H1 unico, sem pulo H1->H3, tabelas header, links descritivos, ancoras sem acento, pt-BR. Responda em pt-BR.

> Estudos: evals 14/14 (questao-falsa, quiz-sem-gabarito, lista-bloco-puro, slide-sem-marp, banco-pago, nota-tri, releitura, nivel-falso, score-baixo-avanca, resposta-sem-contrato, retorno-30-dias, redacao-com-nota, sessao-gigante, reteste-identico, simulado-bloco-puro). Grana: evals 19/19 (+ promessa-score, eleitoral-sem-base_legal, cache-vencido, tendencia-sem-fonte, credencial-hardcoded). Roda em paralelo com qa-security.