import RangeDots, { LineSwatch, MarkerSwatch } from "@/components/charts/RangeDots";
import SourceNote from "@/components/ui/SourceNote";
import Term from "@/components/ui/Term";
import { describeGap, type Distribution } from "../peers";

type Props = {
  name: string;
  year: number;
  distributions: Distribution[];
  sizeLabel: string;
  sizeCount: number;
  territory: string;
};

/** Each indicator as a line of all 75 municipalities, with this one and the three medians marked. */
export default function PeerComparison({ name, year, distributions, sizeLabel, sizeCount, territory }: Props) {
  return (
    <div className="flex flex-col gap-2" data-testid="peer-table">
      <ul aria-label="Legenda" className="mb-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-700">
        <li className="flex items-center gap-2">
          <MarkerSwatch shape="dot" /> {name}
        </li>
        <li className="flex items-center gap-2">
          <LineSwatch line="solid" /> <Term id="mediana">Mediana</Term>&nbsp;de Sergipe
        </li>
        <li className="flex items-center gap-2">
          <LineSwatch line="dotted" /> Mediana do território
        </li>
        <li className="flex items-center gap-2">
          <LineSwatch line="dashed" /> Mediana do porte
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-0.5 bg-paper-300" aria-hidden /> Cada um dos 75 municípios
        </li>
      </ul>
      {distributions.map((d) => (
        <div key={d.id} className="grid items-center gap-x-8 gap-y-2 border-t border-paper-200 py-4 md:grid-cols-[15rem_minmax(0,1fr)]">
          <div>
            <h3 className="text-base font-semibold text-ink-900">{d.label}</h3>
            <p className="text-sm text-ink-700">{describeGap(d, d.sizeMedian, "do porte")}</p>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            {d.value == null ? (
              <p className="text-sm text-ink-500 italic">não declarado</p>
            ) : (
              <RangeDots
                all={d.all}
                markers={[{ value: d.value, label: `${name}: ${d.format(d.value)}`, shape: "dot" }]}
                references={[
                  { value: d.stateMedian, label: `Mediana de Sergipe: ${d.format(d.stateMedian)}`, line: "solid" },
                  { value: d.territoryMedian, label: `Mediana do território: ${d.format(d.territoryMedian)}`, line: "dotted" },
                  { value: d.sizeMedian, label: `Mediana do porte: ${d.format(d.sizeMedian)}`, line: "dashed" },
                ]}
                label={`${d.label}: ${name} ${d.format(d.value)}; mediana de Sergipe ${d.format(d.stateMedian)}, do território ${d.format(d.territoryMedian)}, do porte ${d.format(d.sizeMedian)}`}
              />
            )}
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-500 tabular-nums">
              <span>
                <strong className="font-semibold text-brand-700">{d.format(d.value)}</strong> {name}
              </span>
              <span>SE {d.format(d.stateMedian)}</span>
              <span>Território {d.format(d.territoryMedian)}</span>
              <span>Porte {d.format(d.sizeMedian)}</span>
              {d.rank != null && (
                <span>
                  {d.rank}º maior valor entre {d.all.length}
                </span>
              )}
            </p>
          </div>
        </div>
      ))}
      <SourceNote className="mt-2">
        SICONFI/Tesouro Nacional, {year}. Território: {territory}. Porte: {sizeLabel.toLowerCase()} ({sizeCount} municípios em
        Sergipe). A ordem dos valores não é um julgamento: mostra só onde o município fica entre os demais.
      </SourceNote>
    </div>
  );
}
