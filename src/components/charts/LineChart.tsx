type Series = {
  label: string;
  /** Tailwind stroke/fill color classes, e.g. "stroke-brand-500" and "fill-brand-500". */
  stroke: string;
  fill: string;
  dashed?: boolean;
  points: { year: number; value: number | null }[];
};

type Props = {
  series: Series[];
  format: (value: number) => string;
  title: string;
};

const WIDTH = 640;
const HEIGHT = 260;
const PAD = { top: 16, right: 16, bottom: 32, left: 72 };

function niceMax(value: number) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value / 4)! * magnitude;
  return Math.ceil(value / step) * step;
}

/** Small multi-series line chart in SVG, with a table fallback for screen readers. */
export default function LineChart({ series, format, title }: Props) {
  const years = series[0]?.points.map((p) => p.year) ?? [];
  const values = series.flatMap((s) => s.points.map((p) => p.value ?? 0));
  const yMax = niceMax(Math.max(...values, 0));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * yMax);

  const x = (i: number) =>
    PAD.left + (years.length === 1 ? 0 : (i / (years.length - 1)) * (WIDTH - PAD.left - PAD.right));
  const y = (v: number) => PAD.top + (1 - v / yMax) * (HEIGHT - PAD.top - PAD.bottom);

  return (
    <figure>
      <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-700" aria-hidden>
        {series.map((s) => (
          <span key={s.label} className="flex items-center gap-2">
            <svg width="24" height="10">
              <line x1="0" y1="5" x2="24" y2="5" strokeWidth="2.5" strokeDasharray={s.dashed ? "5 3" : undefined} className={s.stroke} />
            </svg>
            {s.label}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label={title}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(t)} y2={y(t)} className="stroke-paper-200" />
            <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-ink-500 text-[11px]">
              {format(t)}
            </text>
          </g>
        ))}
        {years.map((year, i) => (
          <text key={year} x={x(i)} y={HEIGHT - 10} textAnchor="middle" className="fill-ink-500 text-[11px]">
            {year}
          </text>
        ))}
        {series.map((s) => {
          const d = s.points
            .map((p, i) => (p.value == null ? null : `${x(i)},${y(p.value)}`))
            .filter(Boolean)
            .join(" L ");
          return (
            <g key={s.label}>
              <path d={`M ${d}`} fill="none" strokeWidth="2.5" strokeDasharray={s.dashed ? "6 4" : undefined} className={s.stroke} />
              {s.points.map((p, i) =>
                p.value == null ? null : (
                  <g key={p.year}>
                    <circle cx={x(i)} cy={y(p.value)} r="4.5" strokeWidth="2" className={`${s.fill} stroke-paper-50`} />
                    {/* Larger invisible target for the native tooltip */}
                    <circle cx={x(i)} cy={y(p.value)} r="12" className="fill-transparent">
                      <title>{`${s.label}, ${p.year}: ${format(p.value)}`}</title>
                    </circle>
                  </g>
                ),
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
