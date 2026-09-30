import type { Metadata } from "next";
import FilterForm from "@/components/ui/FilterForm";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import SectionNav from "@/components/ui/SectionNav";
import SelectField from "@/components/ui/SelectField";
import ShareButtons from "@/components/ui/ShareButtons";
import SourceNote from "@/components/ui/SourceNote";
import Term from "@/components/ui/Term";
import BudgetKeyFigures from "@/features/budget/components/BudgetKeyFigures";
import DataSources from "@/features/budget/components/DataSources";
import EvolutionSection, { parseReal } from "@/features/budget/components/EvolutionSection";
import RevenueBreakdown from "@/features/budget/components/RevenueBreakdown";
import SpendingBreakdown from "@/features/budget/components/SpendingBreakdown";
import { getEntityYear, parseArea, parseYear, STATE_CODE } from "@/features/budget/data";
import { budgetLede, revenueHeadline, spendingHeadline } from "@/features/budget/headlines";
import { getAreaRows, getPerCapitaSeries, pickFigures } from "@/features/budget/metrics";
import { yearOptions } from "@/features/budget/options";
import InsightList, { InsightDisclaimer, insightsHeadline } from "@/features/insights/components/InsightList";
import { getInsights } from "@/features/insights/rules";
import { getLegalChecks, legalHeadline } from "@/features/legal/checks";
import LegalChecks, { LegalNote } from "@/features/legal/components/LegalChecks";
import { formatBRLShort, formatInteger } from "@/lib/format";

export const metadata: Metadata = { title: "Raio-x do Governo do Estado" };

const CHAPTERS = [
  { id: "resumo", label: "Resumo" },
  { id: "obrigacoes", label: "Obrigações legais" },
  { id: "atencao", label: "Pontos de atenção" },
  { id: "receitas", label: "De onde vem" },
  { id: "gastos", label: "Para onde vai" },
  { id: "evolucao", label: "Evolução" },
  { id: "fontes", label: "Dados e fontes" },
];
const eyebrow = (id: string) => {
  const i = CHAPTERS.findIndex((c) => c.id === id);
  return `${i + 1} · ${CHAPTERS[i].label}`;
};

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

  const chapters = CHAPTERS.map((c) => ({
    ...c,
    badge: c.id === "obrigacoes" ? legalIssues : c.id === "atencao" ? insights.length : undefined,
  }));

  return (
    <article id="topo">
      <PageHeader
        breadcrumb={[{ label: "Início", href: "/" }, { label: "Governo do Estado" }]}
        eyebrow={`Raio-x do Governo do Estado · ${year}`}
        title="Governo do Estado de Sergipe"
        description="O orçamento estadual é separado do das prefeituras: segurança pública, ensino médio, hospitais regionais e estradas estaduais são responsabilidade do Estado."
        meta={["Poder Executivo e demais órgãos estaduais", `${formatInteger(figures.population)} habitantes`]}
        aside={
          <FilterForm>
            {area && <input type="hidden" name="area" value={area} />}
            {!real && <input type="hidden" name="inflacao" value="nao" />}
            <SelectField name="ano" label="Ano" value={String(year)} options={yearOptions()} className="w-28" />
          </FilterForm>
        }
      />

      <SectionNav title="Capítulos do raio-x" items={chapters} />

      <div className="page flex flex-col gap-5 pt-6 lg:pt-10">
        <Section
          id="resumo"
          eyebrow={eyebrow("resumo")}
          titleStyle="lede"
          title={<span data-testid="summary">{budgetLede("o Governo do Estado", year, entity)}</span>}
          actions={
            <ShareButtons
              path="/estado"
              text={`Governo de Sergipe em ${year}: arrecadou ${formatBRLShort(entity?.revenue?.total)} e pagou ${formatBRLShort(entity?.paid)}.`}
            />
          }
        >
          <BudgetKeyFigures figures={figures} year={year} legislature="Assembleia Legislativa" />
          {insights.length > 0 && (
            <a
              href="#atencao"
              className="flex min-h-11 items-center gap-2.5 self-start rounded-md border border-alert-200 bg-alert-50 px-3.5 text-[15px] font-medium text-alert-800"
            >
              <span aria-hidden className="text-xs text-alert-500">
                ▲
              </span>
              {insights.length === 1 ? "1 ponto de atenção neste ano." : `${insights.length} pontos de atenção neste ano.`}
              <span className="underline">Ver capítulo 3</span>
            </a>
          )}
          <SourceNote>
            SICONFI/Tesouro Nacional: RREO Anexo 02 (orçamento previsto e atualizado, 6º bimestre) e DCA Anexo I-E (gasto
            pago e população), {year}.
          </SourceNote>
        </Section>

        <Section
          id="obrigacoes"
          eyebrow={eyebrow("obrigacoes")}
          title={legalHeadline(legal)}
          description="Para os estados, o mínimo da saúde é 12% e o limite de pessoal do Executivo é 49% da receita corrente líquida. A linha tracejada marca o mínimo ou o limite."
          backToTop
        >
          <LegalChecks checks={legal} />
          <LegalNote />
        </Section>

        <Section id="atencao" eyebrow={eyebrow("atencao")} title={insightsHeadline(insights.length, year)} description={<InsightDisclaimer />} backToTop>
          <InsightList insights={insights} entitySlug="estado" />
        </Section>

        <Section
          id="receitas"
          eyebrow={eyebrow("receitas")}
          title={revenueHeadline(entity, true)}
          description={
            <p className="text-[15px] text-ink-500">
              Receita do Estado por origem, em % do total · {year}. Já descontada a parte do ICMS e do IPVA que pertence aos
              municípios.
            </p>
          }
          backToTop
        >
          <RevenueBreakdown entity={entity} year={year} isState />
        </Section>

        <Section
          id="gastos"
          eyebrow={eyebrow("gastos")}
          title={spendingHeadline(areas)}
          description={
            <p className="text-[15px] text-ink-500">
              Gasto pago por área (<Term id="funcao">função de governo</Term>) · {year}. Escolha uma área para destacá-la e
              ver a evolução dela no capítulo 6.
            </p>
          }
          backToTop
        >
          <SpendingBreakdown rows={areas} year={year} area={area} basePath="/estado" keep={real ? {} : { inflacao: "nao" }} showMedian={false} />
          <SourceNote>
            SICONFI/Tesouro Nacional: DCA Anexo I-E (pago) e RREO Anexo 02 (previsto e atualizado), por função, {year}.
          </SourceNote>
        </Section>

        <EvolutionSection
          eyebrow={eyebrow("evolucao")}
          year={year}
          area={area}
          real={real}
          basePath="/estado"
          main={{ label: "Governo do Estado", points: getPerCapitaSeries(STATE_CODE, area, real) }}
        />

        <Section id="fontes" eyebrow={eyebrow("fontes")} title="Baixe os números e confira na fonte" backToTop>
          <DataSources code={STATE_CODE} title="Raio-x do Governo do Estado de Sergipe" name="o Governo do Estado" year={year} csvHref="/dados/estado" />
        </Section>
      </div>
    </article>
  );
}
