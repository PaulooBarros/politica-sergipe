import { getMunicipalityRows, ratio } from "@/features/budget/metrics";
import { TERRITORIES } from "./registry";

export type TerritoryRow = {
  name: string;
  count: number;
  population: number;
  paid: number;
  authorized: number;
  paidPerCapita: number | null;
  execution: number | null;
};

/** Territory totals: every municipality's values added together. */
export function getTerritoryRows(year: number): TerritoryRow[] {
  const rows = getMunicipalityRows(year);
  return TERRITORIES.map((name) => {
    const members = rows.filter((r) => r.territory === name);
    const declared = members.filter((r) => r.paid != null);
    const sum = (list: typeof members, pick: (r: (typeof members)[number]) => number | null) =>
      list.reduce((a, r) => a + (pick(r) ?? 0), 0);
    const paid = sum(declared, (r) => r.paid);
    return {
      name,
      count: members.length,
      population: sum(members, (r) => r.population),
      paid,
      authorized: sum(declared, (r) => r.authorized),
      // Per capita over the municipalities that declared, so missing data does not dilute it.
      paidPerCapita: ratio(paid, sum(declared, (r) => r.population)),
      execution: ratio(paid, sum(declared, (r) => r.authorized)),
    };
  });
}
