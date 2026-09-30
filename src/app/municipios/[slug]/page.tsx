import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
import PeerComparison from "@/features/budget/components/PeerComparison";
import RevenueBreakdown from "@/features/budget/components/RevenueBreakdown";
import SpendingBreakdown from "@/features/budget/components/SpendingBreakdown";
import { getEntityYear, parseArea, parseYear } from "@/features/budget/data";
import { budgetLede, comparisonHeadline, revenueHeadline, spendingHeadline } from "@/features/budget/headlines";
import {
  getAreaRows,
  getComparisons,
  getMunicipalityRows,
  getPerCapitaSeries,
  getSizeMedianSeries,
  getStateMedianSeries,
  median,
  pickFigures,
} from "@/features/budget/metrics";
import { yearOptions } from "@/features/budget/options";
import { getDistributions } from "@/features/budget/peers";
import InsightList, { InsightDisclaimer, insightsHeadline } from "@/features/insights/components/InsightList";
import { getInsights } from "@/features/insights/rules";
import { getLegalChecks, legalHeadline } from "@/features/legal/checks";
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

const CHAPTERS = [
  { id: "resumo", label: "Resumo" },
  { id: "obrigacoes", label: "Obrigações legais" },
  { id: "atencao", label: "Pontos de atenção" },
  { id: "receitas", label: "De onde vem" },
  { id: "gastos", label: "Para onde vai" },
  { id: "comparacao", label: "Comparação" },
  { id: "evolucao", label: "Evolução" },
  { id: "fontes", label: "Dados e fontes" },
];
const eyebrow = (id: string) => {
  const i = CHAPTERS.findIndex((c) => c.id === id);
  return `${i + 1} · ${CHAPTERS[i].label}`;
};

