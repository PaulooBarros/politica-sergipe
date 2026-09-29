import Link from "next/link";
import { RULES, type StateHighlight } from "../rules";

type Props = {
  highlights: StateHighlight[];
  year: number;
};

/** Overview grid: for each rule, how many municipalities and the most unusual cases. */
export default function StateHighlights({ highlights, year }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="state-highlights">
      {highlights.map((h) => (
        <article key={h.rule} className="flex flex-col rounded-lg border border-paper-200 bg-paper-100/50 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[15px] font-semibold leading-snug text-ink-900">{RULES[h.rule].label}</h3>
            <span className="shrink-0 rounded-full bg-alert-100 px-2 py-0.5 text-xs font-bold text-alert-700">
              {h.total} {h.total === 1 ? "município" : "municípios"}
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-500">Critério: {RULES[h.rule].threshold}</p>
          <ul className="mt-3 divide-y divide-paper-200">
            {h.items.map((i) => (
              <li key={i.entityCode} className="py-2.5">
                <Link href={`/municipios/${i.slug}?ano=${year}#atencao`} className="text-sm font-semibold text-brand-700 hover:underline">
                  {i.name} →
                </Link>
                <p className="mt-0.5 text-sm leading-snug text-ink-700">{i.fact}</p>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
