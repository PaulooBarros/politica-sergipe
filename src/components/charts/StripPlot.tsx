type Point = { label: string; value: number };

type Props = {
  points: Point[];
  /** Legal minimum or maximum, drawn as a dashed line. */
  reference: number;
  referenceLabel: string;
  kind: "minimum" | "maximum";
  format: (v: number) => string;
  /** Summary read by screen readers instead of 75 dots. */
  label: string;
};

/**
 * One dot per municipality on a single axis. Dots on the wrong side of the
 * legal line are amber; the zone past a maximum is lightly hatched.
 */
export default function StripPlot({ points, reference, referenceLabel, kind, format, label }: Props) {
  const values = points.map((p) => p.value);
  const pad = (Math.max(...values, reference) - Math.min(...values, reference)) * 0.06 || 1;
  const min = Math.max(0, Math.floor(Math.min(...values, reference) - pad));
  const max = Math.ceil(Math.max(...values, reference) + pad);
  const x = (v: number) => ((v - min) / (max - min)) * 100;
  const outside = (v: number) => (kind === "maximum" ? v > reference : v < reference);

  return (
    <figure className="m-0">
      <div className="relative mx-2 h-16" role="img" aria-label={label}>
        <div className="absolute inset-x-0 top-8 h-px bg-paper-300" />
        {kind === "maximum" && (
          <div className="bg-over-soft absolute inset-y-2 rounded-sm" style={{ left: `${x(reference)}%`, right: 0 }} />
        )}
        {points.map((p, i) => (
          <span
            key={p.label}
            title={`${p.label}: ${format(p.value)}`}
            className={`absolute h-2.5 w-2.5 rounded-full opacity-80 ring-1 ring-white ${outside(p.value) ? "bg-alert-500" : "bg-brand-500"}`}
            style={{ left: `calc(${x(p.value)}% - 5px)`, top: 27 + (((i * 7) % 5) - 2) * 4 }}
          />
        ))}
        <div className="absolute inset-y-1 border-l-2 border-dashed border-ink-700" style={{ left: `${x(reference)}%` }} />
        <span className="absolute -top-0.5 text-xs font-semibold whitespace-nowrap text-ink-900" style={{ left: `calc(${x(reference)}% + 6px)` }}>
          {referenceLabel}
        </span>
      </div>
      <div className="mx-2 mt-0.5 flex justify-between text-xs text-ink-500 tabular-nums" aria-hidden>
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </figure>
  );
}
