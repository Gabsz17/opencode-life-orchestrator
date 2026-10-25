---
name: testes-eficazes
description: Estratégia de testes rápidos e estáveis com pirâmide, bordas críticas e zero flake
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: testing
---
# Testes eficazes

Use ao criar ou consertar testes, ou quando a suíte está lenta/instável.

## Protocolo

1. **Ordem barata primeiro** — lint -> build/typecheck -> unit -> contrato -> e2e. Falhou cedo? Pare, não queime tempo.
2. **Pirâmide** — muitos unit rápidos, alguns de integração/contrato, poucos e2e (login, happy path, 1-2 bordas).
3. **Bordas obrigatórias** — input inválido, auth inválida/expirada, 404, payload gigante, concorrência onde houver estado.
4. **Zero flake** — seletores por role/test-id, waits automáticos, nenhum `sleep` fixo. Teste que falha 1 em 5 é bug do teste.
5. **Escopo de escrita** — unit em `*.test.*`/`tests/**`, contrato em `tests/contract/**`, e2e em `e2e/`. Nunca edite produção para fazer teste passar.
6. **Relate cobertura honesta** — o que foi testado x o que ficou SEM teste (declarado, não escondido).

## Proibido

- Snapshot editado sem evidência.
- e2e sobre contrato divergente (exija qa-contrato verde antes).
