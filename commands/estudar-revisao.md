# /estudar-revisao — revisao espacada pontual (recall de 10-15 min)

> Conteudo educacional. Sem banco pago, sem questao falsa INEP. Ver [Aviso educacional — disclaimer](../docs/estudos/disclaimer.md).

Invoca `life-orchestrator` -> `coord-estudos` (worker direto `aval-quiz` quando a tarefa e so "roda o quiz de revisao").

## Fluxo

1. Leia `progresso.md` da trilha e pegue a revisao com data <= hoje (ou a mais proxima).
2. Entregue 3-5 itens de RECALL ATIVO (pergunta -> resposta, fonte fechada), com feedback imediato por item.
3. Registre a revisao em `progresso.md` (data + acertos) e recalcule a proxima data.
4. NUNCA introduza conteudo novo nesta rota (evals E17/E19).

Uso: `/estudar-revisao <tema>` — sem tema = a revisao mais urgente de qualquer trilha.

## Regras duras

- `= 15 minutos` de criterio de parada (a persona "dia de 10 min" aceita 3 itens, nao 10).
- Sem punicao por atraso: retoma sem culpa (eval E18).
- So INEP para questao oficial (ano+caderno/cor+n+link); senao `autoral - padrao ENEM`.
