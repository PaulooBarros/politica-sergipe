import Link from "next/link";
import CopyButton from "@/components/ui/CopyButton";
import type { Insight } from "../rules";

export function InsightDisclaimer() {
  return (
    <p className="max-w-3xl text-sm leading-relaxed text-ink-500">
      Pontos de atenção <strong className="text-ink-700">não são acusações</strong>. São padrões fora do comum nos dados
      oficiais, calculados com os mesmos critérios para todos. Cada um traz explicações possíveis, onde conferir e uma
      pergunta pronta para enviar a quem decide.{" "}
      <Link href="/sobre#criterios" className="text-brand-700 underline underline-offset-2">
        Ver critérios
      </Link>
      .
    </p>
  );
}

type Props = {
  insights: Insight[];
  /** Municipality slug or "estado", used to prefill the information request model. */
  entitySlug: string;
};

export default function InsightList({ insights, entitySlug }: Props) {
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
              <div className="min-w-0">
                <h3 className="font-semibold text-ink-900">{i.title}</h3>
                <p className="mt-1 leading-relaxed text-ink-900">{i.fact}</p>
                <p className="mt-2 text-sm text-ink-700">
                  <span className="font-semibold">Por que importa: </span>
                  {i.why}
                </p>
                <div className="mt-3 rounded-md border border-paper-200 bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Pergunte a quem decide</p>
                  <p className="mt-1 text-sm italic text-ink-900">&ldquo;{i.question}&rdquo;</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <CopyButton text={i.question} label="Copiar pergunta" />
                    <Link
                      href={`/participe?municipio=${entitySlug}&pergunta=${encodeURIComponent(i.question)}#pedido`}
                      className="rounded-md border border-paper-300 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-brand-400 hover:text-brand-800"
                    >
                      Montar pedido de informação (LAI)
                    </Link>
                  </div>
                </div>
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
