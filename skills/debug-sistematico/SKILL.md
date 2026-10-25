---
name: debug-sistematico
description: Depuração sistemática de bugs com reprodução, isolamento e correção mínima com teste de regressão
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: debugging
---
# Debug sistemático

Use quando houver bug, falha de teste ou comportamento inesperado.

## Protocolo

1. **Reproduza primeiro** — comando exato + entrada + saída atual x esperada. Sem reprodução, sem hipótese.
2. **Isole a camada** — frontend, contrato/API, domínio ou dados? Leia `API.md` e `PLANO.md` antes de chutar.
3. **Uma hipótese por vez** — a mais simples primeiro. Confirme com leitura de código ou log, nunca com reescrita.
4. **Correção mínima** — mexa no menor escopo dono do bug (respeite ownership: 1 arquivo = 1 dono). Sem refatoração junto.
5. **Regressão** — rode lint + build + teste que cobre o caso. Se o teste não existia, crie no padrão do projeto.
6. **Registre** — anexe 1 lição no inbox (`erro -> correção que funcionou`), formato `- [AAAA-MM-DD] contexto: fato -> ação`.

## Proibido

- Corrigir no escuro sem reproduzir.
- Tocar `src/**` se você for QA (reporte arquivo:linha + dono).
- Mais de 3 tentativas no mesmo erro sem pivotar (trocar abordagem, simplificar escopo).
