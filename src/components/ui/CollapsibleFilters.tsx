"use client";

import { type ReactNode, useState } from "react";

/** Filters always visible on larger screens; behind a "Filtros (n)" button on phones. */
export default function CollapsibleFilters({ children, activeCount }: { children: ReactNode; activeCount: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="filtros"
        className="flex h-12 items-center justify-between rounded-md border border-paper-400 bg-white px-4 text-base font-semibold text-ink-900 md:hidden"
      >
        <span>Filtros{activeCount ? ` (${activeCount})` : ""}</span>
        <span aria-hidden>{open ? "▴" : "▾"}</span>
      </button>
      <div id="filtros" className={open ? "block" : "hidden md:block"}>
        {children}
      </div>
    </div>
  );
}
