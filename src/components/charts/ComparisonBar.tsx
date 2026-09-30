type Props = {
  value: number;
  reference?: number | null;
  max: number;
  label: string;
};

/** Horizontal bar (brand) with an optional reference tick (dark), e.g. the state median. */
export default function ComparisonBar({ value, reference, max, label }: Props) {
  const pct = (v: number) => `${Math.min(100, (v / Math.max(max, 1)) * 100)}%`;
  return (
    <div className="relative h-2.5 min-w-24 rounded-[2px] bg-paper-100" role="img" aria-label={label} title={label}>
      <div className="absolute inset-y-0 left-0 rounded-[2px] bg-brand-500" style={{ width: pct(value) }} />
      {reference != null && (
        <div className="absolute -inset-y-1 w-0.5 bg-ink-900 ring-2 ring-white" style={{ left: `calc(${pct(reference)} - 1px)` }} />
      )}
    </div>
  );
}
