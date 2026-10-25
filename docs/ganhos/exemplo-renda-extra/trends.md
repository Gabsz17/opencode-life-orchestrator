# trends — exemplo-renda-extra (matriz do dia)

> Conteudo educacional. Nao e recomendacao de investimento. Ver [disclaimer](../disclaimer.md). Sem promessa de lucro.

Cache diario: `../trends-cache/YYYY-MM-DD.json` (TTL 24h, fora do git).
Score = volume*0.4 + velocidade*0.3 + aderencia*0.3 (0-100 educacional).

| Rank | Topico | Fonte | Data coleta | Volume | Score | Saturacao | Aderencia | Status |
|------|--------|-------|-------------|--------|-------|-----------|-----------|--------|
| 1 | templates IA para freela | Google Trends BR (via Google Noticias RSS fallback) | 2026-10-25 | 12.000 | 68 | media | alta | validar |
| 2 | eleicoes 2026 (monitoramento) | TSE dados abertos | 2026-10-25 | 0 | 0 | baixa | - | nao confirmado (eleitoral=true, base_legal: Lei 9.504/1997 + Res. TSE 23.610/2019) |

## Rotina
- `/ganhar-trends exemplo-renda-extra all` -> re-busca cache se > 24h.
- Alerta: score > 70 E saturacao=alta -> aguardar ou diferenciar nicho.
- Sem fonte = `nao confirmado`. Eleicoes = sensivel; nao e esquema de renda.
