import type { NextRequest } from "next/server";
import { getEntityYear, parseYear } from "@/features/budget/data";
import { getMunicipalityRows } from "@/features/budget/metrics";
import { getLegalChecks } from "@/features/legal/checks";
import { getInsights } from "@/features/insights/rules";
import { csvResponse } from "@/lib/csv";

/** All 75 municipalities for one year: /dados/municipios?ano=2025 */
export function GET(request: NextRequest) {
  const year = parseYear(request.nextUrl.searchParams.get("ano") ?? undefined);

  const rows = getMunicipalityRows(year).map((r) => {
    const legal = Object.fromEntries(getLegalChecks(r.code, year).map((c) => [c.id, c.value]));
    const revenue = getEntityYear(r.code, year)?.revenue;
    return [
      r.code,
      r.name,
      r.territory,
      r.sizeClass?.label,
      r.population,
      revenue?.total,
      revenue?.sources.royalties,
      r.planned,
      r.authorized,
      r.paid,
      r.execution == null ? null : r.execution * 100,
      r.revenuePerCapita,
      r.paidPerCapita,
      legal.education,
      legal.health,
      legal.personnel,
      getInsights(r.code, year).length,
    ];
  });

  return csvResponse(
    `municipios-sergipe-${year}.csv`,
    [
      "codigo_ibge",
      "municipio",
      "territorio",
      "porte",
      "populacao",
      "receita",
      "receita_royalties",
      "orcamento_previsto",
      "orcamento_atualizado",
      "gasto_pago",
      "execucao_pct",
      "receita_por_habitante",
      "gasto_por_habitante",
      "educacao_pct_aplicado",
      "saude_pct_aplicado",
      "pessoal_pct_rcl",
      "pontos_de_atencao",
    ],
    rows,
  );
}
