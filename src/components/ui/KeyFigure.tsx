import type { ReactNode } from "react";
import { formatDecimal } from "@/lib/format";
import NotDeclared from "./NotDeclared";

type Props = {
  label: ReactNode;
  /** null shows the "não declarado" pattern instead of a number. */
  value: string | null;
  /** What the number means, in plain words. */
  explanation?: ReactNode;
  /** Context line under the explanation, e.g. the difference from the median. */
  comparison?: ReactNode;
  source?: ReactNode;
  children?: ReactNode;
  testId?: string;
  /** "card" draws its own box; "plain" sits inside a chapter card. */
  frame?: "card" | "plain";
};

/** A headline number: label, value, what it means, how it compares, where it comes from. */
export default function KeyFigure({ label, value, explanation, comparison, source, children, testId, frame = "card" }: Props) {
  return (
    <article
      className={`flex flex-col gap-2 ${frame === "card" ? "card px-5 pt-5 pb-4" : "border-b border-paper-100 pt-5 pb-1 sm:pr-6"}`}
      data-testid={testId}
    >
      <h3 className="text-sm font-semibold text-ink-700">{label}</h3>
      {value == null ? (
        <NotDeclared size="lg" />
      ) : (
        <p className="font-serif text-[2.25rem] leading-[1.02] font-semibold tracking-[-0.015em] text-ink-900 tabular-nums lg:text-[2.75rem]">
          {value}
        </p>
      )}
      {explanation && <p className="text-[15px] leading-[22px] text-pretty text-ink-700">{explanation}</p>}
      {comparison && <p className="text-sm leading-5 font-semibold text-brand-700">{comparison}</p>}
      {children}
      {source && <p className="mt-auto border-t border-dashed border-paper-200 pt-2.5 text-xs leading-[17px] text-ink-500">{source}</p>}
    </article>
  );
}

/**
 * Neutral comparison with a reference ("↑ 18% acima da mediana do mesmo porte (R$ 4.889)").
 * Above or below is not good or bad, so it never uses the alert colour.
 */
export function compareWith(
  value: number | null | undefined,
  reference: number | null | undefined,
  label: string,
  format: (v: number) => string,
) {
  if (value == null || reference == null || reference === 0) return null;
  const r = value / reference;
  const pct = Math.round(Math.abs(r - 1) * 100);
  const ref = `${label} (${format(reference)})`;
  if (pct < 3) return `≈ Próximo da ${ref}`;
  if (r >= 2) return `↑ ${formatDecimal(r)} vezes a ${ref}`;
  return `${r > 1 ? "↑" : "↓"} ${pct}% ${r > 1 ? "acima" : "abaixo"} da ${ref}`;
}

export function KeyFigureRow({ children, columns = 4 }: { children: ReactNode; columns?: 3 | 4 }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${columns === 4 ? "xl:grid-cols-4" : "lg:grid-cols-3"}`}>{children}</div>
  );
}
