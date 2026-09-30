import { formatBRL, formatBRLShort, formatDecimal, formatPercent } from "@/lib/format";
import { toHundred } from "@/lib/hundred";
import { type EntityYear, REVENUE_SOURCES, type RevenueSource } from "./data";
import { type AreaRow, ratio } from "./metrics";

/*
 * Chapter titles that state what the numbers show. They are built only from
 * the data, in neutral words: "acima/abaixo da mediana", never "melhor/pior".
 */

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Summary paragraph used as the title of chapter 1.
 * `subject` is written as mid-sentence: "a Prefeitura de Itabaiana", "o Governo do Estado".
 */
export function budgetLede(subject: string, year: number, entity: EntityYear | null, sizeMedianPerCapita?: number | null) {
  if (!entity || entity.paid == null) return `${capitalize(subject)} não declarou ao Tesouro Nacional os gastos de ${year}.`;
  const execution = ratio(entity.paid, entity.authorized);
  const perCapita = ratio(entity.paid, entity.population);
  const planned = entity.planned == null ? "" : `previu gastar ${formatBRLShort(entity.planned)} e `;
  const executed = execution == null ? "" : `, ${formatPercent(execution)} do orçamento atualizado ao longo do ano`;
  let perHead = "";
  if (perCapita != null) {
    perHead = ` Por habitante, foram ${formatBRL(perCapita)}`;
    const r = ratio(perCapita, sizeMedianPerCapita);
    if (r != null && r >= 1.5) perHead += `, ${formatDecimal(r)} vezes a mediana dos municípios do mesmo porte`;
    else if (r != null && r <= 0.67) perHead += `, ${Math.round((1 - r) * 100)}% abaixo da mediana dos municípios do mesmo porte`;
    perHead += ".";
  }
  return `Em ${year}, ${subject} ${planned}pagou ${formatBRLShort(entity.paid)}${executed}.${perHead}`;
}

/** Revenue sources sorted by amount, "other" last. */
export function revenueSources(entity: EntityYear | null) {
  const revenue = entity?.revenue;
  if (!revenue) return [];
  return (Object.keys(REVENUE_SOURCES) as RevenueSource[])
    .map((key) => ({ key, value: revenue.sources[key] ?? 0, share: ratio(revenue.sources[key] ?? 0, revenue.total) ?? 0, ...REVENUE_SOURCES[key] }))
    .filter((s) => s.value > 0)
    .sort((a, b) => (a.key === "other" ? 1 : b.key === "other" ? -1 : b.value - a.value));
}

export function revenueHeadline(entity: EntityYear | null, isState: boolean) {
  const top = revenueSources(entity).find((s) => s.key !== "other");
  if (!top) return "A receita deste ano não foi declarada ao Tesouro Nacional";
  const label = isState && top.stateLabel ? top.stateLabel : top.label;
  return `A maior fonte de receita foi ${label}: ${formatPercent(top.share)} do total`;
}

/** Whole reais out of every R$ 100 spent, per area (same order as `rows`). */
export function hundredSplit(rows: AreaRow[]) {
  const withShare = rows.filter((r) => (r.share ?? 0) > 0);
  return { rows: withShare, units: toHundred(withShare.map((r) => r.share!)) };
}

export function spendingHeadline(rows: AreaRow[]) {
  const { rows: withShare, units } = hundredSplit(rows);
  if (!withShare.length) return "Os gastos por área deste ano não foram declarados ao Tesouro Nacional";
  return `De cada R$ 100 gastos, R$ ${units[0]} foram para ${withShare[0].name.toLowerCase()}`;
}

export function comparisonHeadline(perCapita: number | null, sizeMedian: number | null) {
  const r = ratio(perCapita, sizeMedian);
  if (r == null) return "Como o município se compara com os parecidos";
  if (r >= 1.5) return `Gasta ${formatDecimal(r)} vezes a mediana por habitante dos municípios do mesmo porte`;
  if (r >= 1.03) return `Gasta ${Math.round((r - 1) * 100)}% a mais por habitante que a mediana dos municípios do mesmo porte`;
  if (r <= 0.97) return `Gasta ${Math.round((1 - r) * 100)}% a menos por habitante que a mediana dos municípios do mesmo porte`;
  return "Gasto por habitante próximo da mediana dos municípios do mesmo porte";
}
