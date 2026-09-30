import Link from "next/link";
import type { ReactNode } from "react";

type Crumb = { label: string; href?: string };

type Props = {
  breadcrumb?: Crumb[];
  eyebrow?: ReactNode;
  title: string;
  description?: ReactNode;
  /** Small facts shown as chips under the title (territory, size, population). */
  meta?: ReactNode[];
  /** Controls on the right (year selector, compare button). */
  aside?: ReactNode;
  /** Extra content under the title, e.g. the pickers of the compare page. */
  children?: ReactNode;
};

/** White band under the site header: breadcrumb, title and page controls. */
export default function PageHeader({ breadcrumb, eyebrow, title, description, meta, aside, children }: Props) {
  return (
    <header className="border-b border-paper-200 bg-white">
      <div className="page flex flex-col gap-3.5 pt-5 pb-7">
        {breadcrumb && (
          <nav aria-label="Você está em" className="flex flex-wrap items-center gap-1.5 text-sm text-ink-500">
            {breadcrumb.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden>›</span>}
                {c.href ? (
                  <Link href={c.href} className="text-brand-700 hover:underline">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-ink-700">
                    {c.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div className="flex min-w-0 flex-[1_1_30rem] flex-col gap-2.5">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 className="font-serif text-[2.125rem] leading-[1.05] font-semibold tracking-[-0.02em] text-balance text-ink-900 sm:text-[2.75rem] lg:text-[3.5rem]">
              {title}
            </h1>
            {description && <div className="max-w-[42rem] text-body text-pretty text-ink-700">{description}</div>}
            {meta && meta.length > 0 && (
              <ul className="mt-1 flex flex-wrap gap-2">
                {meta.map((item, i) => (
                  <li key={i} className="rounded-full border border-paper-300 bg-white px-2.5 py-1 text-sm text-ink-700">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {aside && <div className="flex flex-wrap items-end gap-2">{aside}</div>}
        </div>
        {children}
      </div>
    </header>
  );
}
