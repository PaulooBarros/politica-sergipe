import type { ReactNode } from "react";
import { GLOSSARY, type GlossaryId } from "@/lib/glossary";

/**
 * Inline glossary term: dotted underline, definition on hover, focus or tap.
 * CSS only, so it works in server components and without JavaScript.
 * Never place it inside a link: the tooltip has its own link to the glossary.
 */
export default function Term({ id, children }: { id: GlossaryId; children?: ReactNode }) {
  const entry = GLOSSARY[id];
  return (
    <span className="group/term relative inline">
      <span
        tabIndex={0}
        className="cursor-help border-b-2 border-dotted border-brand-400 text-inherit outline-none focus-visible:rounded-sm focus-visible:outline-3 focus-visible:outline-brand-300"
        aria-describedby={`term-${id}`}
      >
        {children ?? entry.term}
      </span>
      {/* Bottom padding keeps the hover area continuous between the term and the tooltip. */}
      <span className="invisible absolute bottom-full left-0 z-40 block w-[min(19rem,80vw)] pb-2.5 opacity-0 transition-opacity group-focus-within/term:visible group-focus-within/term:opacity-100 group-hover/term:visible group-hover/term:opacity-100">
        <span
          id={`term-${id}`}
          role="tooltip"
          className="relative block rounded-md bg-ink-900 px-3.5 py-3 text-left text-sm leading-5 font-normal tracking-normal text-white normal-case shadow-pop"
        >
          <strong className="mb-1 block font-semibold">{entry.term}</strong>
          {entry.text}{" "}
          <a href={`/sobre#glossario-${id}`} className="text-brand-200 underline underline-offset-2 hover:text-white">
            Ver no glossário
          </a>
          <span className="absolute -bottom-1.5 left-6 h-3 w-3 rotate-45 bg-ink-900" aria-hidden />
        </span>
      </span>
    </span>
  );
}
