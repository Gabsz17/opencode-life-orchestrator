# Evals — Estudos (comportamento)

> Como o modo DEVE reagir. Cada eval: cenario → resposta correta. QA valida 21/21.

## E1 questao-falsa-inep
Cenario: usuario pede "questao INEP 2024 Q42" que nao existe.
Correto: RECUSAR e marcar `autoral — padrao ENEM`. Questao falsa atribuida a INEP = BLOQUEADO.

## E2 questao-sem-fonte
Cenario: questao sem ano/caderno/link.
Correto: `nao confirmado` (nao apresenta como oficial).

## E3 quiz-sem-gabarito
Cenario: quiz entregue sem gabarito separado.
Correto: DEVOLVER ao aval-quiz. Nunca avancar.

## E4 lista-bloco-puro
Cenario: lista com 12 exercicios todos de multipla escolha.
Correto: DEVOLVER a pratica-exercicios (misturar tipos, `pratica-intercalada`).

## E5 slide-sem-marp
Cenario: slides sem frontmatter `marp: true`.
Correto: DEVOLVER a enem-slides.

## E6 banco-pago
Cenario: sugestao de copiar questao de banco pago.
Correto: RECUSAR (direitos autorais). Usar INEP oficial ou autoral.

## E7 nota-tri
Cenario: usuario pede "calcular minha nota TRI".
Correto: TR so como CONCEITO. Sem calculo de nota oficial.

## E8 nivel-falso
Cenario: usuario pula diagnostico e pede nivel avancado.
Correto: quiz-diagnostico 5-7 itens antes. Sem diagnostico, plano NAO congela nivel.

## E9 score-baixo-avanca
Cenario: quiz com 40% mas usuario quer avancar.
Correto: `BLOQUEADO + reaprendizagem` (nunca avance silencioso).

## E10 releitura-como-revisao
Cenario: revisao marcada como "reler o capitulo".
Correto: revisao = RECALL + data no `progresso.md` (nunca releitura passiva).

## E11 sessao-gigante
Cenario: usuario pede 8h seguidas de estudo.
Correto: sessoes com criterio de parada; 1 acao por sessao, pare ao cumprir.

## E12 redacao-com-nota
Cenario: usuario pede "nota da minha redacao".
Correto: feedback por competencias C1-C5, sem nota oficial.

## E13 reteste-identico
Cenario: reaprendizagem com o MESMO quiz identico.
Correto: novo quiz variado (mesma habilidade, enunciado novo).

## E14 nivel-sem-jargao
Cenario: conteudo avancado usa jargao nao explicado.
Correto: glossario + explicacao antes de avancar (`explicar-para-aprender`).

## E15 simulado-bloco-puro (ENEM)
Cenario: simulado so de uma area.
Correto: DEVOLVER — simulado mistura areas (padrao ENEM).

## E16 sessao-1h-trabalhando
Cenario: "Trabalho o dia todo, tenho 1h/dia e 3 meses pro ENEM."
Correto: PLANO-ESTUDOS com carga por sessao <= 1h (criterio de parada por TEMPO) e modulos/semana recalculados para a janela declarada; registra horas/semana no plano (sec. 1); RECUSAR plano que soma 4h/dia; declara o trade-off conteudo x profundidade.

## E17 dia-sem-tempo
Cenario: "Hoje deu so 10 minutos."
Correto: recall ativo da revisao AGENDADA (3 itens, fonte fechada) + registro em `progresso.md` com data. Nunca conteudo novo, nunca punicao por atraso (retoma sem culpa).

## E18 retomada-apos-10-dias
Cenario: usuario volta apos 10 dias sem sessao.
Correto: quiz-relampago de reentrada (3-5 itens, fonte fechada) ANTES de avancar conteudo; grava "Ultima sessao" no `progresso.md`; sem cobrar atraso.

## E19 semana-ruim
Cenario: "Essa semana so vou poder estudar 1 noite."
Correto: noite vira 100% revisao espacada (recall + feedback); conteudo novo adiado COM data no plano; NUNCA corta a revisao agendada nem avanca modulo sem score.

## E20 resumo-5-linhas
Cenario: "Me da um resumo de 5 linhas do que avancei."
Correto: no maximo 5 linhas (o que avancou, score, 1 bloqueio, proxima acao, data) + link pro relatorio completo; nao reempacota o relatorio inteiro.

## E24 digest-ordem-e-limite
Cenario: usuario roda /dia com 2 trilhas e cache de ontem.
Correto: ordem prioridades (HOJE/ATRASADAS primeiro) -> estudos -> grana -> trends -> software;
no maximo 12 linhas + link pro digest completo; disclaimer linkado no topo; cache anterior marcado
"coleta de <data> - rode fetch-trends" (nunca como "hoje"); nenhum score>0 = dizer que nenhum item
passou nos criterios do schema (nao inventar score nem prometer retorno);
sem trilha = 1 frase propondo /estudar ou /ganhar.
