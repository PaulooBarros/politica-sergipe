import { formatBRLShort, formatPercent } from "@/lib/format";
import type { EntityYear } from "../data";
import type { AreaRow } from "../metrics";
import { ratio } from "../metrics";

type Props = {
  name: string;
  year: number;
  entity: EntityYear | null;
  areas: AreaRow[];
  insightCount: number;
};

/** The lead paragraph: the year in three plain sentences. */
export default function BudgetSummary({ name, year, entity, areas, insightCount }: Props) {
  if (!entity || entity.paid == null) {
    return (
      <p className="max-w-3xl text-xl leading-relaxed text-ink-900" data-testid="summary">
        {name} não declarou ao Tesouro Nacional os gastos de {year}.
      </p>
    );
  }

  const execution = ratio(entity.paid, entity.authorized);
  const top = areas.filter((a) => a.share != null).slice(0, 3);
  const topShare = top.reduce((acc, a) => acc + (a.share ?? 0), 0);
  const revenue = entity.revenue?.total ?? null;

  return (
    <div className="max-w-3xl space-y-2 text-lg leading-relaxed text-ink-900" data-testid="summary">
      <p>
        Em {year}, {name} arrecadou <strong>{formatBRLShort(revenue)}</strong> e pagou{" "}
        <strong>{formatBRLShort(entity.paid)}</strong>
        {execution != null && <>, {formatPercent(execution)} do orçamento autorizado</>}.
      </p>
      {top.length > 0 && (
        <p>
          O dinheiro foi principalmente para{" "}
          {top.map((a, i) => (
            <span key={a.code}>
              {i > 0 && (i === top.length - 1 ? " e " : ", ")}
              <strong>{a.name}</strong> ({formatPercent(a.share)})
            </span>
          ))}
          , que somaram {formatPercent(topShare)} do gasto.
        </p>
      )}
      <p>
        {insightCount === 0 ? (
          "Os números deste ano não acionaram nenhum dos pontos de atenção do portal."
        ) : (
          <>
            Os dados acionam{" "}
            <a href="#atencao" className="font-semibold text-alert-700 underline decoration-alert-300 underline-offset-4">
              {insightCount} {insightCount === 1 ? "ponto de atenção" : "pontos de atenção"}
            </a>
            , detalhados abaixo.
          </>
        )}
      </p>
    </div>
  );
}
