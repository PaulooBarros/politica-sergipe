import type { ReactNode } from "react";

type Props = {
  id: string;
  /** Chapter number shown next to the title, e.g. "02". */
  number?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  /** "panel" wraps the content in a white card; "plain" leaves it on the page background. */
  variant?: "panel" | "plain";
};

export default function Section({ id, number, title, description, actions, children, variant = "panel" }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mt-6 scroll-mt-6">
      <div
        className={
          variant === "panel" ? "rounded-lg border border-paper-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-7" : ""
        }
      >
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h2 id={`${id}-title`} className="flex items-center gap-3 text-xl font-semibold tracking-tight text-ink-900">
              {number && (
                <span className="grid h-7 min-w-7 place-items-center rounded-md bg-brand-100 px-1.5 text-xs font-bold text-brand-700">
                  {number}
                </span>
              )}
              {title}
            </h2>
            {description && <div className="mt-2 text-[15px] leading-relaxed text-ink-700">{description}</div>}
          </div>
          {actions}
        </div>
        {children}
      </div>
    </section>
  );
}