export default async function MunicipalityPage({ params, searchParams }: PageProps<"/municipios/[slug]">) {
  const { slug } = await params;
  const query = await searchParams;
  const municipality = getMunicipalityBySlug(slug);
  if (!municipality) notFound();

  const year = parseYear(query.ano);
  const area = parseArea(query.area);
  const real = parseReal(query.inflacao);
  const basePath = `/municipios/${slug}`;
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
  const sizeMedian = getComparisons(municipality.code, year, null).find((c) => c.label === "Mediana do mesmo porte")?.value ?? null;
  const compareWith = neighbors.find((n) => n.code !== municipality.code)?.slug ?? "aracaju";

  const chapters = CHAPTERS.map((c) => ({
    ...c,
    badge: c.id === "obrigacoes" ? legalIssues : c.id === "atencao" ? insights.length : undefined,
  }));

  return (
    <article id="topo">
      <PageHeader
        breadcrumb={[
          { label: "Início", href: "/" },
          { label: "Municípios", href: `/municipios?ano=${year}` },
          { label: municipality.name },
        ]}
        eyebrow={`Raio-x do município · ${year}`}
        title={municipality.name}
        meta={[
          <Term key="t" id="territorio">
            Território {municipality.territory}
          </Term>,
          `${formatInteger(figures.population)} habitantes`,
          sizeClass ? `Porte: ${sizeClass.label.toLowerCase()}` : "Porte não informado",
        ]}
        aside={
          <>
            <FilterForm>
              {area && <input type="hidden" name="area" value={area} />}
              {!real && <input type="hidden" name="inflacao" value="nao" />}
              <SelectField name="ano" label="Ano" value={String(year)} options={yearOptions()} className="w-28" />
            </FilterForm>
            <Link href={`/comparar?a=${slug}&b=${compareWith}&ano=${year}`} className="btn btn-secondary">
              Comparar com…
            </Link>
          </>
        }
      />

      <SectionNav title="Capítulos do raio-x" items={chapters} />

      <div className="page flex flex-col gap-5 pt-6 lg:pt-10">
        <Section
          id="resumo"
          eyebrow={eyebrow("resumo")}
          titleStyle="lede"
          title={<span data-testid="summary">{budgetLede(`a Prefeitura de ${municipality.name}`, year, entity, sizeMedian)}</span>}
          actions={
            <ShareButtons
              path={`/${slug}`}
              text={`${municipality.name} em ${year}: pagou ${formatBRLShort(figures.paid)}, ${formatBRL(self?.paidPerCapita)} por habitante, e tem ${insights.length} ${insights.length === 1 ? "ponto" : "pontos"} de atenção nos dados oficiais.`}
            />
          }
        >
          <BudgetKeyFigures figures={figures} year={year} legislature="Câmara Municipal" sizeMedianPerCapita={sizeMedian} />
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
          description="A lei fixa mínimos para educação, saúde e Fundeb e um teto para o gasto com pessoal. A linha tracejada marca o mínimo ou o limite."
          backToTop
        >
          <LegalChecks checks={legal} />
          <LegalNote />
        </Section>

        <Section id="atencao" eyebrow={eyebrow("atencao")} title={insightsHeadline(insights.length, year)} description={<InsightDisclaimer />} backToTop>
          <InsightList insights={insights} entitySlug={slug} />
        </Section>

        <Section
          id="receitas"
          eyebrow={eyebrow("receitas")}
          title={revenueHeadline(entity, false)}
          description={
            <p className="text-[15px] text-ink-500">
              Receita arrecadada e recebida por origem, em % do total · {year}. É o que explica por que alguns municípios
              pequenos têm muito mais dinheiro por habitante.
            </p>
          }
          backToTop
        >
          <RevenueBreakdown
            entity={entity}
            year={year}
            peerMedianPerCapita={median(sizePeers.map((r) => r.revenuePerCapita))}
            peerLabel="do mesmo porte"
          />
        </Section>

        <Section
          id="gastos"
          eyebrow={eyebrow("gastos")}
          title={spendingHeadline(areas)}
          description={
            <p className="text-[15px] text-ink-500">
              Gasto pago por área (<Term id="funcao">função de governo</Term>) · {year}. Escolha uma área para destacá-la e
              ver a evolução dela no capítulo 7.
            </p>
          }
          backToTop
        >
          <SpendingBreakdown rows={areas} year={year} area={area} basePath={basePath} keep={real ? {} : { inflacao: "nao" }} showMedian />
          <SourceNote>
            SICONFI/Tesouro Nacional: DCA Anexo I-E (pago) e RREO Anexo 02 (previsto e atualizado), por função, {year}.{" "}
            <Term id="encargos-especiais">Encargos especiais</Term> reúnem dívida e precatórios.
          </SourceNote>
        </Section>

        <Section
          id="comparacao"
          eyebrow={eyebrow("comparacao")}
          title={comparisonHeadline(self?.paidPerCapita ?? null, sizeMedian)}
          description={<p className="text-[15px] text-ink-500">Cada linha mostra os 75 municípios em cinza; as marcas indicam as medianas de referência · {year}</p>}
          actions={
            <Link href={`/comparar?a=${slug}&b=${compareWith}&ano=${year}`} className="btn btn-secondary">
              Comparar lado a lado →
            </Link>
          }
          backToTop
        >
          <PeerComparison
            name={municipality.name}
            year={year}
            distributions={getDistributions(municipality.code, year)}
            sizeLabel={sizeClass?.label ?? "—"}
            sizeCount={sizePeers.length}
            territory={municipality.territory}
          />
          <div className="flex flex-col gap-3">
            <h3 className="text-[19px] font-semibold text-ink-900">Vizinhos no território {municipality.territory}</h3>
            <TerritoryNeighbors rows={neighbors} currentCode={municipality.code} year={year} />
          </div>
        </Section>

        <EvolutionSection
          eyebrow={eyebrow("evolucao")}
          year={year}
          area={area}
          real={real}
          basePath={basePath}
          main={{ label: municipality.name, points: getPerCapitaSeries(municipality.code, area, real) }}
          references={[
            { label: "Mediana do mesmo porte", points: getSizeMedianSeries(municipality.code, area, real) },
            { label: "Mediana de Sergipe", points: getStateMedianSeries(area, real) },
          ]}
        />

        <Section id="fontes" eyebrow={eyebrow("fontes")} title="Baixe os números e confira na fonte" backToTop>
          <DataSources
            code={municipality.code}
            title={`Raio-x de ${municipality.name}`}
            name={municipality.name}
            year={year}
            csvHref={`/dados/${slug}`}
          />
        </Section>
      </div>
    </article>
  );
}
