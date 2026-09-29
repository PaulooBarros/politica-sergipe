import type { ReactNode } from "react";
import { GLOSSARY, type GlossaryId } from "@/lib/glossary";

/**
 * Inline glossary term: dotted underline, definition on hover, focus or tap.
 * CSS only, so it works in server components and without JavaScript.
 */
export default function Term({ id, children }: { id: GlossaryId; children?: ReactNode }) {
  const entry = GLOSSARY[id];
  return (
    <span className="group/term relative inline">
      <span
        tabIndex={0}
        className="cursor-help underline decoration-brand-400 decoration-dotted decoration-2 underline-offset-4 outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-brand-300"
        aria-describedby={`term-${id}`}
      >
        {children ?? entry.term}
      </span>
      <span
        id={`term-${id}`}
        role="tooltip"
        className="invisible absolute bottom-full left-1/2 z-30 mb-2 w-72 -translate-x-1/2 rounded-md bg-ink-900 px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-white opacity-0 shadow-lg transition-opacity group-hover/term:visible group-hover/term:opacity-100 group-focus-within/term:visible group-focus-within/term:opacity-100"
      >
        <strong className="block text-brand-200">{entry.term}</strong>
        {entry.text}
      </span>
    </span>
  );
}
