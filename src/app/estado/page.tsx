import type { Metadata } from "next";
import FilterForm from "@/components/ui/FilterForm";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import SectionNav from "@/components/ui/SectionNav";
import SelectField from "@/components/ui/SelectField";
import AreaTable from "@/features/budget/components/AreaTable";
import BudgetKeyFigures from "@/features/budget/components/BudgetKeyFigures";
import BudgetSource from "@/features/budget/components/BudgetSource";
import BudgetSummary from "@/features/budget/components/BudgetSummary";
import EvolutionSection from "@/features/budget/components/EvolutionSection";
import RevenueBreakdown from "@/features/budget/components/RevenueBreakdown";
import { getEntityYear, parseArea, parseYear, STATE_CODE } from "@/features/budget/data";
import { getAreaRows, getPerCapitaSeries, pickFigures } from "@/features/budget/metrics";
import { yearOptions } from "@/features/budget/options";
import InsightList, { InsightDisclaimer } from "@/features/insights/components/InsightList";
import { getInsights } from "@/features/insights/rules";
import { formatInteger } from "@/lib/format";

export const metadata: Metadata = { title: "Raio-x do Governo do Estado" };

export default async function StatePage({ searchParams }: PageProps<"/estado">) {
  const query = await searchParams;
  const year = parseYear(query.ano);
  const area = parseArea(query.area);
  const entity = getEntityYear(STATE_CODE, year);
  const figures = pickFigures(entity, null);
  const areas = getAreaRows(STATE_CODE, year, false);
  const insights = getInsights(STATE_CODE, year);

  const chapters = [
    { id: "resumo", number: "01", label: "Resumo" },
    { id: "atencao", number: "02", label: "Pontos de atenção", badge: insights.length },
    { id: "receitas", number: "03", label: "De onde vem o dinheiro" },
    { id: "gastos", number: "04", label: "Para onde vai" },
    { id: "evolucao", number: "05", label: "Evolução" },
  ];

  return (
    <article>
      <PageHeader
        eyebrow="Raio-x do orçamento"
        title="Governo do Estado de Sergipe"
        description={
          <p className="text-base">
            Poder Executivo e demais órgãos estaduais · população de {formatInteger(figures.population)} em {year}
          </p>
        }
        aside={
          <FilterForm>
            {area && <input type="hidden" name="area" value={area} />}
            <SelectField name="ano" label="Ano" value={String(year)} options={yearOptions()} />
          </FilterForm>
        }
      />

      <div className="grid gap-10 lg:grid-cols-[11rem_minmax(0,1fr)]">
        <aside>
          <SectionNav title="Neste raio-x" items={chapters} />
        </aside>
        <div>
          <Section id="resumo" number="01" title={`${year} em poucas palavras`}>
            <BudgetSummary name="o Governo do Estado" year={year} entity={entity} areas={areas} insightCount={insights.length} />
            <div className="mt-10">
              <BudgetKeyFigures figures={figures} year={year} />
            </div>
          </Section>

          <Section id="atencao" number="02" title="Pontos de atenção" description={<InsightDisclaimer />}>
            <InsightList insights={insights} />
          </Section>

          <Section
            id="receitas"
            number="03"
            title="De onde vem o dinheiro"
            description="Receita do Estado por origem, já descontada a parte do ICMS e do IPVA que pertence aos municípios."
          >
            <RevenueBreakdown entity={entity} isState />
          </Section>

          <Section
            id="gastos"
            number="04"
            title="Para onde vai o dinheiro"
            description="Previsto e pago em cada área. Clique numa área para ver a evolução dela."
          >
            <AreaTable rows={areas} showMedian={false} areaHref={(code) => `/estado?ano=${year}&area=${code}#evolucao`} />
            <BudgetSource year={year} />
          </Section>

          <EvolutionSection
            number="05"
            year={year}
            area={area}
            main={{ label: "Governo do Estado", points: getPerCapitaSeries(STATE_CODE, area) }}
          />
        </div>
      </div>
    </article>
  );
}
