import Link from "next/link";
import { DataTable, Td, Th } from "@/components/ui/DataTable";
import FilterForm from "@/components/ui/FilterForm";
import Section from "@/components/ui/Section";
import SelectField from "@/components/ui/SelectField";
import SourceNote from "@/components/ui/SourceNote";
import BudgetKeyFigures from "@/features/budget/components/BudgetKeyFigures";
import BudgetSource from "@/features/budget/components/BudgetSource";
import { getEntityYear, parseYear, STATE_CODE } from "@/features/budget/data";
import { INDICATORS, parseIndicator } from "@/features/budget/indicators";
import { getMunicipalTotals, ratio } from "@/features/budget/metrics";
import { yearOptions } from "@/features/budget/options";
import { InsightDisclaimer } from "@/features/insights/components/InsightList";
import StateHighlights from "@/features/insights/components/StateHighlights";
import { countMunicipalitiesWithInsights, getInsights, getStateHighlights } from "@/features/insights/rules";
import { quantileBuckets } from "@/features/map/buckets";
import { getMunicipalityCards } from "@/features/map/explorerData";
import { getMunicipalityShapes, mapSource } from "@/features/map/geo";
import MapExplorer from "@/features/map/MapExplorer";
import MunicipalitySearch from "@/features/municipalities/components/MunicipalitySearch";
import { MUNICIPALITIES } from "@/features/municipalities/registry";
import { getTerritoryRows } from "@/features/municipalities/territories";
import { formatBRL, formatBRLShort, formatInteger, formatPercent } from "@/lib/format";
import { slugify } from "@/lib/slug";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const query = await searchParams;
  const year = parseYear(query.ano);
  const indicator = parseIndicator(query.indicador);

  const totals = getMunicipalTotals(year);
  const state = getEntityYear(STATE_CODE, year);
  const stateInsights = getInsights(STATE_CODE, year);
  const map = quantileBuckets(indicator.values(year), indicator.format);
  const territories = getTerritoryRows(year);
  const flagged = countMunicipalitiesWithInsights(year);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6 pb-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-brand-700">Orçamento público dos 75 municípios · {year}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Para onde vai o dinheiro público em Sergipe
          </h1>
        </div>
        <div className="w-full sm:w-80">
          <MunicipalitySearch
            items={MUNICIPALITIES.map(({ name, slug, territory }) => ({ name, slug, territory }))}
            linkQuery={`?ano=${year}`}
          />
        </div>
      </div>

      <MapExplorer
        shapes={getMunicipalityShapes()}
        values={map.values}
        legend={map.legend}
        cards={getMunicipalityCards(year, indicator)}
        indicatorLabel={indicator.label}
        year={year}
        toolbar={
          <FilterForm className="flex flex-wrap items-end gap-4">
            <SelectField
              name="indicador"
              label="Colorir o mapa por"
              value={indicator.id}
              options={INDICATORS.map((i) => ({ value: i.id, label: i.label }))}
            />
            <SelectField name="ano" label="Ano" value={String(year)} options={yearOptions()} />
            <p className="max-w-xs pb-2 text-xs text-ink-500">{indicator.description}</p>
          </FilterForm>
        }
        overview={
          <div className="flex flex-1 flex-col p-5">
            <p className="text-xs font-medium text-ink-500">Sergipe · {year}</p>
            <h2 className="text-2xl font-bold tracking-tight text-ink-900">As 75 prefeituras</h2>
            <dl className="mt-4 space-y-3">
              {[
                ["Arrecadaram", formatBRLShort(totals.revenue)],
                ["Pagaram", formatBRLShort(totals.paid)],
                ["Orçamento executado", formatPercent(ratio(totals.paid, totals.authorized))],
                ["Gasto por habitante", formatBRL(ratio(totals.paid, totals.population))],
              ].map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between border-b border-paper-200 pb-2">
                  <dt className="text-sm text-ink-700">{label}</dt>
                  <dd className="text-lg font-bold tabular-nums text-ink-900">{value}</dd>
                </div>
              ))}
            </dl>
            <a
              href="#destaques"
              className="mt-4 flex items-center gap-2 rounded-md border border-alert-200 bg-alert-50 px-3 py-2.5 text-sm text-alert-800 hover:bg-alert-100"
            >
              <span aria-hidden>▲</span>
              <span>
                <strong>{flagged} municípios</strong> com pontos de atenção
              </span>
            </a>
            <p className="mt-auto pt-6 text-sm text-ink-500">
              Passe o mouse sobre um município para ver a ficha. Clique para fixá-la.
            </p>
          </div>
        }
      />
      <SourceNote>
        Malha municipal: {mapSource.label}, {mapSource.period}. Valores: Tesouro Nacional (SICONFI), {year}. O mapa
        divide os municípios em 5 grupos de 15; a cor mostra a posição relativa, não se o valor é bom ou ruim.
      </SourceNote>

      <section aria-label="Os 75 municípios somados" className="mt-8">
        <BudgetKeyFigures figures={totals} year={year} />
        <BudgetSource year={year} />
      </section>

      <Section
        id="destaques"
        number="!"
        title="O que foge do padrão"
        description={
          <div className="space-y-2">
            <p>
              <strong className="text-ink-900">{flagged} dos 75 municípios</strong> acionaram ao menos um ponto de
              atenção em {year}. Abaixo, os casos mais fora do padrão em cada critério.
            </p>
            <InsightDisclaimer />
          </div>
        }
      >
        <StateHighlights highlights={getStateHighlights(year)} year={year} />
      </Section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Section
          id="territorios"
          title="Os 8 territórios de planejamento"
          description="Os municípios de cada território somados."
        >
          <DataTable testId="territory-table" minWidth={560}>
            <thead>
              <tr>
                <Th>Território</Th>
                <Th align="right">Municípios</Th>
                <Th align="right">População</Th>
                <Th align="right">Executado</Th>
                <Th align="right">Gasto/hab.</Th>
              </tr>
            </thead>
            <tbody>
              {territories.map((t) => (
                <tr key={t.name} className="hover:bg-paper-100">
                  <Td>
                    <Link
                      href={`/municipios?ano=${year}&territorio=${slugify(t.name)}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {t.name}
                    </Link>
                  </Td>
                  <Td align="right">{t.count}</Td>
                  <Td align="right">{formatInteger(t.population)}</Td>
                  <Td align="right">{formatPercent(t.execution)}</Td>
                  <Td align="right" className="font-semibold">{formatBRL(t.paidPerCapita)}</Td>
                </tr>
              ))}
            </tbody>
          </DataTable>
          <SourceNote>
            Territórios de Planejamento (Decreto estadual nº 24.338/2007). Gasto por habitante = total pago pelos
            municípios do território ÷ população somada.
          </SourceNote>
        </Section>

        <Section id="estado" title="Governo do Estado">
          <p className="text-sm text-ink-500">Sergipe · {year}</p>
          <dl className="mt-3 space-y-3">
            {[
              ["Arrecadou", formatBRLShort(state?.revenue?.total)],
              ["Pagou", formatBRLShort(state?.paid)],
              ["Orçamento aprovado", formatBRLShort(state?.planned)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between border-b border-paper-200 pb-2">
                <dt className="text-sm text-ink-700">{label}</dt>
                <dd className="text-lg font-bold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm text-ink-700">
            {stateInsights.length === 0
              ? "Nenhum ponto de atenção no ano."
              : `${stateInsights.length} ${stateInsights.length === 1 ? "ponto de atenção" : "pontos de atenção"} no ano.`}
          </p>
          <Link
            href={`/estado?ano=${year}`}
            className="mt-5 block rounded-md bg-brand-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-800"
          >
            Ver raio-x do Estado →
          </Link>
        </Section>
      </div>
    </>
  );
}
