import BarList from "@/components/charts/BarList";
import FactGrid from "@/components/ui/FactGrid";
import SourceNote from "@/components/ui/SourceNote";
import Term from "@/components/ui/Term";
import { formatBRL, formatBRLCompact, formatBRLShort, formatDecimal, formatPercent } from "@/lib/format";
import type { EntityYear } from "../data";
import { revenueSources } from "../headlines";
import { ratio } from "../metrics";

type Props = {
  entity: EntityYear | null;
  year: number;
  isState?: boolean;
  /** Median revenue per inhabitant of comparable municipalities, for context. */
  peerMedianPerCapita?: number | null;
  peerLabel?: string;
};

// Revenue that deserves follow-up: amber bar plus a written tag, never colour alone.
const RISK: Record<string, string> = { royalties: "receita variável", loans: "paga pelas gestões seguintes" };

export default function RevenueBreakdown({ entity, year, isState = false, peerMedianPerCapita, peerLabel }: Props) {
  const revenue = entity?.revenue;
  if (!entity || !revenue) {
    return <p className="text-body text-ink-700">A receita deste ano não foi declarada ao Tesouro Nacional.</p>;
  }

  const perCapita = ratio(revenue.total, entity.population);
  const balance = entity.paid == null ? null : revenue.total - entity.paid;
  const peerRatio = ratio(perCapita, peerMedianPerCapita);

  return (
    <>
      <FactGrid
        facts={[
          { label: "Receita do ano", value: formatBRLShort(revenue.total), note: "Já descontada a parte que vai para o Fundeb." },
          {
            label: "Receita por habitante",
            value: perCapita == null ? null : formatBRL(perCapita),
            note: peerRatio != null ? `${formatDecimal(peerRatio)} vezes a mediana ${peerLabel} (${formatBRL(peerMedianPerCapita)})` : undefined,
          },
          { label: "Gasto pago", value: entity.paid == null ? null : formatBRLShort(entity.paid), note: "Para comparar com o que entrou." },
          {
            label: balance == null || balance >= 0 ? "Sobrou no ano" : "Faltou no ano",
            value: balance == null ? null : formatBRLShort(Math.abs(balance)),
            note:
              balance == null
                ? undefined
                : balance >= 0
                  ? "Receita menos gasto pago. Parte costuma pagar despesas deixadas para o ano seguinte."
                  : "O gasto pago superou a receita: foi coberto com dinheiro de anos anteriores.",
          },
        ]}
      />

      <div className="max-w-[55rem]" data-testid="revenue-sources">
        <BarList
          labelWidth="15rem"
          rows={revenueSources(entity).map((s) => ({
            key: s.key,
            label: (
              <span className="flex flex-wrap items-center gap-2 font-medium">
                {s.key === "royalties" ? <Term id="royalties">{s.label}</Term> : isState && s.stateLabel ? s.stateLabel : s.label}
                {RISK[s.key] && (
                  <span className="rounded border border-alert-200 bg-alert-50 px-1.5 text-xs font-semibold text-alert-800">
                    <span aria-hidden className="text-[10px] text-alert-500">▲</span> {RISK[s.key]}
                  </span>
                )}
              </span>
            ),
            note: s.description,
            value: s.value,
            tone: RISK[s.key] ? "alert" : "brand",
            valueText: (
              <>
                <strong className="font-semibold text-ink-900">{formatPercent(s.share)}</strong>{" "}
                <span className="text-ink-500">· {formatBRLCompact(s.value)}</span>
              </>
            ),
          }))}
        />
      </div>
      <SourceNote>
        SICONFI/Tesouro Nacional, DCA Anexo I-C (receita realizada por origem), {year}. Sem operações intraorçamentárias
        {isState ? "; já descontada a cota do ICMS e do IPVA que pertence aos municípios" : ""}.
      </SourceNote>
    </>
  );
}
