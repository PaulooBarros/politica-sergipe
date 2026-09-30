import type { ReactNode } from "react";

export type BarRow = {
  key: string;
  label: ReactNode;
  /** Short description under the label. */
  note?: ReactNode;
  value: number;
  valueText: ReactNode;
  /** "alert" is reserved for risky revenue (royalties, loans). */
  tone?: "brand" | "strong" | "alert";
  dim?: boolean;
};

const TONE = { brand: "bg-brand-500", strong: "bg-brand-800", alert: "bg-alert-500" };

/** Horizontal bars with the value written next to each one (never colour alone). */
export default function BarList({ rows, labelWidth = "12rem" }: { rows: BarRow[]; labelWidth?: string }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="flex flex-col gap-3.5">
      {rows.map((r) => (
        <li
          key={r.key}
          className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 transition-opacity sm:grid-cols-[var(--label)_minmax(0,1fr)_auto] ${r.dim ? "opacity-40" : ""}`}
          style={{ ["--label" as string]: labelWidth }}
        >
          <div className="min-w-0 text-[15px] text-ink-900">
            {r.label}
            {r.note && <p className="text-xs leading-snug text-ink-500">{r.note}</p>}
          </div>
          <div className="col-span-2 h-3 rounded-[2px] bg-paper-100 sm:order-none sm:col-span-1 max-sm:order-last" aria-hidden>
            <div className={`h-full rounded-[2px] ${TONE[r.tone ?? "brand"]}`} style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          <div className="text-right text-[15px] whitespace-nowrap tabular-nums">{r.valueText}</div>
        </li>
      ))}
    </ul>
  );
}
