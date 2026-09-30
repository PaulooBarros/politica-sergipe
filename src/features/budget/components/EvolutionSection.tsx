import LineChart from "@/components/charts/LineChart";
import FilterForm from "@/components/ui/FilterForm";
import Section from "@/components/ui/Section";
import { SegmentedLinks } from "@/components/ui/Segmented";
import SelectField from "@/components/ui/SelectField";
import SourceNote from "@/components/ui/SourceNote";
import Term from "@/components/ui/Term";
import { formatBRL } from "@/lib/format";
import { FUNCTIONS, IPCA, YEARS } from "../data";
import type { SeriesPoint } from "../metrics";
import { areaOptions } from "../options";

type Props = {
  eyebrow: string;
  year: number;
  area: string | null;
  /** true = values corrected by IPCA to reais of the base year. */
  real: boolean;
  /** Page path without query, e.g. "/municipios/aracaju". */
  basePath: string;
  main: { label: string; points: SeriesPoint[] };
  references?: { label: string; points: SeriesPoint[] }[];
};

/** Reads ?inflacao=; correction is on unless explicitly turned off. */
export function parseReal(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) !== "nao";
}

export default function EvolutionSection({ eyebrow, year, area, real, basePath, main, references = [] }: Props) {
  const areaName = area ? FUNCTIONS[area].toLowerCase() : null;
  const first = YEARS[YEARS.length - 1];
  const last = YEARS[0];
  const firstPoint = main.points.find((p) => p.value != null);
  const lastPoint = main.points.findLast((p) => p.value != null);
  const change = firstPoint && lastPoint && firstPoint !== lastPoint && firstPoint.value ? lastPoint.value! / firstPoint.value - 1 : null;
  const what = `o gasto por habitante${areaName ? ` em ${areaName}` : ""}`;

  const title =
    change == null
      ? `Gasto por habitante${areaName ? ` em ${areaName}` : ""}, ${first}–${last}`
      : `${real ? "Descontada a inflação, " : "Em valores nominais, "}${what} ${Math.abs(change) < 0.03 ? "ficou estável" : `${change > 0 ? "cresceu" : "caiu"} ${Math.round(Math.abs(change) * 100)}%`} entre ${firstPoint!.year} e ${lastPoint!.year}`;

  const href = (r: boolean) =>
    `${basePath}?${new URLSearchParams({ ano: String(year), ...(area ? { area } : {}), ...(r ? {} : { inflacao: "nao" }) })}#evolucao`;

  return (
    <Section
      id="evolucao"
      eyebrow={eyebrow}
      title={<span data-testid="evolution-change">{title}</span>}
      backToTop
      description={
        <p className="text-[15px] text-ink-500">
          Gasto pago por habitante{areaName ? ` em ${areaName}` : ""} ·{" "}
          {real ? (
            <>
              em <Term id="ipca">reais de {IPCA.baseYear}</Term>, corrigidos pela inflação
            </>
          ) : (
            "em reais de cada ano, sem correção"
          )}
        </p>
      }
      actions={
        <>
          <FilterForm className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="ano" value={year} />
            {!real && <input type="hidden" name="inflacao" value="nao" />}
            <SelectField name="area" label="Área" value={area ?? ""} options={areaOptions()} className="min-w-52" />
          </FilterForm>
          <SegmentedLinks
            label="Tipo de valor"
            items={[
              { label: "Corrigido pela inflação", href: href(true), active: real },
              { label: "Valores nominais", href: href(false), active: !real },
            ]}
          />
        </>
      }
    >
      <LineChart
        title={`${title}. Gasto por habitante${areaName ? ` em ${areaName}` : ""}, ${first} a ${last}`}
        format={formatBRL}
        series={[main, ...references]}
      />
      <SourceNote>
        SICONFI/Tesouro Nacional (DCA Anexo I-E), {first}–{last}.{real ? ` Correção: ${IPCA.source}.` : ""} A população usada
        pelo Tesouro muda de critério entre anos (estimativas e, a partir de 2024, Censo 2022), o que também afeta o valor
        por habitante.
      </SourceNote>
    </Section>
  );
}
