type Props = {
  value: number;
  threshold: number;
  /** "minimum": must reach the threshold; "maximum": must stay below it. */
  kind: "minimum" | "maximum";
  /** Right end of the scale. */
  max: number;
  label: string;
};

/**
 * Bar up to a legal threshold (dashed line). Excess over a maximum is hatched
 * in amber; a shortfall under a minimum is hatched in light amber.
 */
export default function ThresholdBar({ value, threshold, kind, max, label }: Props) {
  const x = (v: number) => Math.max(0, Math.min(100, (v / max) * 100));
  const over = kind === "maximum" && value > threshold;
  const short = kind === "minimum" && value < threshold;
  const refLabel = `${kind === "minimum" ? "mínimo" : "limite"} ${threshold.toLocaleString("pt-BR")}%`;

  return (
    <div>
      <div className="relative h-3.5 rounded-[3px] bg-paper-100 shadow-[inset_0_0_0_1px_var(--color-paper-200)]" role="img" aria-label={label}>
        <span className="absolute inset-y-0 left-0 rounded-l-[3px] bg-brand-500" style={{ width: `${x(over ? threshold : value)}%` }} />
        {over && <span className="bg-over absolute inset-y-0" style={{ left: `${x(threshold)}%`, width: `${x(value) - x(threshold)}%` }} />}
        {short && (
          <span className="bg-over-soft absolute inset-y-0 shadow-[inset_0_0_0_1px_var(--color-alert-200)]" style={{ left: `${x(value)}%`, width: `${x(threshold) - x(value)}%` }} />
        )}
        <span className="absolute -inset-y-[5px] border-l-2 border-dashed border-ink-900" style={{ left: `${x(threshold)}%` }} aria-hidden />
      </div>
      <div className="relative mt-1.5 h-4 text-xs font-semibold text-ink-700 tabular-nums" aria-hidden>
        <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${Math.min(92, Math.max(8, x(threshold)))}%` }}>
          {refLabel}
        </span>
      </div>
    </div>
  );
}
