import { getLegalChecks, type LegalCheck } from "@/features/legal/checks";
import { formatBRL, formatPercent, formatPoints } from "@/lib/format";
import { getEntityYear } from "./data";
import { getMunicipalityRows, median, type MunicipalityRow, ratio } from "./metrics";

export type Distribution = {
  id: string;
  label: string;
  /** "points": value already in 0–100 (legal percentages); "ratio": 0–1. */
  kind: "brl" | "ratio" | "points";
  format: (v: number | null) => string;
  value: number | null;
  /** Every municipality with data, for the grey ticks. */
  all: number[];
  stateMedian: number | null;
  territoryMedian: number | null;
  sizeMedian: number | null;
  /** 1 = highest value among those with data. */
  rank: number | null;
  /** Legal minimum or maximum, when there is one. */
  legal?: { value: number; label: string };
};

type Indicator = {
  id: string;
  label: string;
  kind: Distribution["kind"];
  pick: (r: MunicipalityRow, year: number) => number | null;
  legal?: { value: number; label: string };
};

const legalValue = (id: LegalCheck["id"]) => (r: MunicipalityRow, year: number) =>
  getLegalChecks(r.code, year).find((c) => c.id === id)?.value ?? null;

export const PEER_INDICATORS: Indicator[] = [
  { id: "gasto", label: "Gasto por habitante", kind: "brl", pick: (r) => r.paidPerCapita },
  { id: "receita", label: "Receita por habitante", kind: "brl", pick: (r) => r.revenuePerCapita },
  { id: "execucao", label: "Orçamento executado", kind: "ratio", pick: (r) => r.execution },
  { id: "pessoal", label: "Gasto com pessoal", kind: "points", pick: legalValue("personnel"), legal: { value: 54, label: "limite 54%" } },
  { id: "educacao", label: "Educação (% dos impostos)", kind: "points", pick: legalValue("education"), legal: { value: 25, label: "mínimo 25%" } },
  { id: "saude", label: "Saúde (% dos impostos)", kind: "points", pick: legalValue("health"), legal: { value: 15, label: "mínimo 15%" } },
  {
    id: "royalties",
    label: "Peso dos royalties na receita",
    kind: "ratio",
    pick: (r, year) => {
      const revenue = getEntityYear(r.code, year)?.revenue;
      return ratio(revenue?.sources.royalties, revenue?.total);
    },
  },
];

const FORMAT = { brl: formatBRL, ratio: formatPercent, points: formatPoints };

/** Where one municipality sits among the 75, its territory and its size class, indicator by indicator. */
export function getDistributions(code: string, year: number): Distribution[] {
  const rows = getMunicipalityRows(year);
  const self = rows.find((r) => r.code === code);
  if (!self) return [];
  const sizeRows = rows.filter((r) => r.sizeClass?.id === self.sizeClass?.id);
  const territoryRows = rows.filter((r) => r.territory === self.territory);

  return PEER_INDICATORS.map((ind) => {
    const pick = (r: MunicipalityRow) => ind.pick(r, year);
    const all = rows.map(pick).filter((v): v is number => v != null);
    const value = pick(self);
    const ranked = [...all].sort((a, b) => b - a);
    return {
      id: ind.id,
      label: ind.label,
      kind: ind.kind,
      format: FORMAT[ind.kind],
      value,
      all,
      stateMedian: median(rows.map(pick)),
      territoryMedian: median(territoryRows.map(pick)),
      sizeMedian: median(sizeRows.map(pick)),
      rank: value == null ? null : ranked.indexOf(value) + 1,
      legal: ind.legal,
    };
  });
}

/** "18% acima da mediana do porte" (money) or "3,2 pontos acima" (percentages). */
export function describeGap(d: Pick<Distribution, "kind" | "value">, reference: number | null, of: string) {
  if (d.value == null) return "Não declarado neste ano.";
  if (reference == null || reference === 0) return "";
  if (d.kind === "brl") {
    const r = d.value / reference;
    const pct = Math.round(Math.abs(r - 1) * 100);
    return pct < 3 ? `Em linha com a mediana ${of}` : `${pct}% ${r > 1 ? "acima" : "abaixo"} da mediana ${of}`;
  }
  const diff = (d.value - reference) * (d.kind === "ratio" ? 100 : 1);
  const abs = Math.abs(diff);
  if (abs < 0.5) return `Em linha com a mediana ${of}`;
  const pts = abs.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  return `${pts} ${abs >= 2 ? "pontos percentuais" : "ponto percentual"} ${diff > 0 ? "acima" : "abaixo"} da mediana ${of}`;
}
