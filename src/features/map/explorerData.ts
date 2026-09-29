import type { Indicator } from "@/features/budget/indicators";
import { getMunicipalityRows } from "@/features/budget/metrics";
import { getInsights } from "@/features/insights/rules";
import { formatBRL, formatInteger, formatPercent } from "@/lib/format";

/** What the side card shows for one municipality (pre-formatted on the server). */
export type MunicipalityCard = {
  code: string;
  name: string;
  slug: string;
  territory: string;
  size: string;
  population: string;
  indicator: string;
  rank: number | null;
  revenuePerCapita: string;
  paidPerCapita: string;
  execution: string;
  insights: string[];
};

export function getMunicipalityCards(year: number, indicator: Indicator): Record<string, MunicipalityCard> {
  const values = indicator.values(year);
  const ranked = Object.values(values)
    .filter((v): v is number => v != null)
    .sort((a, b) => b - a);

  return Object.fromEntries(
    getMunicipalityRows(year).map((r) => {
      const value = values[r.code];
      return [
        r.code,
        {
          code: r.code,
          name: r.name,
          slug: r.slug,
          territory: r.territory,
          size: r.sizeClass?.label ?? "—",
          population: formatInteger(r.population),
          indicator: value == null ? "não declarado" : indicator.format(value),
          rank: value == null ? null : ranked.indexOf(value) + 1,
          revenuePerCapita: formatBRL(r.revenuePerCapita),
          paidPerCapita: formatBRL(r.paidPerCapita),
          execution: formatPercent(r.execution),
          insights: getInsights(r.code, year).map((i) => i.title),
        },
      ];
    }),
  );
}
