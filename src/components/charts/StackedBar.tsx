type Props = {
  parts: { label: string; units: number; color: string; dark: boolean }[];
  label: string;
};

/** A 100-unit bar split in segments, each labelled with its value when there is room. */
export default function StackedBar({ parts, label }: Props) {
  return (
    <div role="img" aria-label={label} className="flex h-10 gap-0.5 overflow-hidden rounded">
      {parts
        .filter((p) => p.units > 0)
        .map((p) => (
          <span
            key={p.label}
            title={`${p.label}: R$ ${p.units}`}
            className={`flex min-w-0 items-center overflow-hidden pl-2 text-[13px] font-semibold whitespace-nowrap tabular-nums ${p.color} ${
              p.dark ? "text-white" : "text-ink-900"
            }`}
            style={{ flex: `${p.units} 0 0` }}
          >
            {p.units >= 6 ? `R$ ${p.units}` : ""}
          </span>
        ))}
    </div>
  );
}
