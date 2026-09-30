/** Fill for each category, darkest first; the last category ("outras") is always grey. */
export const WAFFLE_COLORS = ["bg-brand-800", "bg-brand-600", "bg-brand-400", "bg-brand-300"];
export const WAFFLE_OTHER = "bg-paper-200";

type Props = {
  /** Whole units adding up to 100, in display order. */
  parts: { label: string; units: number; color: string }[];
  /** Index of the category to emphasise; the others turn grey. */
  highlight?: number | null;
  label: string;
};

/** 10 × 10 grid: one square per real of every R$ 100 spent. */
export default function Waffle({ parts, highlight = null, label }: Props) {
  const cells = parts.flatMap((p, i) => Array.from({ length: p.units }, () => i)).slice(0, 100);
  return (
    <div role="img" aria-label={label} className="grid max-w-[340px] grid-cols-10 gap-[3px]">
      {cells.map((part, i) => (
        <span
          key={i}
          className={`aspect-square rounded-[2px] ${
            highlight == null ? parts[part].color : part === highlight ? "bg-brand-800" : WAFFLE_OTHER
          }`}
        />
      ))}
    </div>
  );
}
