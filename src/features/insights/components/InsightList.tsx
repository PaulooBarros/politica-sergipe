import Link from "next/link";
import type { Insight } from "../rules";

export function InsightDisclaimer() {
  return (
    <p className="max-w-3xl text-sm leading-relaxed text-ink-500">
      Pontos de atenção <strong className="text-ink-700">não são acusações</strong>. São padrões fora do comum nos dados
      oficiais, calculados com os mesmos critérios para todos. Cada um traz explicações possíveis e onde conferir.{" "}
      <Link href="/sobre#criterios" className="text-brand-700 underline underline-offset-2">
        Ver critérios
      </Link>
      .
    </p>
  );
}

export default function InsightList({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return (
      <div className="rounded-md border border-paper-200 bg-paper-100 px-4 py-3 text-ink-700" data-testid="insights">
        Nenhum ponto de atenção neste ano. Os números ficaram dentro dos padrões observados nos demais municípios.
      </div>
    );
  }

  return (
    <ol className="space-y-4" data-testid="insights">
      {insights.map((i, idx) => (
        <li key={`${i.rule}-${idx}`}>
          <article className="rounded-md border border-alert-200 bg-alert-50/60">
            <div className="flex gap-3 p-4">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-alert-500 text-xs text-white" aria-hidden>
                ▲
              </span>
              <div>
                <h3 className="font-semibold text-ink-900">{i.title}</h3>
                <p className="mt-1 leading-relaxed text-ink-900">{i.fact}</p>
                <p className="mt-2 text-sm text-ink-700">
                  <span className="font-semibold">Por que importa: </span>
                  {i.why}
                </p>
              </div>
            </div>
            <details className="group border-t border-alert-200">
              <summary className="cursor-pointer list-none px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-alert-100/50">
                <span className="group-open:hidden">+ Explicações possíveis e onde conferir</span>
                <span className="hidden group-open:inline">− Ocultar detalhes</span>
              </summary>
              <div className="grid gap-6 px-4 pb-4 text-sm text-ink-700 sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-ink-900">Explicações possíveis</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {i.explanations.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-ink-900">Onde conferir</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {i.check.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          </article>
        </li>
      ))}
    </ol>
  );
}
