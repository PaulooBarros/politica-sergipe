type Props = {
  ratio: number | null;
  label: string;
};

/** Share of the authorized budget that was paid. Values above 100% are clipped visually. */
export default function ProgressBar({ ratio, label }: Props) {
  if (ratio == null) return null;
  return (
    <div className="h-1.5 w-full rounded-full bg-brand-100" role="img" aria-label={label} title={label}>
      <div className="h-full rounded-full bg-brand-600" style={{ width: `${Math.min(100, ratio * 100)}%` }} />
    </div>
  );
}
