import { getSizeClass, MUNICIPALITIES, type Municipality, type SizeClass } from "@/features/municipalities/registry";
import { FUNCTIONS, getEntityYear, type EntityYear, toRealValue, YEARS } from "./data";

export type Figures = {
  population: number | null;
  planned: number | null;
  authorized: number | null;
  paid: number | null;
};

export type MunicipalityRow = Municipality &
  Figures & {
    sizeClass: SizeClass | null;
    execution: number | null;
    paidPerCapita: number | null;
    revenue: number | null;
    revenuePerCapita: number | null;
  };

export function ratio(part: number | null | undefined, whole: number | null | undefined) {
  return part == null || whole == null || whole === 0 ? null : part / whole;
}

/** Middle value: half the municipalities are above it, half below. */
export function median(values: (number | null)[]) {
  const sorted = values.filter((v): v is number => v != null).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Figures for the whole budget, or for one area (function) when `area` is given. */
export function pickFigures(entity: EntityYear | null, area: string | null): Figures {
  if (!entity) return { population: null, planned: null, authorized: null, paid: null };
  if (!area) {
    return {
      population: entity.population,
      planned: entity.planned,
      authorized: entity.authorized,
      paid: entity.paid,
    };
  }
  const values = entity.byFunction[area] ?? {};
  // A function absent from a declared report means nothing was budgeted or spent on it.
  return {
    population: entity.population,
    planned: entity.planned == null ? null : (values.planned ?? 0),
    authorized: entity.authorized == null ? null : (values.authorized ?? 0),
    paid: entity.paid == null ? null : (values.paid ?? 0),
  };
}

const rowsCache = new Map<string, MunicipalityRow[]>();

export function getMunicipalityRows(year: number, area: string | null = null): MunicipalityRow[] {
  const key = `${year}:${area ?? ""}`;
  const cached = rowsCache.get(key);
  if (cached) return cached;

  const rows = MUNICIPALITIES.map((m) => {
    const entity = getEntityYear(m.code, year);
    const figures = pickFigures(entity, area);
    const revenue = entity?.revenue?.total ?? null;
    return {
      ...m,
      ...figures,
      sizeClass: getSizeClass(figures.population),
      execution: ratio(figures.paid, figures.authorized),
      paidPerCapita: ratio(figures.paid, figures.population),
      revenue,
      revenuePerCapita: ratio(revenue, figures.population),
    };
  });
  rowsCache.set(key, rows);
  return rows;
}

export function medianPerCapita(rows: MunicipalityRow[]) {
  return median(rows.map((r) => r.paidPerCapita));
}

export type Comparison = { label: string; value: number | null; count: number };

/** Per-capita paid medians for the state, the municipality's territory and its size class. */
export function getComparisons(code: string, year: number, area: string | null): Comparison[] {
  const rows = getMunicipalityRows(year, area);
  const self = rows.find((r) => r.code === code);
  if (!self) return [];
  const territoryRows = rows.filter((r) => r.territory === self.territory);
  const sizeRows = self.sizeClass ? rows.filter((r) => r.sizeClass?.id === self.sizeClass!.id) : [];

  return [
    { label: "Mediana de Sergipe", value: medianPerCapita(rows), count: rows.length },
    { label: `Mediana do território`, value: medianPerCapita(territoryRows), count: territoryRows.length },
    ...(self.sizeClass ? [{ label: `Mediana do mesmo porte`, value: medianPerCapita(sizeRows), count: sizeRows.length }] : []),
  ];
}

export type PeerStat = {
  label: string;
  format: "brl" | "percent";
  value: number | null;
  sizeMedian: number | null;
  territoryMedian: number | null;
  stateMedian: number | null;
  /** 1 = highest value among the 75 municipalities. */
  rank: number | null;
};

/** Where the municipality stands among its peers on the main indicators. */
export function getPeerStats(code: string, year: number): PeerStat[] {
  const rows = getMunicipalityRows(year);
  const self = rows.find((r) => r.code === code);
  if (!self) return [];
  const sizeRows = rows.filter((r) => r.sizeClass?.id === self.sizeClass?.id);
  const territoryRows = rows.filter((r) => r.territory === self.territory);

  const stat = (label: string, format: PeerStat["format"], pick: (r: MunicipalityRow) => number | null): PeerStat => {
    const value = pick(self);
    const ranked = rows.map(pick).filter((v): v is number => v != null).sort((a, b) => b - a);
    return {
      label,
      format,
      value,
      sizeMedian: median(sizeRows.map(pick)),
      territoryMedian: median(territoryRows.map(pick)),
      stateMedian: median(rows.map(pick)),
      rank: value == null ? null : ranked.indexOf(value) + 1,
    };
  };

  return [
    stat("Receita por habitante", "brl", (r) => r.revenuePerCapita),
    stat("Gasto por habitante", "brl", (r) => r.paidPerCapita),
    stat("Orçamento executado", "percent", (r) => r.execution),
    stat("Gasto pago ÷ orçamento aprovado", "percent", (r) => ratio(r.paid, r.planned)),
  ];
}

/** Sum of all municipalities (not the state government). */
export function getMunicipalTotals(year: number): Figures & { revenue: number } {
  const rows = getMunicipalityRows(year);
  const sum = (pick: (r: MunicipalityRow) => number | null) => rows.reduce((acc, r) => acc + (pick(r) ?? 0), 0);
  return {
    population: sum((r) => r.population),
    planned: sum((r) => r.planned),
    authorized: sum((r) => r.authorized),
    paid: sum((r) => r.paid),
    revenue: sum((r) => r.revenue),
  };
}

export type AreaRow = {
  code: string;
  name: string;
  planned: number | null;
  authorized: number | null;
  paid: number | null;
  execution: number | null;
  share: number | null;
  paidPerCapita: number | null;
  stateMedianPerCapita: number | null;
};

/** One row per government area, sorted by amount paid. */
export function getAreaRows(entityCode: string, year: number, withStateMedian: boolean): AreaRow[] {
  const entity = getEntityYear(entityCode, year);
  if (!entity) return [];

  return Object.entries(entity.byFunction)
    .map(([code, v]) => ({
      code,
      name: FUNCTIONS[code] ?? code,
      planned: v.planned ?? null,
      authorized: v.authorized ?? null,
      paid: v.paid ?? null,
      execution: ratio(v.paid, v.authorized),
      share: ratio(v.paid, entity.paid),
      paidPerCapita: ratio(v.paid ?? 0, entity.population),
      stateMedianPerCapita: withStateMedian ? medianPerCapita(getMunicipalityRows(year, code)) : null,
    }))
    .filter((r) => (r.paid ?? 0) > 0 || (r.planned ?? 0) > 0)
    .sort((a, b) => (b.paid ?? 0) - (a.paid ?? 0) || (b.planned ?? 0) - (a.planned ?? 0));
}

export type SeriesPoint = { year: number; value: number | null };

/** When `real` is true, values are converted to reais of the IPCA base year. */
const adjust = (value: number | null, year: number, real: boolean) => (real ? toRealValue(value, year) : value);

/** Per-capita paid over the years, oldest first. */
export function getPerCapitaSeries(entityCode: string, area: string | null, real = false): SeriesPoint[] {
  return [...YEARS].reverse().map((year) => {
    const f = pickFigures(getEntityYear(entityCode, year), area);
    return { year, value: adjust(ratio(f.paid, f.population), year, real) };
  });
}

export function getStateMedianSeries(area: string | null, real = false): SeriesPoint[] {
  return [...YEARS]
    .reverse()
    .map((year) => ({ year, value: adjust(medianPerCapita(getMunicipalityRows(year, area)), year, real) }));
}

export function getSizeMedianSeries(code: string, area: string | null, real = false): SeriesPoint[] {
  return [...YEARS].reverse().map((year) => {
    const rows = getMunicipalityRows(year, area);
    const self = rows.find((r) => r.code === code);
    const value = medianPerCapita(rows.filter((r) => r.sizeClass?.id === self?.sizeClass?.id));
    return { year, value: adjust(value, year, real) };
  });
}
