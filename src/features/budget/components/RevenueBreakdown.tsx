import KeyFigure, { KeyFigureRow } from "@/components/ui/KeyFigure";
import { formatBRL, formatBRLShort, formatPercent } from "@/lib/format";
import { type EntityYear, REVENUE_SOURCES, type RevenueSource } from "../data";
import { ratio } from "../metrics";

type Props = {
  entity: EntityYear | null;
  isState?: boolean;
  /** Median revenue per inhabitant of comparable municipalities, for context. */
  peerMedianPerCapita?: number | null;
  peerLabel?: string;
};

export default function RevenueBreakdown({ entity, isState = false, peerMedianPerCapita, peerLabel }: Props) {
  const revenue = entity?.revenue;
  if (!entity || !revenue) {
    return <p className="text-ink-700">A receita deste ano não foi declarada ao Tesouro Nacional.</p>;
  }

  const perCapita = ratio(revenue.total, entity.population);
  const balance = entity.paid == null ? null : revenue.total - entity.paid;
  const sources = (Object.keys(REVENUE_SOURCES) as RevenueSource[])
    .map((key) => ({ key, value: revenue.sources[key] ?? 0, ...REVENUE_SOURCES[key] }))
    .filter((s) => s.value > 0)
    .sort((a, b) => (a.key === "other" ? 1 : b.key === "other" ? -1 : b.value - a.value));
  const max = Math.max(...sources.map((s) => s.value), 1);

  return (
    <>
      <KeyFigureRow>
        <KeyFigure testId="revenue-total" label="Receita do ano" value={formatBRLShort(revenue.total)} explanation="Tudo o que entrou no caixa, já descontada a parte que vai para o Fundeb." />
        <KeyFigure
          label="Receita por habitante"
          value={formatBRL(perCapita)}
          explanation={
            peerMedianPerCapita != null && perCapita != null
              ? `${(perCapita / peerMedianPerCapita).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} vezes a mediana ${peerLabel} (${formatBRL(peerMedianPerCapita)}).`
              : undefined
          }
        />
        <KeyFigure label="Gasto pago" value={formatBRLShort(entity.paid)} explanation="Para comparar com o que entrou." />
        <KeyFigure
          label={balance == null || balance >= 0 ? "Sobrou no ano" : "Faltou no ano"}
          value={formatBRLShort(balance == null ? null : Math.abs(balance))}
          explanation={
            balance == null
              ? undefined
              : balance >= 0
                ? "Receita menos gasto pago. Parte costuma pagar despesas do ano deixadas para o ano seguinte."
                : "O gasto pago superou a receita: foi coberto com dinheiro de anos anteriores."
          }
        />
      </KeyFigureRow>

      <h3 className="mt-10 text-xl font-semibold text-ink-900">De onde veio cada real</h3>
      <ul className="mt-4 space-y-4" data-testid="revenue-sources">
        {sources.map((s) => (
          <li key={s.key} className="grid gap-x-6 gap-y-1 sm:grid-cols-[minmax(0,16rem)_1fr_auto] sm:items-center">
            <div>
              <p className="font-medium text-ink-900">{isState && s.stateLabel ? s.stateLabel : s.label}</p>
              <p className="text-xs leading-snug text-ink-500">{s.description}</p>
            </div>
            <div className="h-3 rounded-sm bg-paper-200" aria-hidden>
              <div
                className={`h-full rounded-sm ${s.key === "royalties" || s.key === "loans" ? "bg-alert-500" : "bg-brand-500"}`}
                style={{ width: `${(s.value / max) * 100}%` }}
              />
            </div>
            <p className="text-right tabular-nums sm:w-44">
              <span className="font-semibold text-ink-900">{formatBRLShort(s.value)}</span>{" "}
              <span className="text-ink-500">· {formatPercent(ratio(s.value, revenue.total))}</span>
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-ink-500">
        Em âmbar, receitas que merecem acompanhamento: royalties variam com a produção e o preço do petróleo;
        empréstimos são pagos pelas gestões seguintes.
      </p>
    </>
  );
}
