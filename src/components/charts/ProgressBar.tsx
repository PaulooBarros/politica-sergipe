type Props = {
  ratio: number | null;
  label: string;
};

/** Share of the authorized budget that was paid. Values above 100% are clipped visually. */
export default function ProgressBar({ ratio, label }: Props) {
  if (ratio == null) return null;
  return (
    <div className="h-2 w-full rounded-[2px] bg-paper-200" role="img" aria-label={label} title={label}>
      <div className="h-full rounded-[2px] bg-brand-500" style={{ width: `${Math.min(100, ratio * 100)}%` }} />
    </div>
  );
}
