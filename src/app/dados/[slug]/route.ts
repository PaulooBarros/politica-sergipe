import { FUNCTIONS, getEntityYear, REVENUE_SOURCES, STATE_CODE, YEARS } from "@/features/budget/data";
import { getMunicipalityBySlug } from "@/features/municipalities/registry";
import { csvResponse } from "@/lib/csv";

/**
 * Everything for one entity, all years, in long format:
 * /dados/aracaju or /dados/estado
 */
export async function GET(_request: Request, ctx: RouteContext<"/dados/[slug]">) {
  const { slug } = await ctx.params;
  const municipality = slug === "estado" ? null : getMunicipalityBySlug(slug);
  if (slug !== "estado" && !municipality) return new Response("Município não encontrado", { status: 404 });
  const code = municipality?.code ?? STATE_CODE;

  const rows: (string | number | null | undefined)[][] = [];
  for (const year of [...YEARS].reverse()) {
    const e = getEntityYear(code, year);
    if (!e) continue;
    rows.push([year, "total", "Despesa total", e.planned, e.authorized, e.liquidated, e.paid, e.population]);
    for (const [fn, v] of Object.entries(e.byFunction)) {
      rows.push([year, "despesa_por_area", FUNCTIONS[fn] ?? fn, v.planned, v.authorized, v.liquidated, v.paid, e.population]);
    }
    if (e.revenue) {
      rows.push([year, "receita", "Receita total", null, null, null, e.revenue.total, e.population]);
      for (const [src, value] of Object.entries(e.revenue.sources)) {
        const label = REVENUE_SOURCES[src as keyof typeof REVENUE_SOURCES]?.label ?? src;
        rows.push([year, "receita_por_origem", label, null, null, null, value, e.population]);
      }
    }
  }

  return csvResponse(
    `${slug}-orcamento.csv`,
    ["ano", "tipo", "item", "previsto", "atualizado", "liquidado", "pago_ou_realizado", "populacao"],
    rows,
  );
}
