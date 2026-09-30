import Link from "next/link";
import StripPlot from "@/components/charts/StripPlot";
import { DataTable, Td, Th } from "@/components/ui/DataTable";
import FilterForm from "@/components/ui/FilterForm";
import KeyFigure from "@/components/ui/KeyFigure";
import Section from "@/components/ui/Section";
import { SegmentedLinks } from "@/components/ui/Segmented";
import SelectField from "@/components/ui/SelectField";
import SourceNote from "@/components/ui/SourceNote";
import Term from "@/components/ui/Term";
import { getEntityYear, parseYear, STATE_CODE, YEARS } from "@/features/budget/data";
import { INDICATORS, parseIndicator } from "@/features/budget/indicators";
import { getMunicipalAreaTotals, getMunicipalTotals, getMunicipalityRows, median, ratio } from "@/features/budget/metrics";
import { InsightDisclaimer } from "@/features/insights/components/InsightList";
import StateHighlights from "@/features/insights/components/StateHighlights";
import { getInsights, getStateHighlights } from "@/features/insights/rules";
import { getLegalChecks, type LegalCheck } from "@/features/legal/checks";
import { quantileBuckets } from "@/features/map/buckets";
import { getMunicipalityCards } from "@/features/map/explorerData";
import { getMunicipalityShapes, mapSource } from "@/features/map/geo";
import MapExplorer from "@/features/map/MapExplorer";
import MunicipalitySearch from "@/features/municipalities/components/MunicipalitySearch";
import { MUNICIPALITIES } from "@/features/municipalities/registry";
import { getTerritoryRows } from "@/features/municipalities/territories";
import { formatBRL, formatBRLShort, formatInteger, formatPercent, formatPoints } from "@/lib/format";
import { toHundred } from "@/lib/hundred";
import { slugify } from "@/lib/slug";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const query = await searchParams;
  const year = parseYear(query.ano);
  const indicator = parseIndicator(query.indicador);

  const rows = getMunicipalityRows(year);
  const totals = getMunicipalTotals(year);
  const areaTotals = getMunicipalAreaTotals(year);
  const areaUnits = toHundred(areaTotals.map((a) => a.share));
  const state = getEntityYear(STATE_CODE, year);
  const stateLegal = getLegalChecks(STATE_CODE, year);
  const map = quantileBuckets(indicator.values(year), indicator.format);
  const territories = getTerritoryRows(year);
  const flaggedCodes = new Set(rows.filter((r) => getInsights(r.code, year).length > 0).map((r) => r.code));
  const missing = rows.filter((r) => r.paid == null).map((r) => ({ name: r.name, slug: r.slug }));
  const popular = [...rows].sort((a, b) => (b.population ?? 0) - (a.population ?? 0)).slice(0, 4);

  // Map title: the range of the chosen indicator, with the municipalities at each end.
  const ranked = rows
    .map((r) => ({ r, v: indicator.values(year)[r.code] }))
    .filter((x): x is { r: (typeof rows)[number]; v: number } => x.v != null)
    .sort((a, b) => a.v - b.v);
  const lowest = ranked[0];
  const highest = ranked[ranked.length - 1];
  const mapTitle = lowest
    ? `${indicator.label} vai de ${indicator.format(lowest.v)} em ${lowest.r.name} a ${indicator.format(highest.v)} em ${highest.r.name}`
    : `${indicator.label} em ${year}`;
  const indicatorMedian = median(ranked.map((x) => x.v));

  // Legal obligations as declared by each municipality.
  const legalValues = (id: LegalCheck["id"]) =>
    rows
      .map((r) => ({ label: r.name, check: getLegalChecks(r.code, year).find((c) => c.id === id)! }))
      .filter((x) => x.check.value != null);
  const education = legalValues("education");
  const health = legalValues("health");
  const personnel = legalValues("personnel");
  const below = (list: typeof education) => list.filter((x) => x.check.status === "fail").length;
  const personnelOver = below(personnel);
  const personnelWarned = personnel.filter((x) => x.check.status === "alert" || x.check.status === "prudential").length;
  const minimumsText =
    below(education) + below(health) === 0
      ? "todas as que declararam cumpriram os mínimos de educação e saúde"
      : [
          below(education) > 0 && `${below(education)} ficaram abaixo do mínimo de educação`,
          below(health) > 0 && `${below(health)} abaixo do mínimo de saúde`,
        ]
          .filter(Boolean)
          .join(" e ");
  const legalTitle = personnel.length
    ? `${personnelOver} de ${personnel.length} prefeituras passaram do limite de gasto com pessoal; ${minimumsText}`
    : "As obrigações legais deste ano ainda não foram declaradas";

  const topTerritory = [...territories].sort((a, b) => b.paid - a.paid)[0];
  const execution = ratio(totals.paid, totals.authorized);
  const perCapita = ratio(totals.paid, totals.population);
  const statePersonnel = stateLegal.find((c) => c.id === "personnel");
  const stateEducation = stateLegal.find((c) => c.id === "education");
  const stateHealth = stateLegal.find((c) => c.id === "health");

  return (
    <>
      <section className="border-b border-paper-200 bg-white">
        <div className="page flex flex-col gap-5 py-10 sm:py-14 lg:py-[4.5rem]">
          <p className="eyebrow">
            75 municípios e o Governo do Estado · {YEARS[YEARS.length - 1]} a {YEARS[0]}
          </p>
          <h1 className="max-w-[54rem] font-serif text-[2.125rem] leading-[1.06] font-semibold tracking-[-0.02em] text-balance text-ink-900 sm:text-5xl lg:text-display">
            Para onde vai o dinheiro público em Sergipe
          </h1>
          <p className="max-w-[42.5rem] text-[17px] leading-[1.55] text-pretty text-ink-700 sm:text-xl">
            Quanto cada prefeitura previu gastar, quanto pagou de fato, em quê, e como isso se compara com o resto do estado.
            Números oficiais, explicados em linguagem simples.
          </p>
          <div className="mt-2 flex flex-col gap-3.5">
            <MunicipalitySearch
              items={MUNICIPALITIES.map(({ name, slug, territory }) => ({ name, slug, territory }))}
              linkQuery={`?ano=${year}`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-ink-500">Os mais populosos:</span>
              {popular.map((m) => (
                <Link
                  key={m.code}
                  href={`/municipios/${m.slug}?ano=${year}`}
                  className="inline-flex min-h-9 items-center rounded-full border border-brand-200 bg-brand-50 px-3 text-sm font-medium text-brand-700 hover:border-brand-300 hover:bg-brand-100"
                >
                  {m.name}
                </Link>
              ))}
              <Link href={`/municipios?ano=${year}`} className="link ml-1 text-sm">
                ver os 75
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="page flex flex-col gap-14 pt-8 lg:gap-20 lg:pt-10">
        <MapExplorer
          shapes={getMunicipalityShapes()}
          values={map.values}
          legend={map.legend}
          cards={getMunicipalityCards(year, indicator)}
          indicatorLabel={indicator.label}
          year={year}
          title={mapTitle}
          subtitle={`${indicator.description} · ${year}`}
          controls={
            <>
              <FilterForm className="flex-[1_1_15rem] sm:max-w-[21rem]">
                <input type="hidden" name="ano" value={year} />
                <SelectField name="indicador" label="Indicador" value={indicator.id} options={INDICATORS.map((i) => ({ value: i.id, label: i.label }))} />
              </FilterForm>
              <SegmentedLinks
                label="Ano"
                items={[...YEARS].reverse().map((y) => ({ label: String(y), href: `/?indicador=${indicator.id}&ano=${y}`, active: y === year }))}
              />
            </>
          }
          overview={
            <div className="flex flex-col gap-3.5 pt-1">
              <p className="text-xs font-semibold tracking-[0.08em] text-ink-500 uppercase">Sergipe · {year}</p>
              <div className="flex flex-col gap-1">
                <p className="text-[13px] font-semibold text-ink-700">
                  <Term id="mediana">Mediana</Term> dos 75 municípios
                </p>
                <p className="font-serif text-[2.5rem] leading-[1.1] font-semibold tracking-[-0.01em] text-ink-900 tabular-nums">
                  {indicatorMedian == null ? "—" : indicator.format(indicatorMedian)}
                </p>
                <p className="text-sm text-ink-500">{indicator.label.toLowerCase()}</p>
              </div>
              <p className="text-[15px] leading-[23px] text-pretty text-ink-700">
                Passe o mouse (ou toque) sobre um município para ver os números. Clique para fixar a ficha e abrir o raio-x.
              </p>
              <p className="text-sm leading-[21px] text-ink-500">
                Pelo teclado: use{" "}
                <kbd className="rounded border border-b-2 border-paper-300 bg-paper-100 px-1.5 font-mono text-xs font-semibold">Tab</kbd> para
                percorrer os municípios e <kbd className="rounded border border-b-2 border-paper-300 bg-paper-100 px-1.5 font-mono text-xs font-semibold">Enter</kbd> para fixar.
              </p>
              <a
                href="#destaques"
                className="mt-1 flex items-center gap-2.5 rounded-md border border-alert-200 bg-alert-50 px-3 py-2.5 text-sm text-alert-800 hover:bg-alert-100"
              >
                <span aria-hidden className="text-xs text-alert-500">
                  ▲
                </span>
                <span className="flex-1">
                  <strong className="font-semibold">{flaggedCodes.size} municípios</strong> com pontos de atenção
                </span>
                <span aria-hidden>→</span>
              </a>
            </div>
          }
          source={
            <>
              Fonte: SICONFI/Tesouro Nacional, {year}; {mapSource.label}, malha {mapSource.period}. A cor mostra a posição
              relativa, não se o valor é bom ou ruim.{" "}
              <a href={`/dados/municipios?ano=${year}`} className="link">
                Baixar dados (CSV)
              </a>
            </>
          }
        />

        <Section
          id="totais"
          variant="plain"
          eyebrow={`Somando as prefeituras · ${year}`}
          title={`As prefeituras previram gastar ${formatBRLShort(totals.planned)} e pagaram ${formatBRLShort(totals.paid)} em ${year}`}
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KeyFigure
              label={<Term id="orcamento-previsto">Orçamento previsto</Term>}
              value={formatBRLShort(totals.planned)}
              explanation="O que as Câmaras Municipais aprovaram na lei do orçamento (LOA) do ano."
              comparison={`Soma das ${totals.declared} prefeituras que declararam`}
              source={`SICONFI · RREO Anexo 02 · ${year}`}
            />
            <KeyFigure
              label={<Term id="pagamento">Gasto real (pago)</Term>}
              value={formatBRLShort(totals.paid)}
              explanation="O que efetivamente saiu do caixa das prefeituras para pagar as despesas do ano."
              comparison={execution != null && `${formatPercent(execution)} do orçamento atualizado foi pago`}
              source={`SICONFI · DCA Anexo I-E · ${year}`}
            />
            <KeyFigure
              label="Gasto por habitante"
              value={formatBRL(perCapita)}
              explanation="O gasto pago somado, dividido pela população dos municípios que declararam."
              comparison={`Mediana dos municípios: ${formatBRL(median(rows.map((r) => r.paidPerCapita)))}`}
              source={`SICONFI · DCA Anexo I-E · ${year}`}
            />
            {areaTotals[0] && (
              <KeyFigure
                label="Maior área de gasto"
                value={areaTotals[0].name}
                explanation={`De cada R$ 100 pagos pelas prefeituras, R$ ${areaUnits[0]} foram para ${areaTotals[0].name.toLowerCase()}.`}
                comparison={
                  areaTotals.length > 2 &&
                  `Depois vêm ${areaTotals[1].name.toLowerCase()} (R$ ${areaUnits[1]}) e ${areaTotals[2].name.toLowerCase()} (R$ ${areaUnits[2]})`
                }
                source={`SICONFI · DCA Anexo I-E · ${year}`}
              />
            )}
          </div>
        </Section>

        <Section
          id="destaques"
          variant="plain"
          eyebrow={`Pontos de atenção · ${year}`}
          title={`${flaggedCodes.size} dos 75 municípios tiveram ao menos um ponto de atenção em ${year}`}
          description={<InsightDisclaimer />}
        >
          <StateHighlights highlights={getStateHighlights(year)} year={year} missing={missing} />
        </Section>

        <Section
          id="obrigacoes"
          eyebrow={`Obrigações legais · ${year}`}
          title={legalTitle.charAt(0).toUpperCase() + legalTitle.slice(1)}
          description={
            <p className="text-body text-pretty">
              A Constituição fixa quanto, no mínimo, cada prefeitura deve aplicar em educação e saúde. A Lei de
              Responsabilidade Fiscal fixa quanto, no máximo, pode gastar com pessoal, em relação à{" "}
              <Term id="rcl">receita corrente líquida</Term>. Cada ponto abaixo é um município.
            </p>
          }
        >
          {[
            {
              label: "Educação",
              term: "minimo-educacao" as const,
              list: education,
              kind: "minimum" as const,
              ref: 25,
              text: below(education)
                ? `${education.length - below(education)} de ${education.length} cumpriram o mínimo de 25%.`
                : `Os ${education.length} municípios que declararam cumpriram o mínimo de 25%.`,
            },
            {
              label: "Saúde",
              term: "minimo-saude" as const,
              list: health,
              kind: "minimum" as const,
              ref: 15,
              text: below(health)
                ? `${health.length - below(health)} de ${health.length} cumpriram o mínimo de 15%.`
                : `Os ${health.length} municípios que declararam cumpriram o mínimo de 15%.`,
            },
            {
              label: "Pessoal",
              term: "limite-pessoal" as const,
              list: personnel,
              kind: "maximum" as const,
              ref: personnel[0]?.check.threshold ?? 54,
              text: `${personnelOver} de ${personnel.length} passaram do limite (em âmbar); outros ${personnelWarned} estão entre o limite de alerta e o máximo.`,
            },
          ].map((s) =>
            s.list.length === 0 ? null : (
              <div key={s.label} className="grid items-center gap-x-8 gap-y-3 border-t border-paper-200 pt-5 md:grid-cols-[15rem_minmax(0,1fr)]">
                <div className="flex flex-col gap-1">
                  <h3 className="text-[17px] font-semibold text-ink-900">
                    <Term id={s.term}>{s.label}</Term>
                  </h3>
                  <p className="text-[15px] leading-[22px] text-ink-700">{s.text}</p>
                </div>
                <StripPlot
                  points={s.list.map((x) => ({ label: x.label, value: x.check.value! }))}
                  reference={s.ref}
                  referenceLabel={`${s.kind === "minimum" ? "mínimo" : "limite"} ${s.ref}%`}
                  kind={s.kind}
                  format={(v) => formatPoints(v).replace(",0%", "%")}
                  label={`${s.label}: ${s.text}`}
                />
              </div>
            ),
          )}
          <SourceNote>
            SICONFI/Tesouro Nacional: RREO Anexo 14 (educação e saúde, 6º bimestre) e RGF Anexo 01 (pessoal, fim do ano),{" "}
            {year}. Percentuais declarados pelas próprias prefeituras; quem não declarou não aparece no gráfico.
          </SourceNote>
        </Section>

        <Section
          id="territorios"
          variant="plain"
          eyebrow={`Por território de planejamento · ${year}`}
          title={`${topTerritory.name} concentra ${formatPercent(ratio(topTerritory.paid, totals.paid))} do gasto das prefeituras`}
        >
          <div className="hidden md:block">
            <DataTable testId="territory-table" minWidth={760} caption={`Territórios de planejamento, ${year}`}>
              <thead>
                <tr>
                  <Th>Território</Th>
                  <Th align="right">Municípios</Th>
                  <Th align="right">População</Th>
                  <Th align="right">Gasto pago</Th>
                  <Th align="right">Por habitante</Th>
                  <Th align="right">Executado</Th>
                  <Th align="right">Com ponto de atenção</Th>
                </tr>
              </thead>
              <tbody>
                {territories.map((t) => {
                  const members = rows.filter((r) => r.territory === t.name);
                  return (
                    <tr key={t.name}>
                      <Td>
                        <Link href={`/municipios?ano=${year}&territorio=${slugify(t.name)}`} className="font-semibold text-brand-700 hover:underline">
                          {t.name}
                        </Link>
                      </Td>
                      <Td align="right">{t.count}</Td>
                      <Td align="right">{formatInteger(t.population)}</Td>
                      <Td align="right" className="font-medium text-ink-900">{formatBRLShort(t.paid)}</Td>
                      <Td align="right">{formatBRL(t.paidPerCapita)}</Td>
                      <Td align="right">{formatPercent(t.execution)}</Td>
                      <Td align="right">
                        {members.filter((m) => flaggedCodes.has(m.code)).length} de {members.length}
                      </Td>
                    </tr>
                  );
                })}
                <tr className="border-t-2! border-paper-300! bg-paper-100 font-semibold text-ink-900">
                  <Td>Sergipe (75 municípios)</Td>
                  <Td align="right">75</Td>
                  <Td align="right">{formatInteger(rows.reduce((a, r) => a + (r.population ?? 0), 0))}</Td>
                  <Td align="right">{formatBRLShort(totals.paid)}</Td>
                  <Td align="right">{formatBRL(perCapita)}</Td>
                  <Td align="right">{formatPercent(execution)}</Td>
                  <Td align="right">{flaggedCodes.size} de 75</Td>
                </tr>
              </tbody>
            </DataTable>
          </div>
          <ul className="flex flex-col gap-2 md:hidden">
            {territories.map((t) => {
              const members = rows.filter((r) => r.territory === t.name);
              return (
                <li key={t.name}>
                  <Link href={`/municipios?ano=${year}&territorio=${slugify(t.name)}`} className="card block px-4 py-3.5">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-base font-semibold text-brand-700">{t.name}</span>
                      <span className="text-[13px] text-ink-500">{t.count} municípios</span>
                    </span>
                    <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm tabular-nums">
                      <div>
                        <dt className="text-xs text-ink-500">Gasto pago</dt>
                        <dd className="font-semibold text-ink-900">{formatBRLShort(t.paid)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ink-500">Por habitante</dt>
                        <dd className="font-semibold text-ink-900">{formatBRL(t.paidPerCapita)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ink-500">Executado</dt>
                        <dd>{formatPercent(t.execution)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ink-500">Com ponto de atenção</dt>
                        <dd>
                          {members.filter((m) => flaggedCodes.has(m.code)).length} de {members.length}
                        </dd>
                      </div>
                    </dl>
                  </Link>
                </li>
              );
            })}
          </ul>
          <SourceNote>
            SICONFI/Tesouro Nacional (DCA Anexo I-E), {year}. Territórios de planejamento do Decreto estadual nº
            24.338/2007. Gasto por habitante = pago pelos municípios do território ÷ população dos que declararam.
          </SourceNote>
        </Section>

        <section
          aria-labelledby="estado-title"
          className="grid items-center gap-x-10 gap-y-6 rounded-lg border border-brand-200 bg-brand-50 p-5 sm:p-8 lg:grid-cols-2"
        >
          <div className="flex flex-col gap-2.5">
            <p className="eyebrow">Governo do Estado de Sergipe · {year}</p>
            <h2 id="estado-title" className="font-serif text-2xl leading-[1.2] font-semibold text-balance text-ink-900 sm:text-[2rem]">
              {state?.paid == null
                ? `O Governo do Estado não declarou os gastos de ${year}`
                : `O Estado pagou ${formatBRLShort(state.paid)}, num orçamento separado do das prefeituras`}
            </h2>
            <p className="text-base leading-[25px] text-pretty text-ink-700">
              Segurança pública, ensino médio, hospitais regionais e estradas estaduais são responsabilidade do Governo do
              Estado, e não das prefeituras.
            </p>
            <Link href={`/estado?ano=${year}`} className="btn btn-primary mt-1.5 self-start">
              Ver raio-x do Estado →
            </Link>
          </div>
          <dl className="grid gap-3 sm:grid-cols-3">
            {[statePersonnel, stateEducation, stateHealth].map(
              (c) =>
                c && (
                  <div key={c.id} className="flex flex-col gap-1 rounded-lg border border-brand-200 bg-white p-3.5">
                    <dt className="text-[13px] font-semibold text-ink-700">{c.label}</dt>
                    <dd className="font-serif text-[1.75rem] font-semibold text-ink-900 tabular-nums">
                      {c.value == null ? <span className="text-base font-normal text-ink-500 italic">não declarado</span> : formatPoints(c.value)}
                    </dd>
                    <dd className="text-[13px] text-ink-500">
                      {c.threshold == null ? "" : `${c.kind === "minimum" ? "mínimo" : "limite"} ${formatPoints(c.threshold)}`}
                      {c.status !== "ok" && c.status !== "unknown" && (
                        <span className="font-semibold text-alert-700">
                          {" "}
                          · ▲ {c.status === "fail" ? (c.kind === "minimum" ? "abaixo do mínimo" : "acima do limite") : c.status === "prudential" ? "acima do prudencial" : "acima do alerta"}
                        </span>
                      )}
                    </dd>
                  </div>
                ),
            )}
          </dl>
        </section>
      </div>
    </>
  );
}
