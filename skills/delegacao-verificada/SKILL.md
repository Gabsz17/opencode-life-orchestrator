---
name: delegacao-verificada
description: Delegação verificada a subagents com escopo fechado, verificação anti-alucinação e devolução por falta de evidência
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: delegation
---
# Delegação verificada

Use em toda Task do orquestrador/coords a workers. Delegar sem contrato verificável = retrabalho.

## Protocolo

1. **Escopo fechado** — Task leva: objetivo + arquivos/diretórios permitidos + o que NÃO tocar + critério de pronto. Contexto mínimo: só o delta relevante da MEMORIA/plano.
2. **Contrato de evidência** — exija no relatório: o que foi feito + evidência (log/comando verde/arquivo) + o que NÃO foi possível. Sem evidência, sem aceite.
3. **Verificação anti-alucinação** — worker cita `arquivo:linha` ou fonte oficial para toda API/assinatura/lib; afirmação sem citação = devolver. `não confirmado` quando faltar fonte.
4. **Dry-run primeiro** — efeito colateral (post, compra, delete, push, deploy, escrita fora do escopo)? Simule e peça decisão antes.
5. **Anti-loop 2 voltas** — dry-run → decisão → autoriza/reduz escopo tem máx 2 ciclos; depois registre em `PLANO.md` como parcial e encerre.
6. **Resume com `task_id`** — subagent falhou com `task_id` resumable (runtime ≥ v1.18.20)? Retome pelo `task_id` 1 vez com o mesmo escopo; falhou de novo → escale com o `task_id` no relatório, nunca re-tente em loop.

## Proibido

- Credencial no prompt ou no repo (só via env; inexistente = escalar, nunca improvisar).
- Aceitar relatório com briefing sem fonte ou operação sem evidência.
- Mais de 2 re-delegações do mesmo delta sem progresso.
