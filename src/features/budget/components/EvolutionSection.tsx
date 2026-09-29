import LineChart from "@/components/charts/LineChart";
import FilterForm from "@/components/ui/FilterForm";
import Section from "@/components/ui/Section";
import SelectField from "@/components/ui/SelectField";
import { formatBRL } from "@/lib/format";
import { FUNCTIONS, YEARS } from "../data";
import type { SeriesPoint } from "../metrics";
import { areaOptions } from "../options";

type Props = {
  number: string;
  year: number;
  area: string | null;
  main: { label: string; points: SeriesPoint[] };
  references?: { label: string; points: SeriesPoint[] }[];
};

const REFERENCE_STYLES = [
  { stroke: "stroke-alert-500", fill: "fill-alert-500", dashed: true },
  { stroke: "stroke-ink-500", fill: "fill-ink-500", dashed: true },
];

export default function EvolutionSection({ number, year, area, main, references = [] }: Props) {
  const areaName = area ? FUNCTIONS[area] : "todas as áreas";
  const first = YEARS[YEARS.length - 1];
  const last = YEARS[0];

  return (
    <Section
      id="evolucao"
      number={number}
      title={`Evolução ${first}–${last}`}
      description={`Gasto real por habitante em ${areaName}, ano a ano.`}
      actions={
        <FilterForm className="flex items-end gap-3">
          <input type="hidden" name="ano" value={year} />
          <SelectField name="area" label="Área" value={area ?? ""} options={areaOptions()} />
        </FilterForm>
      }
    >
      <LineChart
        title={`Gasto por habitante em ${areaName}, ${first} a ${last}`}
        format={formatBRL}
        series={[
          { label: main.label, stroke: "stroke-brand-500", fill: "fill-brand-500", points: main.points },
          ...references.map((r, i) => ({ ...REFERENCE_STYLES[i % REFERENCE_STYLES.length], ...r })),
        ]}
      />
      <p className="mt-3 text-xs text-ink-500">
        Valores em reais correntes (sem correção pela inflação). A população usada pelo Tesouro muda de critério entre
        anos (estimativas e, a partir de 2024, dados do Censo 2022), o que também afeta o valor por habitante.
      </p>
    </Section>
  );
}
