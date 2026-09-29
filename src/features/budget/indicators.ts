import { formatBRL, formatPercent } from "@/lib/format";
import { getEntityYear } from "./data";
import { getMunicipalityRows, ratio } from "./metrics";

export type Indicator = {
  id: string;
  label: string;
  description: string;
  format: (v: number) => string;
  values: (year: number) => Record<string, number | null>;
};

function perCapitaFor(area: string | null) {
  return (year: number) =>
    Object.fromEntries(getMunicipalityRows(year, area).map((r) => [r.code, r.paidPerCapita]));
}

export const INDICATORS: Indicator[] = [
  {
    id: "gasto-por-habitante",
    label: "Gasto por habitante",
    description: "Quanto a prefeitura pagou no ano, dividido pela população.",
    format: formatBRL,
    values: perCapitaFor(null),
  },
  {
    id: "receita-por-habitante",
    label: "Receita por habitante",
    description: "Quanto entrou no caixa da prefeitura no ano, dividido pela população.",
    format: formatBRL,
    values: (year) => Object.fromEntries(getMunicipalityRows(year).map((r) => [r.code, r.revenuePerCapita])),
  },
  {
    id: "royalties",
    label: "Peso dos royalties na receita",
    description: "Parte da receita que veio de royalties e compensações (petróleo, gás, energia, mineração).",
    format: formatPercent,
    values: (year) =>
      Object.fromEntries(
        getMunicipalityRows(year).map((r) => {
          const revenue = getEntityYear(r.code, year)?.revenue;
          return [r.code, ratio(revenue?.sources.royalties, revenue?.total)];
        }),
      ),
  },
  {
    id: "execucao",
    label: "Orçamento executado",
    description: "Quanto do orçamento autorizado virou pagamento no ano.",
    format: formatPercent,
    values: (year) => Object.fromEntries(getMunicipalityRows(year).map((r) => [r.code, r.execution])),
  },
  {
    id: "saude",
    label: "Saúde por habitante",
    description: "Gasto pago na função Saúde, dividido pela população.",
    format: formatBRL,
    values: perCapitaFor("10"),
  },
  {
    id: "educacao",
    label: "Educação por habitante",
    description: "Gasto pago na função Educação, dividido pela população.",
    format: formatBRL,
    values: perCapitaFor("12"),
  },
];

export function parseIndicator(value: string | string[] | undefined): Indicator {
  const id = Array.isArray(value) ? value[0] : value;
  return INDICATORS.find((i) => i.id === id) ?? INDICATORS[0];
}
