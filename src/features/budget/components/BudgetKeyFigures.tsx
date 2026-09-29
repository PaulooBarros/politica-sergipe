import KeyFigure, { KeyFigureRow } from "@/components/ui/KeyFigure";
import Term from "@/components/ui/Term";
import { formatBRL, formatBRLShort, formatPercent } from "@/lib/format";
import { type Comparison, type Figures, ratio } from "../metrics";

type Props = {
  figures: Figures;
  year: number;
  comparisons?: Comparison[];
};

/** The four headline numbers: planned, paid, execution and per capita. */
export default function BudgetKeyFigures({ figures, year, comparisons = [] }: Props) {
  const execution = ratio(figures.paid, figures.authorized);
  const perCapita = ratio(figures.paid, figures.population);

  return (
    <KeyFigureRow>
      <KeyFigure
        testId="stat-planned"
        label={<Term id="orcamento-previsto">Orçamento previsto</Term>}
        value={formatBRLShort(figures.planned)}
        tone={figures.planned == null ? "muted" : "default"}
        explanation={
          figures.planned == null
            ? `O orçamento de ${year} não foi declarado ao Tesouro Nacional.`
            : `Aprovado na lei do orçamento de ${year}. Ajustado durante o ano para ${formatBRLShort(figures.authorized)}.`
        }
      />
      <KeyFigure
        testId="stat-paid"
        label={<Term id="pagamento">Gasto real (pago)</Term>}
        value={formatBRLShort(figures.paid)}
        tone={figures.paid == null ? "muted" : "default"}
        explanation="O que efetivamente saiu do caixa para pagar despesas do ano."
      />
      <KeyFigure
        testId="stat-execution"
        label={<Term id="execucao">Orçamento executado</Term>}
        value={formatPercent(execution)}
        explanation={
          execution == null
            ? "Não é possível calcular sem orçamento e gasto declarados."
            : `De cada R$ 100 autorizados, R$ ${Math.round(execution * 100)} foram pagos.`
        }
      />
      <KeyFigure
        testId="stat-per-capita"
        label="Gasto por habitante"
        value={formatBRL(perCapita)}
        explanation={`Gasto real dividido pela população de ${year}.`}
      >
        {comparisons.length > 0 && (
          <dl className="space-y-1">
            {comparisons.map((c) => (
              <div key={c.label} className="flex justify-between gap-3">
                <dt className="text-ink-500">{c.label}</dt>
                <dd className="whitespace-nowrap font-medium tabular-nums text-ink-900">{formatBRL(c.value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </KeyFigure>
    </KeyFigureRow>
  );
}
