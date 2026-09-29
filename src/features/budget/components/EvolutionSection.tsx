import LineChart from "@/components/charts/LineChart";
import FilterForm from "@/components/ui/FilterForm";
import Section from "@/components/ui/Section";
import SelectField from "@/components/ui/SelectField";
import Term from "@/components/ui/Term";
import { formatBRL, formatPercent } from "@/lib/format";
import { FUNCTIONS, IPCA, YEARS } from "../data";
import type { SeriesPoint } from "../metrics";
import { areaOptions } from "../options";

type Props = {
  number: string;
  year: number;
  area: string | null;
  /** true = values corrected by IPCA to reais of the base year. */
  real: boolean;
  main: { label: string; points: SeriesPoint[] };
  references?: { label: string; points: SeriesPoint[] }[];
};

const REFERENCE_STYLES = [
  { stroke: "stroke-alert-500", fill: "fill-alert-500", dashed: true },
  { stroke: "stroke-ink-500", fill: "fill-ink-500", dashed: true },
];

/** Reads ?inflacao=; correction is on unless explicitly turned off. */
export function parseReal(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) !== "nao";
}

export default function EvolutionSection({ number, year, area, real, main, references = [] }: Props) {
  const areaName = area ? FUNCTIONS[area] : "todas as áreas";
  const first = YEARS[YEARS.length - 1];
  const last = YEARS[0];
  const firstValue = main.points[0]?.value;
  const lastValue = main.points[main.points.length - 1]?.value;
  const change = firstValue && lastValue != null ? lastValue / firstValue - 1 : null;

  return (
    <Section
      id="evolucao"
      number={number}
      title={`Evolução ${first}–${last}`}
      description={
        <>
          Gasto real por habitante em {areaName}, ano a ano
          {real ? (
            <>
              , em <Term id="ipca">reais de {IPCA.baseYear}</Term> (corrigidos pela inflação).
            </>
          ) : (
            ", em reais de cada ano (sem correção pela inflação)."
          )}
        </>
      }
      actions={
        <FilterForm className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="ano" value={year} />
          <SelectField name="area" label="Área" value={area ?? ""} options={areaOptions()} />
          <SelectField
            name="inflacao"
            label="Valores"
            value={real ? "sim" : "nao"}
            options={[
              { value: "sim", label: `Corrigidos (reais de ${IPCA.baseYear})` },
              { value: "nao", label: "Sem correção" },
            ]}
          />
        </FilterForm>
      }
    >
      {change != null && (
        <p className="mb-4 text-lg text-ink-900" data-testid="evolution-change">
          De {first} a {last}, o gasto por habitante {change >= 0 ? "cresceu" : "caiu"}{" "}
          <strong>{formatPercent(Math.abs(change))}</strong>
          {real ? " já descontada a inflação." : " em valores nominais (sem descontar a inflação)."}
        </p>
      )}
      <LineChart
        title={`Gasto por habitante em ${areaName}, ${first} a ${last}`}
        format={formatBRL}
        series={[
          { label: main.label, stroke: "stroke-brand-500", fill: "fill-brand-500", points: main.points },
          ...references.map((r, i) => ({ ...REFERENCE_STYLES[i % REFERENCE_STYLES.length], ...r })),
        ]}
      />
      <p className="mt-3 text-xs text-ink-500">
        {real ? `Correção: ${IPCA.source}. ` : ""}A população usada pelo Tesouro muda de critério entre anos (estimativas
        e, a partir de 2024, dados do Censo 2022), o que também afeta o valor por habitante.
      </p>
    </Section>
  );
}
