import type { ReactNode } from "react";

type Props = {
  id: string;
  /** Small label above the title, e.g. "1 · Resumo" or "Pontos de atenção · 2024". */
  eyebrow?: ReactNode;
  /** A sentence that states the conclusion, not just the topic. */
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  /** "panel" wraps the content in a white card; "plain" leaves it on the page background. */
  variant?: "panel" | "plain";
  /** "lede" renders the title as a regular-weight paragraph (the summary chapter). */
  titleStyle?: "headline" | "lede";
  /** Adds a "Voltar ao topo" link at the end (long report pages). */
  backToTop?: boolean;
};

export function SectionTitle({ id, children, as = "h2" }: { id?: string; children: ReactNode; as?: "h2" | "h3" }) {
  const Tag = as;
  return (
    <Tag
      id={id}
      className="font-serif text-2xl leading-[1.2] font-semibold tracking-[-0.01em] text-balance text-ink-900 sm:text-[1.75rem] lg:text-h2"
    >
      {children}
    </Tag>
  );
}

export default function Section({
  id,
  eyebrow,
  title,
  description,
  actions,
  children,
  variant = "panel",
  titleStyle = "headline",
  backToTop = false,
}: Props) {
  const titleId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={`flex scroll-mt-18 flex-col gap-6 ${variant === "panel" ? "card p-5 sm:p-8 lg:p-10" : ""}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="flex max-w-[50rem] flex-col gap-2">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {titleStyle === "lede" ? (
            <h2 id={titleId} className="font-serif text-[1.3rem] leading-[1.4] text-pretty text-ink-900 sm:text-2xl lg:text-[1.75rem]">
              {title}
            </h2>
          ) : (
            <SectionTitle id={titleId}>{title}</SectionTitle>
          )}
          {description && <div className="text-base leading-relaxed text-pretty text-ink-700">{description}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-end gap-2">{actions}</div>}
      </div>
      {children}
      {backToTop && (
        <a href="#topo" className="self-end text-sm text-brand-700 hover:underline">
          Voltar ao topo ↑
        </a>
      )}
    </section>
  );
}
