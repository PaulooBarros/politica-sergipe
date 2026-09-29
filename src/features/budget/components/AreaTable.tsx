import Link from "next/link";
import ComparisonBar from "@/components/charts/ComparisonBar";
import ProgressBar from "@/components/charts/ProgressBar";
import { DataTable, Td, Th } from "@/components/ui/DataTable";
import { formatBRL, formatBRLShort, formatPercent } from "@/lib/format";
import type { AreaRow } from "../metrics";

type Props = {
  rows: AreaRow[];
  showMedian: boolean;
  /** Builds the link that focuses the evolution chart on one area. */
  areaHref: (code: string) => string;
};

export default function AreaTable({ rows, showMedian, areaHref }: Props) {
  const max = Math.max(...rows.map((r) => Math.max(r.paidPerCapita ?? 0, r.stateMedianPerCapita ?? 0)), 1);

  return (
    <>
      {showMedian && (
        <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-700">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-4 rounded-sm bg-brand-500" aria-hidden /> Gasto por habitante
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3.5 w-[3px] rounded-full bg-alert-500" aria-hidden /> Mediana dos municípios de Sergipe
          </span>
        </div>
      )}
      <DataTable testId="area-table" minWidth={760}>
        <thead>
          <tr>
            <Th>Área</Th>
            <Th align="right">Previsto</Th>
            <Th align="right">Pago</Th>
            <Th>Executado</Th>
            <Th align="right">% do gasto</Th>
            <Th align="right">Por habitante</Th>
            {showMedian && <Th className="w-44">Comparação</Th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code} className="hover:bg-paper-200/40">
              <Td>
                <Link href={areaHref(r.code)} scroll={false} className="font-medium text-brand-800 hover:underline">
                  {r.name}
                </Link>
              </Td>
              <Td align="right" className="text-ink-500">{formatBRLShort(r.planned)}</Td>
              <Td align="right" className="font-medium">{formatBRLShort(r.paid)}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <span className="w-12 tabular-nums">{formatPercent(r.execution)}</span>
                  <div className="w-14">
                    <ProgressBar ratio={r.execution} label={`${formatPercent(r.execution)} executado`} />
                  </div>
                </div>
              </Td>
              <Td align="right" className="text-ink-700">{formatPercent(r.share)}</Td>
              <Td align="right" className="font-medium">{formatBRL(r.paidPerCapita)}</Td>
              {showMedian && (
                <Td>
                  <ComparisonBar
                    value={r.paidPerCapita ?? 0}
                    reference={r.stateMedianPerCapita}
                    max={max}
                    label={`${r.name}: ${formatBRL(r.paidPerCapita)} por habitante; mediana de Sergipe ${formatBRL(r.stateMedianPerCapita)}`}
                  />
                  <p className="mt-1 text-xs tabular-nums text-ink-500">Mediana SE: {formatBRL(r.stateMedianPerCapita)}</p>
                </Td>
              )}
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
