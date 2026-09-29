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
    const population = members.reduce((a, r) => a + (r.population ?? 0), 0);
    const paid = members.reduce((a, r) => a + (r.paid ?? 0), 0);
    const authorized = members.reduce((a, r) => a + (r.authorized ?? 0), 0);
    return {
      name,
      count: members.length,
      population,
      paid,
      authorized,
      paidPerCapita: ratio(paid, population),
      execution: ratio(paid, authorized),
    };
  });
}
