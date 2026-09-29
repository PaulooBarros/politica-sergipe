type Props = {
  value: number;
  reference?: number | null;
  max: number;
  label: string;
};

/** Horizontal bar (rio) with an optional reference tick (caju), e.g. the state average. */
export default function ComparisonBar({ value, reference, max, label }: Props) {
  const pct = (v: number) => `${Math.min(100, (v / Math.max(max, 1)) * 100)}%`;
  return (
    <div className="relative h-3 min-w-24" role="img" aria-label={label} title={label}>
      <div className="absolute inset-y-0 left-0 rounded-r-sm bg-brand-500" style={{ width: pct(value) }} />
      {reference != null && (
        <div
          className="absolute -inset-y-1 w-[3px] rounded-full bg-alert-500 ring-2 ring-paper-50"
          style={{ left: `calc(${pct(reference)} - 1.5px)` }}
        />
      )}
    </div>
  );
}
