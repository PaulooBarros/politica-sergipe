import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FilterForm from "@/components/ui/FilterForm";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import SectionNav from "@/components/ui/SectionNav";
import SelectField from "@/components/ui/SelectField";
import ShareButtons from "@/components/ui/ShareButtons";
import Term from "@/components/ui/Term";
import AreaTable from "@/features/budget/components/AreaTable";
import BudgetKeyFigures from "@/features/budget/components/BudgetKeyFigures";
import BudgetSource from "@/features/budget/components/BudgetSource";
import BudgetSummary from "@/features/budget/components/BudgetSummary";
import DataSources from "@/features/budget/components/DataSources";
import EvolutionSection, { parseReal } from "@/features/budget/components/EvolutionSection";
import HundredReais from "@/features/budget/components/HundredReais";
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
import { getLegalChecks } from "@/features/legal/checks";
import LegalChecks, { LegalNote } from "@/features/legal/components/LegalChecks";
import TerritoryNeighbors from "@/features/municipalities/components/TerritoryNeighbors";
import { getMunicipalityBySlug, getSizeClass } from "@/features/municipalities/registry";
import { formatBRL, formatBRLShort, formatInteger } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/municipios/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const municipality = getMunicipalityBySlug(slug);
  if (!municipality) return { title: "Município não encontrado" };
  return {
    title: `Raio-x de ${municipality.name}`,
    description: `Receita, orçamento, gasto por área, obrigações legais e pontos de atenção de ${municipality.name} (SE), com dados oficiais do Tesouro Nacional.`,
  };
}

export default async function MunicipalityPage({ params, searchParams }: PageProps<"/municipios/[slug]">) {
  const { slug } = await params;
  const query = await searchParams;
  const municipality = getMunicipalityBySlug(slug);
  if (!municipality) notFound();

  const year = parseYear(query.ano);
  const area = parseArea(query.area);
  const real = parseReal(query.inflacao);
  const entity = getEntityYear(municipality.code, year);
  const figures = pickFigures(entity, null);
  const sizeClass = getSizeClass(figures.population);
  const areas = getAreaRows(municipality.code, year, true);
  const insights = getInsights(municipality.code, year);
  const legal = getLegalChecks(municipality.code, year);
  const legalIssues = legal.filter((c) => c.status !== "ok" && c.status !== "unknown").length;
  const rows = getMunicipalityRows(year);
  const self = rows.find((r) => r.code === municipality.code);
  const neighbors = rows.filter((r) => r.territory === municipality.territory);
  const sizePeers = rows.filter((r) => r.sizeClass?.id === sizeClass?.id);

  const areaHref = (code: string) => `/municipios/${slug}?ano=${year}&area=${code}#evolucao`;

  const chapters = [
    { id: "resumo", number: "01", label: "Resumo" },
    { id: "obrigacoes", number: "02", label: "Obrigações legais", badge: legalIssues },
    { id: "atencao", number: "03", label: "Pontos de atenção", badge: insights.length },
    { id: "receitas", number: "04", label: "De onde vem o dinheiro" },
    { id: "gastos", number: "05", label: "Para onde vai" },
    { id: "comparacao", number: "06", label: "Comparação" },
    { id: "evolucao", number: "07", label: "Evolução" },
    { id: "fontes", number: "08", label: "Dados e fontes" },
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
            <Term id="territorio">Território {municipality.territory}</Term> · {sizeClass?.label ?? "porte não informado"}{" "}
            · população de {formatInteger(figures.population)} em {year}
          </p>
        }
        aside={
          <FilterForm className="flex items-end gap-3">
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
                path={`/${slug}`}
                text={`${municipality.name} em ${year}: arrecadou ${formatBRLShort(entity?.revenue?.total)}, gastou ${formatBRL(self?.paidPerCapita)} por habitante e tem ${insights.length} pontos de atenção nos dados oficiais.`}
              />
            }
          >
            <BudgetSummary name={municipality.name} year={year} entity={entity} areas={areas} insightCount={insights.length} />
            <div className="mt-6">
              <BudgetKeyFigures figures={figures} year={year} comparisons={getComparisons(municipality.code, year, null)} />
            </div>
          </Section>

          <Section
            id="obrigacoes"
            number="02"
            title="Obrigações legais"
            description="O que a Constituição e a Lei de Responsabilidade Fiscal exigem, e o que a prefeitura declarou."
          >
            <LegalChecks checks={legal} />
            <LegalNote />
          </Section>

          <Section id="atencao" number="03" title="Pontos de atenção" description={<InsightDisclaimer />}>
            <InsightList insights={insights} entitySlug={slug} />
          </Section>

          <Section
            id="receitas"
            number="04"
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
            number="05"
            title="Para onde vai o dinheiro"
            description="Previsto e pago em cada área. Clique numa área para ver a evolução dela."
          >
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="order-2 xl:order-1">
                <AreaTable rows={areas} showMedian areaHref={areaHref} />
              </div>
              <div className="order-1 xl:order-2">
                <HundredReais rows={areas} who="a prefeitura" />
              </div>
            </div>
            <BudgetSource year={year} />
          </Section>

          <Section
            id="comparacao"
            number="06"
            title="Comparação"
            description="Como o município se situa entre os de mesmo porte, os do seu território e os 75 de Sergipe."
            actions={
              <Link
                href={`/comparar?a=${slug}&b=${neighbors.find((n) => n.code !== municipality.code)?.slug ?? "aracaju"}&ano=${year}`}
                className="rounded-md border border-paper-300 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-brand-400 hover:text-brand-800"
              >
                Comparar com outro município →
              </Link>
            }
          >
            <PeerComparison stats={getPeerStats(municipality.code, year)} sizeLabel={sizeClass?.label ?? "—"} territory={municipality.territory} />
            <h3 className="mt-8 font-semibold text-ink-900">Vizinhos no território {municipality.territory}</h3>
            <div className="mt-3">
              <TerritoryNeighbors rows={neighbors} currentCode={municipality.code} year={year} />
            </div>
          </Section>

          <EvolutionSection
            number="07"
            year={year}
            area={area}
            real={real}
            main={{ label: municipality.name, points: getPerCapitaSeries(municipality.code, area, real) }}
            references={[
              { label: "Mediana do mesmo porte", points: getSizeMedianSeries(municipality.code, area, real) },
              { label: "Mediana de Sergipe", points: getStateMedianSeries(area, real) },
            ]}
          />

          <Section id="fontes" number="08" title="Dados e fontes">
            <DataSources code={municipality.code} name={municipality.name} year={year} csvHref={`/dados/${slug}`} />
          </Section>
        </div>
      </div>
    </article>
  );
}
