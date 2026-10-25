# TrendOportunidade — Schema Zod (Ganha Fase Trends)

> Estende `Oportunidade` Fase base. Validacao manual em `scripts/validate.mjs`. Workers com Node_modules importam Zod real.

```typescript
import { z } from "zod";

export const TrendCategoriaEnum = z.enum([
  "tiktok", "google_trends", "youtube", "meta", "x_twitter", "tse",
  "sebrae", "ibge", "bcb", "tesouro_direto", "outro"
]);
export const SaturacaoEnum = z.enum(["baixa", "media", "alta"]);
export const RiscoEnum = z.enum(["baixo", "medio", "alto"]);

export const TrendOportunidadeSchema = z.object({
  // --- Base Oportunidade ---
  id: z.string().min(1).max(64).regex(/^[\w-]+$/),
  titulo: z.string().min(3).max(120),
  trilha: z.enum(["mercado", "negocios", "trends"]),
  custo_estimado_faixa: z.enum(["ate-1k", "1k-5k", "5k-20k", "20k+"]),
  retorno_estimado_desc: z.string().min(3).max(500),
  risco: RiscoEnum,
  tempo_estimado: z.enum(["dias", "semanas", "meses", "longo-prazo"]),
  validado_fonte: z.string().max(200), // "TikTok Creative Center 2026-10-25" ou "nao confirmado"
  validado_data: z.string().regex(/^\d{4}-\d{2}-\d{2}$|nao confirmado$/),
  disclaimer_aceito: z.literal(true),
  autor: z.string().min(1).max(80),
  resumo: z.string().min(10).max(500),

  // --- Campos Trends ---
  trend_categoria: TrendCategoriaEnum,
  trend_fonte: z.string().min(3).max(200),      // URL descritiva com data
  trend_data_coleta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  trend_volume: z.number().min(0),              // views/buscas/mencoes 24h
  trend_crescimento_pct: z.number(),            // % vs baseline 7d
  trend_persistencia_dias: z.number().int().min(0),
  score_oportunidade: z.number().min(0).max(100),
  saturacao: SaturacaoEnum,
  eleitoral: z.boolean().default(false),
  base_legal: z.string().optional(),            // obrigatorio se eleitoral=true
}).superRefine((data, ctx) => {
  // Eleitoral -> base_legal obrigatorio + formato Lei/Res
  if (data.eleitoral) {
    if (!data.base_legal || data.base_legal.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "base_legal obrigatorio quando eleitoral=true (ex: 'Lei 9.504/97 art. 39 + Res. TSE 23.610/2019 art. 9')", path: ["base_legal"] });
    }
    const legalOk = /Lei\s+\d+\.\d+\/\d{4}|Res\.\s+TSE\s+\d+\.\d+\/\d{4}/i.test(data.base_legal);
    if (!legalOk) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "base_legal deve citar Lei 9.504/97 e/ou Res. TSE 23.610/2019", path: ["base_legal"] });
  }
  // Score > 0 exige volume > 0 E persistência >= 3
  if (data.score_oportunidade > 0) {
    if (data.trend_volume <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "score>0 exige trend_volume>0", path: ["score_oportunidade"] });
    if (data.trend_persistencia_dias < 3) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "score>0 exige trend_persistencia_dias>=3", path: ["score_oportunidade"] });
  }
  // Campos trend vazios -> validado_fonte = "nao confirmado"
  const trendVazio = !data.trend_fonte || data.trend_fonte === "nao confirmado" || data.trend_volume === 0 || data.trend_persistencia_dias === 0;
  if (trendVazio && data.validado_fonte !== "nao confirmado") ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Dados trend ausentes -> validado_fonte deve ser 'nao confirmado'", path: ["validado_fonte"] });
  // Disclaimer
  if (data.disclaimer_aceito !== true) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "disclaimer_aceito deve ser true", path: ["disclaimer_aceito"] });
  // Resumo max 500
  if (data.resumo.length > 500) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "resumo max 500 chars", path: ["resumo"] });
  // Nao promete lucro
  const promete = /lucro garantido|retorno \d+%|compre |venda |recomendo /i.test(data.retorno_estimado_desc);
  if (promete) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "retorno_estimado_desc nao pode prometer lucro/retorno garantido/recomendacao", path: ["retorno_estimado_desc"] });
});

export type TrendOportunidade = z.infer<typeof TrendOportunidadeSchema>;
```