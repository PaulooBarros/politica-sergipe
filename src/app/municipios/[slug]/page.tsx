import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
import PeerComparison from "@/features/budget/components/PeerComparison";
import RevenueBreakdown from "@/features/budget/components/RevenueBreakdown";
import { getEntityYear, parseArea, parseYear } from "@/features/budget/data";
import {
  getAreaRows,
  getComparisons,
  getMunicipalityRows,
  getPeerStats,
  getPerCapitaSeries,
  getSizeMedianSeries,
  getStateMedianSeries,
  median,
  pickFigures,
} from "@/features/budget/metrics";
import { yearOptions } from "@/features/budget/options";
import InsightList, { InsightDisclaimer } from "@/features/insights/components/InsightList";
import { getInsights } from "@/features/insights/rules";
import TerritoryNeighbors from "@/features/municipalities/components/TerritoryNeighbors";
import { getMunicipalityBySlug, getSizeClass } from "@/features/municipalities/registry";
import { formatInteger } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/municipios/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const municipality = getMunicipalityBySlug(slug);
  return { title: municipality ? `Raio-x de ${municipality.name}` : "Município não encontrado" };
}

export default async function MunicipalityPage({ params, searchParams }: PageProps<"/municipios/[slug]">) {
  const { slug } = await params;
  const query = await searchParams;
  const municipality = getMunicipalityBySlug(slug);
  if (!municipality) notFound();

  const year = parseYear(query.ano);
  const area = parseArea(query.area);
  const entity = getEntityYear(municipality.code, year);
  const figures = pickFigures(entity, null);
  const sizeClass = getSizeClass(figures.population);
  const areas = getAreaRows(municipality.code, year, true);
  const insights = getInsights(municipality.code, year);
  const rows = getMunicipalityRows(year);
  const neighbors = rows.filter((r) => r.territory === municipality.territory);
  const sizePeers = rows.filter((r) => r.sizeClass?.id === sizeClass?.id);

  const areaHref = (code: string) => `/municipios/${slug}?ano=${year}&area=${code}#evolucao`;

  const chapters = [
    { id: "resumo", number: "01", label: "Resumo" },
    { id: "atencao", number: "02", label: "Pontos de atenção", badge: insights.length },
    { id: "receitas", number: "03", label: "De onde vem o dinheiro" },
    { id: "gastos", number: "04", label: "Para onde vai" },
    { id: "comparacao", number: "05", label: "Comparação" },
    { id: "evolucao", number: "06", label: "Evolução" },
  ];

  return (
    <article>
      <PageHeader
        eyebrow={
          <nav aria-label="Trilha" className="flex flex-wrap gap-x-2">
            <Link href={`/municipios?ano=${year}`} className="hover:underline">
              Municípios
            </Link>
            <span aria-hidden>/</span>
            <span>{municipality.territory}</span>
          </nav>
        }
        title={municipality.name}
        description={
          <p className="text-base">
            Território {municipality.territory} · {sizeClass?.label ?? "porte não informado"} · população de{" "}
            {formatInteger(figures.population)} em {year}
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
            <BudgetSummary name={municipality.name} year={year} entity={entity} areas={areas} insightCount={insights.length} />
            <div className="mt-10">
              <BudgetKeyFigures figures={figures} year={year} comparisons={getComparisons(municipality.code, year, null)} />
            </div>
          </Section>

          <Section id="atencao" number="02" title="Pontos de atenção" description={<InsightDisclaimer />}>
            <InsightList insights={insights} />
          </Section>

          <Section
            id="receitas"
            number="03"
            title="De onde vem o dinheiro"
            description="Quanto a prefeitura arrecadou e de quais fontes. É o que explica por que alguns municípios pequenos têm muito mais dinheiro por habitante."
          >
            <RevenueBreakdown
              entity={entity}
              peerMedianPerCapita={median(sizePeers.map((r) => r.revenuePerCapita))}
              peerLabel="dos municípios do mesmo porte"
            />
          </Section>

          <Section
            id="gastos"
            number="04"
            title="Para onde vai o dinheiro"
            description="Previsto e pago em cada área. Clique numa área para ver a evolução dela."
          >
            <AreaTable rows={areas} showMedian areaHref={areaHref} />
            <BudgetSource year={year} />
          </Section>

          <Section
            id="comparacao"
            number="05"
            title="Comparação"
            description="Como o município se situa entre os de mesmo porte, os do seu território e os 75 de Sergipe."
          >
            <PeerComparison
              stats={getPeerStats(municipality.code, year)}
              sizeLabel={sizeClass?.label ?? "—"}
              territory={municipality.territory}
            />
            <h3 className="mt-10 text-xl font-semibold text-ink-900">
              Vizinhos no território {municipality.territory}
            </h3>
            <div className="mt-4">
              <TerritoryNeighbors rows={neighbors} currentCode={municipality.code} year={year} />
            </div>
          </Section>

          <EvolutionSection
            number="06"
            year={year}
            area={area}
            main={{ label: municipality.name, points: getPerCapitaSeries(municipality.code, area) }}
            references={[
              { label: "Mediana do mesmo porte", points: getSizeMedianSeries(municipality.code, area) },
              { label: "Mediana de Sergipe", points: getStateMedianSeries(area) },
            ]}
          />
        </div>
      </div>
    </article>
  );
}
