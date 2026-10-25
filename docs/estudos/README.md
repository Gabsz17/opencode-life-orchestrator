# Estudos — como usar

> Conteudo educacional. Sem banco pago, sem questao falsa INEP. Ver [Aviso educacional — disclaimer](disclaimer.md).

## Inicio rapido
1. `/estudar <tema> [nivel]` — cria plano + delega teoria/pratica/avaliacao.
2. `/estudar-enem <area> <tema>` — trilha ENEM (teoria + questoes + simulados + slides + quiz).
3. `/estudar-relatorio <tema> [YYYY-MM]` — relatorio mensal.

## Estrutura por tema
| Arquivo | Conteudo | Quem atualiza |
|---------|----------|---------------|
| `PLANO-ESTUDOS.md` | metas, modulos, exercicios, quizzes, revisoes | life-orchestrator via coord-estudos |
| `progresso.md` | estado, metricas, proxima revisao | life-orchestrator |
| `glossario.md` | termos tecnicos | teoria-conceito |
| `respostas-<modulo>.md` | respostas aluno (nunca edita quiz) | aluno |
| `questoes.md` | questoes INEP + gabarito separado | enem-questoes |
| `simulados.md` | simulados tempo + criterio | enem-questoes |
| `slides.md` | deck Marp revisao | enem-slides |
| `quiz-<modulo>.md` + `gabarito-<modulo>.md` | quiz + gabarito | aval-quiz |
| `feedback-<modulo>.md` | feedback + reaprendizagem | aval-feedback |

## Regras
- Questoes so INEP (ano+caderno/cor+n+link). Resto = `autoral — padrao ENEM`.
- Sem fonte oficial = `nao confirmado`.
- `pratica-intercalada`: misturar tipos, sem etiqueta. `recall-ativo`: quiz = recall + feedback. `repeticao-espacada`: revisao = recall + data no progresso.md.
- Score < min = `BLOQUEADO + reaprendizagem`.

## Sua primeira sessao
1. Life-orchestrator le seu tema, nivel, diagnostica (quiz 5-7 itens), registra ponto de partida.
2. Cada sessao: 1 acao com criterio de parada — cumpriu, pare.
3. Progresso em `progresso.md`: onde parou, metricas, proxima revisao. Sem fonte = `nao confirmado`.