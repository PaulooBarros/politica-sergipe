import { DataTable, Td, Th } from "@/components/ui/DataTable";
import { formatBRL, formatPercent } from "@/lib/format";
import type { PeerStat } from "../metrics";

type Props = {
  stats: PeerStat[];
  sizeLabel: string;
  territory: string;
};

export default function PeerComparison({ stats, sizeLabel, territory }: Props) {
  const fmt = (s: PeerStat, v: number | null) => (s.format === "brl" ? formatBRL(v) : formatPercent(v));

  return (
    <DataTable minWidth={680} testId="peer-table">
      <thead>
        <tr>
          <Th>Indicador</Th>
          <Th align="right">Este município</Th>
          <Th align="right">Mediana do porte ({sizeLabel.toLowerCase()})</Th>
          <Th align="right">Mediana do território {territory}</Th>
          <Th align="right">Mediana de SE</Th>
          <Th align="right">Posição entre os 75</Th>
        </tr>
      </thead>
      <tbody>
        {stats.map((s) => (
          <tr key={s.label}>
            <Td className="font-medium">{s.label}</Td>
            <Td align="right" className="font-semibold text-ink-900">{fmt(s, s.value)}</Td>
            <Td align="right" className="text-ink-700">{fmt(s, s.sizeMedian)}</Td>
            <Td align="right" className="text-ink-700">{fmt(s, s.territoryMedian)}</Td>
            <Td align="right" className="text-ink-700">{fmt(s, s.stateMedian)}</Td>
            <Td align="right">{s.rank == null ? "—" : `${s.rank}º maior`}</Td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}
