import KeyFigure, { compareWith } from "@/components/ui/KeyFigure";
import Term from "@/components/ui/Term";
import { formatBRL, formatBRLShort, formatInteger, formatPercent } from "@/lib/format";
import { type Figures, ratio } from "../metrics";

type Props = {
  figures: Figures;
  year: number;
  /** "Câmara" or "Assembleia Legislativa", who approves the budget law. */
  legislature: string;
  /** Per-capita median of same-size municipalities (omitted for the state). */
  sizeMedianPerCapita?: number | null;
};

/** The three headline numbers of an x-ray: planned, paid and per inhabitant. */
export default function BudgetKeyFigures({ figures, year, legislature, sizeMedianPerCapita }: Props) {
  const execution = ratio(figures.paid, figures.authorized);
  const perCapita = ratio(figures.paid, figures.population);

  return (
    <div className="grid border-t border-paper-200 sm:grid-cols-2 lg:grid-cols-3">
      <KeyFigure
        frame="plain"
        testId="stat-planned"
        label={<Term id="orcamento-previsto">Orçamento previsto</Term>}
        value={figures.planned == null ? null : formatBRLShort(figures.planned)}
        explanation={`Aprovado pela ${legislature} na lei do orçamento (LOA) de ${year}.`}
        comparison={figures.authorized != null && `Atualizado para ${formatBRLShort(figures.authorized)} ao longo do ano`}
      />
      <KeyFigure
        frame="plain"
        testId="stat-paid"
        label={<Term id="pagamento">Gasto real (pago)</Term>}
        value={figures.paid == null ? null : formatBRLShort(figures.paid)}
        explanation="O que efetivamente saiu do caixa para pagar as despesas do ano."
        comparison={execution != null && `${formatPercent(execution)} do orçamento atualizado foi pago`}
      />
      <KeyFigure
        frame="plain"
        testId="stat-per-capita"
        label="Gasto por habitante"
        value={perCapita == null ? null : formatBRL(perCapita)}
        explanation={`Gasto pago dividido pelos ${formatInteger(figures.population)} moradores considerados pelo Tesouro em ${year}.`}
        comparison={compareWith(perCapita, sizeMedianPerCapita, "mediana do mesmo porte", formatBRL)}
      />
    </div>
  );
}
