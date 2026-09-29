import type { Metadata } from "next";
import FilterForm from "@/components/ui/FilterForm";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import SectionNav from "@/components/ui/SectionNav";
import SelectField from "@/components/ui/SelectField";
import ShareButtons from "@/components/ui/ShareButtons";
import AreaTable from "@/features/budget/components/AreaTable";
import BudgetKeyFigures from "@/features/budget/components/BudgetKeyFigures";
import BudgetSource from "@/features/budget/components/BudgetSource";
import BudgetSummary from "@/features/budget/components/BudgetSummary";
import DataSources from "@/features/budget/components/DataSources";
import EvolutionSection, { parseReal } from "@/features/budget/components/EvolutionSection";
import HundredReais from "@/features/budget/components/HundredReais";
import RevenueBreakdown from "@/features/budget/components/RevenueBreakdown";
import { getEntityYear, parseArea, parseYear, STATE_CODE } from "@/features/budget/data";
import { getAreaRows, getPerCapitaSeries, pickFigures } from "@/features/budget/metrics";
import { yearOptions } from "@/features/budget/options";
import InsightList, { InsightDisclaimer } from "@/features/insights/components/InsightList";
import { getInsights } from "@/features/insights/rules";
import { getLegalChecks } from "@/features/legal/checks";
import LegalChecks, { LegalNote } from "@/features/legal/components/LegalChecks";
import { formatBRLShort, formatInteger } from "@/lib/format";

export const metadata: Metadata = { title: "Raio-x do Governo do Estado" };

export default async function StatePage({ searchParams }: PageProps<"/estado">) {
  const query = await searchParams;
  const year = parseYear(query.ano);
  const area = parseArea(query.area);
  const real = parseReal(query.inflacao);
  const entity = getEntityYear(STATE_CODE, year);
  const figures = pickFigures(entity, null);
  const areas = getAreaRows(STATE_CODE, year, false);
  const insights = getInsights(STATE_CODE, year);
  const legal = getLegalChecks(STATE_CODE, year);
  const legalIssues = legal.filter((c) => c.status !== "ok" && c.status !== "unknown").length;

  const chapters = [
    { id: "resumo", number: "01", label: "Resumo" },
    { id: "obrigacoes", number: "02", label: "Obrigações legais", badge: legalIssues },
    { id: "atencao", number: "03", label: "Pontos de atenção", badge: insights.length },
    { id: "receitas", number: "04", label: "De onde vem o dinheiro" },
    { id: "gastos", number: "05", label: "Para onde vai" },
    { id: "evolucao", number: "06", label: "Evolução" },
    { id: "fontes", number: "07", label: "Dados e fontes" },
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

      <div className="grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <aside>
          <SectionNav title="Neste raio-x" items={chapters} />
        </aside>
        <div>
          <Section
            id="resumo"
            number="01"
            title={`${year} em poucas palavras`}
            actions={
              <ShareButtons
                path="/estado"
                text={`Governo de Sergipe em ${year}: arrecadou ${formatBRLShort(entity?.revenue?.total)} e pagou ${formatBRLShort(entity?.paid)}.`}
              />
            }
          >
            <BudgetSummary name="o Governo do Estado" year={year} entity={entity} areas={areas} insightCount={insights.length} />
            <div className="mt-6">
              <BudgetKeyFigures figures={figures} year={year} />
            </div>
          </Section>

          <Section
            id="obrigacoes"
            number="02"
            title="Obrigações legais"
            description="O que a Constituição e a Lei de Responsabilidade Fiscal exigem do Estado (saúde: 12%; pessoal: 49% da RCL), e o que foi declarado."
          >
            <LegalChecks checks={legal} />
            <LegalNote />
          </Section>

          <Section id="atencao" number="03" title="Pontos de atenção" description={<InsightDisclaimer />}>
            <InsightList insights={insights} entitySlug="estado" />
          </Section>

          <Section
            id="receitas"
            number="04"
            title="De onde vem o dinheiro"
            description="Receita do Estado por origem, já descontada a parte do ICMS e do IPVA que pertence aos municípios."
          >
            <RevenueBreakdown entity={entity} isState />
          </Section>

          <Section id="gastos" number="05" title="Para onde vai o dinheiro" description="Previsto e pago em cada área. Clique numa área para ver a evolução dela.">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="order-2 xl:order-1">
                <AreaTable rows={areas} showMedian={false} areaHref={(code) => `/estado?ano=${year}&area=${code}#evolucao`} />
              </div>
              <div className="order-1 xl:order-2">
                <HundredReais rows={areas} who="o Governo do Estado" />
              </div>
            </div>
            <BudgetSource year={year} />
          </Section>

          <EvolutionSection
            number="06"
            year={year}
            area={area}
            real={real}
            main={{ label: "Governo do Estado", points: getPerCapitaSeries(STATE_CODE, area, real) }}
          />

          <Section id="fontes" number="07" title="Dados e fontes">
            <DataSources code={STATE_CODE} name="o Governo do Estado" year={year} csvHref="/dados/estado" />
          </Section>
        </div>
      </div>
    </article>
  );
}
