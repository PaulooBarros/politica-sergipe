import type { Indicator } from "@/features/budget/indicators";
import { getMunicipalityRows, median } from "@/features/budget/metrics";
import { getInsights } from "@/features/insights/rules";
import { formatBRL, formatBRLCompact, formatInteger, formatPercent } from "@/lib/format";

/** What the side card shows for one municipality (pre-formatted on the server). */
export type MunicipalityCard = {
  code: string;
  name: string;
  slug: string;
  territory: string;
  size: string;
  population: string;
  /** Formatted indicator value, or null when not declared. */
  indicator: string | null;
  /** Neutral comparison with the same-size median. */
  comparison: string;
  facts: [string, string][];
  insights: string[];
};

export function getMunicipalityCards(year: number, indicator: Indicator): Record<string, MunicipalityCard> {
  const values = indicator.values(year);
  const rows = getMunicipalityRows(year);
  const sizeMedians = new Map<string, number | null>();
  for (const r of rows) {
    const id = r.sizeClass?.id;
    if (id && !sizeMedians.has(id)) {
      sizeMedians.set(id, median(rows.filter((x) => x.sizeClass?.id === id).map((x) => values[x.code])));
    }
  }

  return Object.fromEntries(
    rows.map((r) => {
      const value = values[r.code];
      const ref = r.sizeClass ? sizeMedians.get(r.sizeClass.id) : null;
      let comparison = "A prefeitura não enviou este dado ao Tesouro Nacional.";
      if (value != null && ref != null && ref !== 0) {
        const diff = Math.round(Math.abs(value / ref - 1) * 100);
        const of = `da mediana dos municípios de ${r.sizeClass!.label.toLowerCase()} (${indicator.format(ref)})`;
        comparison = diff < 3 ? `Próximo ${of}.` : `${diff}% ${value > ref ? "acima" : "abaixo"} ${of}.`;
      }
      return [
        r.code,
        {
          code: r.code,
          name: r.name,
          slug: r.slug,
          territory: r.territory,
          size: r.sizeClass?.label ?? "—",
          population: formatInteger(r.population),
          indicator: value == null ? null : indicator.format(value),
          comparison,
          facts: [
            ["Gasto pago", formatBRLCompact(r.paid)],
            ["Gasto por habitante", formatBRL(r.paidPerCapita)],
            ["Receita por habitante", formatBRL(r.revenuePerCapita)],
            ["Orçamento executado", r.execution == null ? "não declarado" : formatPercent(r.execution)],
          ],
          insights: getInsights(r.code, year).map((i) => i.title),
        },
      ];
    }),
  );
}
