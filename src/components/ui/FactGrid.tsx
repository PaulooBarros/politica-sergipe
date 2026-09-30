import type { ReactNode } from "react";
import NotDeclared from "./NotDeclared";

export type Fact = { label: ReactNode; value: string | null; note?: ReactNode };

/** Compact row of secondary numbers (smaller than KeyFigure), separated by thin rules. */
export default function FactGrid({ facts, columns = 4 }: { facts: Fact[]; columns?: 2 | 3 | 4 }) {
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[columns];
  return (
    <dl className={`grid gap-px overflow-hidden rounded-lg border border-paper-200 bg-paper-200 ${cols}`}>
      {facts.map((f, i) => (
        <div key={i} className="flex flex-col gap-1 bg-white p-4">
          <dt className="text-[13px] font-semibold text-ink-700">{f.label}</dt>
          <dd className="font-serif text-[1.625rem] leading-tight font-semibold text-ink-900 tabular-nums">
            {f.value == null ? <NotDeclared /> : f.value}
          </dd>
          {f.note && <dd className="text-[13px] leading-snug text-ink-500">{f.note}</dd>}
        </div>
      ))}
    </dl>
  );
}
