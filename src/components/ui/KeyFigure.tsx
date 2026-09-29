import type { ReactNode } from "react";

type Props = {
  label: string;
  value: string;
  explanation?: ReactNode;
  children?: ReactNode;
  testId?: string;
  tone?: "default" | "muted";
};

/** A headline number with a plain-language line explaining it. */
export default function KeyFigure({ label, value, explanation, children, testId, tone = "default" }: Props) {
  return (
    <div className="flex flex-col rounded-lg border border-paper-200 bg-white p-5" data-testid={testId}>
      <p className="text-sm font-medium text-ink-500">{label}</p>
      <p
        className={`mt-1 text-[1.75rem] font-bold leading-tight tabular-nums tracking-tight ${
          tone === "muted" ? "text-ink-500" : "text-ink-900"
        }`}
      >
        {value}
      </p>
      {explanation && <p className="mt-2 text-sm leading-snug text-ink-700">{explanation}</p>}
      {children && <div className="mt-3 border-t border-paper-200 pt-3 text-sm">{children}</div>}
    </div>
  );
}

export function KeyFigureRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}
