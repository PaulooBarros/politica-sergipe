import Link from "next/link";
import BarList from "@/components/charts/BarList";
import Waffle, { WAFFLE_COLORS, WAFFLE_OTHER } from "@/components/charts/Waffle";
import FilterForm from "@/components/ui/FilterForm";
import SelectField from "@/components/ui/SelectField";
import { formatBRL, formatBRLCompact, formatBRLShort } from "@/lib/format";
import { FUNCTIONS } from "../data";
import { hundredSplit } from "../headlines";
import type { AreaRow } from "../metrics";
import AreaTable from "./AreaTable";

type Props = {
  rows: AreaRow[];
  year: number;
  /** Highlighted area (function code from ?area=), or null. */
  area: string | null;
  /** Page path without query, e.g. "/municipios/aracaju". */
  basePath: string;
  /** Other query params to keep when changing the area (e.g. inflacao=nao). */
  keep?: Record<string, string>;
  showMedian: boolean;
};

const TOP = 4;

/** "Para onde vai": R$ 100 waffle, one bar per area and the full table on demand. */
export default function SpendingBreakdown({ rows, year, area, basePath, keep = {}, showMedian }: Props) {
  const { rows: withShare, units } = hundredSplit(rows);
  if (!withShare.length) return <p className="text-body text-ink-700">Os gastos por área deste ano não foram declarados.</p>;

  const query = (extra: Record<string, string>) => new URLSearchParams({ ano: String(year), ...keep, ...extra }).toString();
  const selectedIndex = area ? withShare.findIndex((r) => r.code === area) : -1;
  const selected = selectedIndex >= 0 ? withShare[selectedIndex] : null;

  // Top areas, plus the highlighted one when it is smaller, then everything else.
  const shown = withShare.map((r, i) => ({ r, u: units[i], i })).filter((x) => x.i < TOP || x.i === selectedIndex);
  const restUnits = 100 - shown.reduce((a, x) => a + x.u, 0);
  const parts = [
    ...shown.map((x, k) => ({ label: x.r.name, units: x.u, color: WAFFLE_COLORS[k] ?? "bg-brand-200" })),
    ...(restUnits > 0 ? [{ label: "Outras áreas", units: restUnits, color: WAFFLE_OTHER }] : []),
  ];
  const highlight = selected ? shown.findIndex((x) => x.i === selectedIndex) : null;

  return (
    <div className="flex flex-col gap-8" data-testid="hundred-reais">
      <div className="grid items-start gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <figure className="m-0 flex flex-col gap-3">
          <figcaption className="text-sm font-semibold text-ink-700">De cada R$ 100 gastos</figcaption>
          <Waffle parts={parts} highlight={highlight} label={parts.map((p) => `R$ ${p.units} ${p.label}`).join(", ")} />
          <ul className="mt-1 grid max-w-[22rem] grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            {parts.map((p) => (
              <li key={p.label} className="flex items-center gap-2">
                <span className={`h-3 w-3 shrink-0 rounded-[2px] ${p.color} ${p.color === WAFFLE_OTHER ? "shadow-[inset_0_0_0_1px_var(--color-paper-300)]" : ""}`} aria-hidden />
                <span className="font-semibold text-ink-900 tabular-nums">R$ {p.units}</span>
                <span className="truncate text-ink-700">{p.label}</span>
              </li>
            ))}
          </ul>
        </figure>

        <div className="flex min-w-0 flex-col gap-4">
          <FilterForm className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="ano" value={year} />
            {Object.entries(keep).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
            <SelectField
              name="area"
              label="Destacar área"
              value={area ?? ""}
              className="min-w-56"
              options={[{ value: "", label: "Todas as áreas" }, ...withShare.map((r) => ({ value: r.code, label: r.name }))]}
            />
          </FilterForm>
          {selected && (
            <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3.5 text-[15px] leading-[23px] text-ink-700">
              <strong className="font-semibold text-ink-900">{selected.name}:</strong> {formatBRLShort(selected.paid)} pagos em {year}, ou{" "}
              {formatBRL(selected.paidPerCapita)} por habitante. De cada R$ 100 gastos, R$ {units[selectedIndex]} foram para esta área.{" "}
              <a href="#evolucao" className="link">
                Ver a evolução desta área
              </a>{" "}
              ·{" "}
              <Link href={`${basePath}?${query({})}#gastos`} scroll={false} className="link">
                Ver todas
              </Link>
            </div>
          )}
          {area && !selected && (
            <p className="text-sm text-ink-500">Sem gasto declarado em {FUNCTIONS[area]?.toLowerCase() ?? "esta área"} neste ano.</p>
          )}
          <BarList
            labelWidth="11rem"
            rows={withShare.map((r, i) => ({
              key: r.code,
              label: (
                <Link href={`${basePath}?${query({ area: r.code })}#gastos`} scroll={false} className="hover:text-brand-700 hover:underline">
                  {r.name}
                </Link>
              ),
              value: r.share ?? 0,
              tone: r.code === area ? "strong" : "brand",
              dim: selected != null && r.code !== area,
              valueText: (
                <>
                  <strong className="font-semibold text-ink-900">R$ {units[i]}</strong>{" "}
                  <span className="text-ink-500">· {formatBRLCompact(r.paid)}</span>
                </>
              ),
            }))}
          />
        </div>
      </div>

      <details className="group rounded-lg border border-paper-200">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-[15px] font-semibold text-brand-700 hover:bg-brand-50">
          Ver tabela com previsto, pago e executado em cada área
          <span aria-hidden className="transition-transform group-open:rotate-180">▾</span>
        </summary>
        <div className="border-t border-paper-200 p-3 sm:p-4">
          <AreaTable rows={rows} showMedian={showMedian} areaHref={(code) => `${basePath}?${query({ area: code })}#evolucao`} />
        </div>
      </details>
    </div>
  );
}
