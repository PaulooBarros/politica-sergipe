"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  title: string;
  /** `badge` counts issues in the chapter (points of attention, legal rules not met). */
  items: { id: string; label: string; badge?: number }[];
};

/**
 * Sticky chapter bar for the report pages: numbered tabs that follow the
 * chapter being read and scroll sideways on phones.
 */
export default function SectionNav({ title, items }: Props) {
  const [active, setActive] = useState(items[0]?.id);
  const listRef = useRef<HTMLOListElement>(null);
  const ids = items.map((i) => i.id).join(",");

  useEffect(() => {
    const onScroll = () => {
      let current = ids.split(",")[0];
      for (const id of ids.split(",")) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 140) current = id;
      }
      setActive(current);
    };
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [ids]);

  // On phones the bar scrolls sideways; keep the current chapter in view.
  useEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>(`[data-chapter="${active}"]`);
    if (!list || !link || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: link.offsetLeft - list.clientWidth / 2 + link.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  return (
    <nav aria-label={title} className="sticky top-0 z-30 border-b border-paper-200 bg-white/95 backdrop-blur-md">
      <ol ref={listRef} className="page flex gap-1 overflow-x-auto [scrollbar-width:none]">
        {items.map((item, i) => {
          const current = item.id === active;
          return (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                data-chapter={item.id}
                aria-current={current ? "location" : undefined}
                className={`flex h-[52px] items-center gap-2 px-3 text-sm whitespace-nowrap transition-colors ${
                  current
                    ? "font-semibold text-brand-900 shadow-[inset_0_-3px_0_var(--color-brand-600)]"
                    : "font-medium text-ink-700 hover:text-brand-800"
                }`}
              >
                <span
                  className={`grid h-[22px] w-[22px] place-items-center rounded-full text-xs font-semibold tabular-nums ${
                    current ? "bg-brand-700 text-white" : "bg-brand-100 text-brand-700"
                  }`}
                  aria-hidden
                >
                  {i + 1}
                </span>
                {item.label}
                {item.badge ? (
                  <span className="rounded border border-alert-200 bg-alert-50 px-1.5 text-xs font-semibold text-alert-800">
                    <span aria-hidden className="text-[10px] text-alert-500">▲</span> {item.badge}
                    <span className="sr-only"> {item.badge === 1 ? "item" : "itens"} de atenção</span>
                  </span>
                ) : null}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
