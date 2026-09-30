import Link from "next/link";
import CopyButton from "@/components/ui/CopyButton";
import { type Insight, RULES } from "../rules";

export function InsightDisclaimer() {
  return (
    <p className="max-w-[46rem] text-base leading-relaxed text-ink-700">
      São sinais automáticos, com critério público e igual para todos. <strong className="font-semibold text-ink-900">Não indicam irregularidade</strong>:
      mostram onde vale olhar mais de perto, com explicações legítimas possíveis e onde conferir.{" "}
      <Link href="/sobre#criterios" className="link">
        Ver os critérios
      </Link>
      .
    </p>
  );
}

export function insightsHeadline(count: number, year: number) {
  if (count === 0) return `Nenhum ponto de atenção em ${year}`;
  if (count === 1) return `Um ponto merece acompanhamento em ${year}`;
  return `${count} pontos merecem acompanhamento em ${year}`;
}

type Props = {
  insights: Insight[];
  /** Municipality slug or "estado", used to prefill the information request model. */
  entitySlug: string;
};

function Label({ children }: { children: string }) {
  return <h4 className="text-xs font-semibold tracking-[0.08em] text-ink-500 uppercase">{children}</h4>;
}

export default function InsightList({ insights, entitySlug }: Props) {
  if (insights.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-paper-300 px-5 py-4 text-[15px] text-ink-700" data-testid="insights">
        Os números deste ano não acionaram nenhum dos critérios do portal.{" "}
        <Link href="/sobre#criterios" className="link">
          Ver os critérios
        </Link>
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-5" data-testid="insights">
      {insights.map((i, idx) => (
        <li key={`${i.rule}-${idx}`}>
          <article className="overflow-hidden rounded-lg border border-alert-200">
            <div className="flex items-center gap-2.5 border-b border-alert-200 bg-alert-50 px-5 py-2.5 text-[13px] font-semibold text-alert-800">
              <span aria-hidden className="text-xs text-alert-500">
                ▲
              </span>
              Ponto de atenção
            </div>
            <div className="grid gap-x-10 gap-y-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <div className="flex flex-col gap-2">
                <h3 className="text-[19px] leading-[26px] font-semibold text-ink-900">{i.title}</h3>
                <p className="text-body text-pretty text-ink-900">{i.fact}</p>
                <p className="text-[15px] leading-relaxed text-ink-700">
                  <span className="font-semibold text-ink-900">Por que importa: </span>
                  {i.why}
                </p>
              </div>
              <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label>Critério</Label>
                  <p className="text-[15px] leading-[23px] text-ink-700">{RULES[i.rule].threshold}. Vale igual para todos os municípios.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Possíveis explicações</Label>
                  <ul className="list-disc space-y-1 pl-[18px] text-[15px] leading-[23px] text-ink-700">
                    {i.explanations.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Onde conferir</Label>
                  <ul className="list-disc space-y-1 pl-[18px] text-[15px] leading-[23px] text-ink-700">
                    {i.check.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-paper-200 bg-paper-100 px-5 py-4">
              <div>
                <p className="eyebrow">Pergunte a quem decide</p>
                <p className="mt-1.5 font-serif text-[17px] leading-[26px] text-ink-900">&ldquo;{i.question}&rdquo;</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyButton text={i.question} label="Copiar pergunta" />
                <Link
                  href={`/participe?municipio=${entitySlug}&pergunta=${encodeURIComponent(i.question)}#pedido`}
                  className="btn btn-secondary"
                >
                  Montar pedido de informação (LAI)
                </Link>
              </div>
            </div>
          </article>
        </li>
      ))}
    </ol>
  );
}
