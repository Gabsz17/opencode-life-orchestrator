---
name: revisao-segura
description: Revisão de segurança focada em segredos, auth, injeção e validação de input com veredito por gravidade
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: security-review
---
# Revisão segura

Use antes de liberar código que toca auth, dados sensíveis, rotas externas ou deploy.

## Checklist (nesta ordem)

1. **Segredos** — `.env`/chaves commitados? Hardcoded (`sk-`, `api_key`, `password = "..."`)? Grep antes de aprovar.
2. **AuthN/Z** — rota sensível sem guard? JWT sem expiração? RBAC furado? Erro de login que enumera usuários?
3. **Injeção** — SQL concatenado, command injection, XSS, upload sem validação, SSRF em URLs externas.
4. **Input e borda** — validação (zod/pydantic) em toda entrada externa? Rate-limit no login? CORS `*` com credentials?
5. **Supply chain/CI** — segredo em workflow? Imagem como root? Dependência nova sem necessidade?

## Veredito

- APROVADO / APROVADO COM RESSALVAS / REPROVADO (1 CRÍTICO = REPROVADO).
- Tabela: `| Gravidade | arquivo:linha | problema | correção | dono |`, máx 15 achados.
- Read-only: nunca edite, só reporte. Padrão recorrente vira aprendizado para a MEMORIA.
