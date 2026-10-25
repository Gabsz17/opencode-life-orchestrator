# Fontes trends — 7 fontes tempo real

> Conteudo educacional. Ver [disclaimer](disclaimer.md).


> Fontes de tendencias para Grana. Cache diario em `trends-cache/YYYY-MM-DD.json` (TTL 24h). Acesso base: 2026-10-25.

## 1. TikTok Creative Center (Trends)
- URL: `https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en`
- Credencial opcional via env: `{env:TIKTOK_CREATIVE_CENTER_KEY}` (sem chave = fallback publico/aviso).

## 2. Google Trends (explore + trending)
- API oficial `dailytrends`: `https://trends.google.com/trends/api/dailytrends?geo=BR` (as vezes retorna 404 — endpoint sujeito a mudanca).
- **Fallback automatico (sem chave)**: Google Noticias RSS BR `https://news.google.com/rss/headlines?hl=pt-BR&gl=BR&ceid=BR:pt-419`.
- Volume minimo aceitavel: >= 10.000 buscas (ou proxy de interesse).

## 2b. Wikipedia top pageviews PT (fonte gratis, proxy BR)
- `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/pt.wikipedia.org/all-access/YYYY/MM/DD`
- Proxy de interesse (paginas mais vistas ontem); NAO e volume de busca oficial → marcado com `_aviso`.

## 3. YouTube Trending (BR)
- `https://www.youtube.com/feed/trending?gl=BR` (extracao web-operator) ou API Data v3 com `{env:YOUTUBE_API_KEY}`.

## 4. Meta Ads Library (anuncios ativos)
- `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR`
- Credencial opcional: `{env:META_ACCESS_TOKEN}`.

## 5. X trends24 (Brasil)
- `https://trends24.in/brazil/`

## 6. TSE — trends eleitorais (SENSIVEL)
- `https://dadosabertos.tse.jus.br/` — so monitoramento educacional; `base_legal` obrigatorio (Lei 9.504/97 + Res. TSE 23.610/2019).

## 7. IBGE / BCB — trends economicas
- SIDRA (`https://sidra.ibge.gov.br/`) + SGS (`https://api.bcb.gov.br/`) — termos economicos em alta.

## Criterio de validacao (todos)
- **Volume**: Google Trends >= 10K OU TikTok >= 100K (24h equivalente).
- **Velocidade**: crescimento >= 100% vs baseline 7 dias.
- **Persistencia**: >= 3 dias em alta.
- **Score** = volume*0.4 + velocidade*0.3 + aderencia*0.3 (0-100 educacional).
- **Saturacao**: alta | media | baixa.
- Fonte + data obrigatorias. Sem fonte = `nao confirmado`.

## Regras legais
- Sem bypass de paywall/ToS. Credenciais so via env `{env:NOME}` — nunca no repo.
- Eleicoes = sensivel; nao e esquema de renda, so tendencia monitorada.
