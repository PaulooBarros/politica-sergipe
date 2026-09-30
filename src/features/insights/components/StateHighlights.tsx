import Link from "next/link";
import { RULES, type StateHighlight } from "../rules";

type Props = {
  highlights: StateHighlight[];
  year: number;
  /** Municipalities that did not declare their spending this year. */
  missing: { name: string; slug: string }[];
};

/** Overview grid: for each rule, how many municipalities and the most unusual cases. */
export default function StateHighlights({ highlights, year, missing }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="state-highlights">
      {highlights.map((h) => (
        <article key={h.rule} className="card flex flex-col gap-2.5 border-t-[3px] border-t-alert-500 p-5">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-alert-700">
            <span aria-hidden className="text-[11px] text-alert-500">
              ▲
            </span>
            Ponto de atenção
          </p>
          <h3 className="text-lg leading-6 font-semibold text-ink-900">{RULES[h.rule].label}</h3>
          <p className="flex items-baseline gap-2">
            <span className="font-serif text-[2.5rem] leading-none font-semibold text-ink-900 tabular-nums">{h.total}</span>
            <span className="text-[15px] text-ink-700">{h.total === 1 ? "município" : "municípios"}</span>
          </p>
          <p className="text-sm leading-[21px] text-ink-500">
            <strong className="font-semibold text-ink-700">Critério:</strong> {RULES[h.rule].threshold}.
          </p>
          <ul className="flex flex-col divide-y divide-paper-200 border-y border-paper-200">
            {h.items.map((i) => (
              <li key={i.entityCode} className="py-2">
                <Link href={`/municipios/${i.slug}?ano=${year}#atencao`} className="text-sm font-semibold text-brand-700 hover:underline">
                  {i.name}
                </Link>
                <p className="line-clamp-2 text-[13px] leading-snug text-ink-700">{i.fact}</p>
              </li>
            ))}
          </ul>
          {h.total > h.items.length && (
            <p className="text-[13px] text-ink-500">
              e mais {h.total - h.items.length} {h.total - h.items.length === 1 ? "município" : "municípios"}
            </p>
          )}
          <Link href={`/municipios?ano=${year}&atencao=sim&ordem=atencao`} className="mt-auto inline-flex min-h-8 items-center pt-1 text-[15px] font-semibold text-brand-700 hover:underline">
            Ver a lista →
          </Link>
        </article>
      ))}
      {missing.length > 0 && (
        <article className="card flex flex-col gap-2.5 border-t-[3px] border-t-paper-400 p-5">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-500">
            <span className="bg-nd inline-block h-3 w-4 rounded-[2px]" aria-hidden />
            Dado ausente
          </p>
          <h3 className="text-lg leading-6 font-semibold text-ink-900">Não enviaram o gasto do ano ao Tesouro</h3>
          <p className="flex items-baseline gap-2">
            <span className="font-serif text-[2.5rem] leading-none font-semibold text-ink-900 tabular-nums">{missing.length}</span>
            <span className="text-[15px] text-ink-700">{missing.length === 1 ? "município" : "municípios"}</span>
          </p>
          <p className="text-sm leading-[21px] text-ink-500">
            <strong className="font-semibold text-ink-700">Critério:</strong> sem Declaração de Contas Anuais (DCA) de {year} no
            SICONFI na data da consulta. Aparecem como &ldquo;não declarado&rdquo;, nunca como zero.
          </p>
          <p className="text-sm leading-[21px] text-ink-700">
            {missing.slice(0, 6).map((m, idx) => (
              <span key={m.slug}>
                {idx > 0 && ", "}
                <Link href={`/municipios/${m.slug}?ano=${year}`} className="link">
                  {m.name}
                </Link>
              </span>
            ))}
            {missing.length > 6 ? ` e mais ${missing.length - 6}` : ""}.
          </p>
        </article>
      )}
    </div>
  );
}
