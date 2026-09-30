import Link from "next/link";
import ProgressBar from "@/components/charts/ProgressBar";
import { DataTable, Td, Th } from "@/components/ui/DataTable";
import type { MunicipalityRow } from "@/features/budget/metrics";
import { formatBRL, formatBRLCompact, formatInteger, formatPercent } from "@/lib/format";

type Props = {
  rows: MunicipalityRow[];
  currentCode: string;
  year: number;
};

export default function TerritoryNeighbors({ rows, currentCode, year }: Props) {
  return (
    <DataTable minWidth={720} caption="Municípios do mesmo território">
      <thead>
        <tr>
          <Th>Município</Th>
          <Th align="right">População</Th>
          <Th align="right">Receita/hab.</Th>
          <Th align="right">Gasto/hab.</Th>
          <Th align="right">Pago</Th>
          <Th>Executado</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const current = r.code === currentCode;
          return (
            <tr key={r.code} className={current ? "bg-brand-50" : undefined} aria-current={current ? "true" : undefined}>
              <Td>
                {current ? (
                  <span className="font-semibold text-ink-900">{r.name} (este)</span>
                ) : (
                  <Link href={`/municipios/${r.slug}?ano=${year}`} className="font-medium text-brand-700 hover:underline">
                    {r.name}
                  </Link>
                )}
              </Td>
              <Td align="right">{formatInteger(r.population)}</Td>
              <Td align="right">{formatBRL(r.revenuePerCapita)}</Td>
              <Td align="right" className="font-semibold text-ink-900">{formatBRL(r.paidPerCapita)}</Td>
              <Td align="right">{formatBRLCompact(r.paid)}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <span className="w-12 tabular-nums">{formatPercent(r.execution)}</span>
                  <div className="w-14">
                    <ProgressBar ratio={r.execution} label={`${formatPercent(r.execution)} executado`} />
                  </div>
                </div>
              </Td>
            </tr>
          );
        })}
      </tbody>
    </DataTable>
  );
}
