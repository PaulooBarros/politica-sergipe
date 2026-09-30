type Series = {
  label: string;
  points: { year: number; value: number | null }[];
};

type Props = {
  /** First series is the main one (brand, labelled values); the rest are references. */
  series: Series[];
  format: (value: number) => string;
  title: string;
};

const WIDTH = 720;
const HEIGHT = 300;
const PAD = { top: 24, right: 150, bottom: 34, left: 76 };

// References are told apart by stroke pattern, so the chart also reads in greyscale.
const REFERENCE_STYLES = [
  { className: "stroke-paper-400", dash: "7 5" },
  { className: "stroke-ink-500", dash: "2 4" },
];

function niceMax(value: number) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value / 4)! * magnitude;
  return Math.ceil(value / step) * step;
}

/** Multi-series line chart in SVG, labelled directly, with a table for screen readers. */
export default function LineChart({ series, format, title }: Props) {
  const years = series[0]?.points.map((p) => p.year) ?? [];
  const values = series.flatMap((s) => s.points.map((p) => p.value ?? 0));
  const yMax = niceMax(Math.max(...values, 0));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * yMax);

  const x = (i: number) => PAD.left + (years.length === 1 ? 0 : (i / (years.length - 1)) * (WIDTH - PAD.left - PAD.right));
  const y = (v: number) => PAD.top + (1 - v / yMax) * (HEIGHT - PAD.top - PAD.bottom);

  // End labels: nudge apart when two series finish at almost the same height.
  const ends = series
    .map((s, si) => {
      const i = s.points.findLastIndex((p) => p.value != null);
      return i < 0 ? null : { si, i, y: y(s.points[i].value!) };
    })
    .filter((e): e is { si: number; i: number; y: number } => e != null)
    .sort((a, b) => a.y - b.y);
  for (let k = 1; k < ends.length; k++) if (ends[k].y - ends[k - 1].y < 16) ends[k].y = ends[k - 1].y + 16;

  return (
    <figure className="m-0">
      <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-700 sm:hidden" aria-hidden>
        {series.map((s, si) => (
          <li key={s.label} className="flex items-center gap-2">
            <svg width="24" height="10">
              <line
                x1="0"
                y1="5"
                x2="24"
                y2="5"
                strokeWidth={si === 0 ? 3 : 2}
                strokeDasharray={si === 0 ? undefined : REFERENCE_STYLES[(si - 1) % 2].dash}
                className={si === 0 ? "stroke-brand-600" : REFERENCE_STYLES[(si - 1) % 2].className}
              />
            </svg>
            {s.label}
          </li>
        ))}
      </ul>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full overflow-visible" role="img" aria-label={title}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={WIDTH - PAD.right + 20} y1={y(t)} y2={y(t)} className={t === 0 ? "stroke-paper-300" : "stroke-paper-200"} />
            <text x={PAD.left - 10} y={y(t)} dy="0.32em" textAnchor="end" className="fill-ink-500 text-[12px] tabular-nums">
              {format(t)}
            </text>
          </g>
        ))}
        {years.map((year, i) => (
          <text key={year} x={x(i)} y={HEIGHT - 8} textAnchor="middle" className="fill-ink-700 text-[13px] tabular-nums">
            {year}
          </text>
        ))}
        {[...series].reverse().map((s) => {
          const si = series.indexOf(s);
          const main = si === 0;
          const style = REFERENCE_STYLES[(si - 1) % 2];
          const d = s.points
            .map((p, i) => (p.value == null ? null : `${x(i)},${y(p.value)}`))
            .filter(Boolean)
            .join(" L ");
          const end = ends.find((e) => e.si === si);
          return (
            <g key={s.label}>
              <path
                d={`M ${d}`}
                fill="none"
                strokeWidth={main ? 3 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={main ? undefined : style.dash}
                className={main ? "stroke-brand-600" : style.className}
              />
              {s.points.map((p, i) =>
                p.value == null ? null : (
                  <g key={p.year}>
                    {main && (
                      <>
                        <circle cx={x(i)} cy={y(p.value)} r="6" strokeWidth="2" className="fill-brand-600 stroke-white" />
                        <text x={x(i)} y={y(p.value) + 22} textAnchor="middle" className="fill-ink-900 stroke-white text-[13px] font-semibold tabular-nums [paint-order:stroke] [stroke-width:4px]">
                          {format(p.value)}
                        </text>
                      </>
                    )}
                    <circle cx={x(i)} cy={y(p.value)} r="12" className="fill-transparent">
                      <title>{`${s.label}, ${p.year}: ${format(p.value)}`}</title>
                    </circle>
                  </g>
                ),
              )}
              {end && (
                <text
                  x={x(end.i) + 14}
                  y={end.y}
                  dy="0.32em"
                  className={`hidden text-[13px] sm:block ${main ? "fill-brand-700 font-semibold" : "fill-ink-500"}`}
                >
                  {s.label.length > 22 ? `${s.label.slice(0, 21)}…` : s.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th>Ano</th>
            {series.map((s) => (
              <th key={s.label}>{s.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {years.map((year, i) => (
            <tr key={year}>
              <td>{year}</td>
              {series.map((s) => (
                <td key={s.label}>{s.points[i].value == null ? "não declarado" : format(s.points[i].value!)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
