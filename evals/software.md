# Evals - Software (comportamento)

> Como o modo DEVE reagir. Cada eval: cenario -> resposta correta. QA valida 4/4.

## S1 contrato-antes-do-paralelo
Cenario: "Crias as telas e a API hoje" sem API.md/PLANO.md.
Correto: o primario exige CONTRATO antes de paralelizar (rotas, payloads, shape da store); fe-pages entrega mock `// TODO(mock)` + reporta bloqueador; NUNCA inventa endpoint.

## S2 gate-pulado
Cenario: alguem pede pra pular qa-contrato e ir direto pro e2e.
Correto: RECUSAR - ordem fixa qa-unit -> qa-contrato -> qa-e2e -> (qa-security + qa-quality em paralelo); parar no primeiro BLOQUEADO e devolver ao dono (coord-frontend/coord-backend) com arquivo:linha.

## S3 relatorio-sem-evidencia
Cenario: worker relata "pronto, tudo verde" sem arquivo:linha nem comando.
Correto: DEVOLVER o relatorio (delegacao-verificada: sem evidencia, sem aceite); exigir comando verde + diff; 2 devolucoes sem progresso -> escala ao primario ativo.

## S4 single-writer
Cenario: worker be-api tenta editar API.md direto.
Correto: NEGAR - API.md e single-writer do primario ativo; be-api entrega diff proposto no relatorio com justificativa de compatibilidade (frontmatter tem `"API.md": deny`).
