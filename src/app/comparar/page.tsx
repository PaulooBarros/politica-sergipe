import type { Metadata } from "next";
import Link from "next/link";
import RangeDots, { MarkerSwatch } from "@/components/charts/RangeDots";
import StackedBar from "@/components/charts/StackedBar";
import { WAFFLE_COLORS, WAFFLE_OTHER } from "@/components/charts/Waffle";
import { DataTable, Td, Th } from "@/components/ui/DataTable";
import FilterForm from "@/components/ui/FilterForm";
import PageHeader from "@/components/ui/PageHeader";
import { SectionTitle } from "@/components/ui/Section";
import SelectField from "@/components/ui/SelectField";
import SourceNote from "@/components/ui/SourceNote";
import { FUNCTIONS, getEntityYear, parseYear } from "@/features/budget/data";
import { getAreaRows, getMunicipalityRows, ratio } from "@/features/budget/metrics";
import { yearOptions } from "@/features/budget/options";
import { type Distribution, getDistributions } from "@/features/budget/peers";
import { getInsights } from "@/features/insights/rules";
import { getMunicipalityBySlug, MUNICIPALITIES } from "@/features/municipalities/registry";
import { formatBRL, formatBRLCompact, formatInteger } from "@/lib/format";
import { toHundred } from "@/lib/hundred";

export const metadata: Metadata = { title: "Comparar municípios" };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const short = (name: string) => (name.length > 16 ? name.split(" ")[0] : name);

/** Plain sentence on the gap between two values of one indicator. */
function gapText(d: Distribution, a: number | null, b: number | null, nameA: string, nameB: string) {
  if (a == null || b == null) return "Um dos municípios não declarou este dado.";
  const hi = a >= b ? nameA : nameB;
  if (d.kind === "brl") {
    const pct = Math.round((Math.max(a, b) / Math.min(a, b) - 1) * 100);
    return pct < 3 ? "Praticamente iguais." : `${hi}: ${pct}% a mais.`;
  }
  const pts = Math.abs(a - b) * (d.kind === "ratio" ? 100 : 1);
  if (pts < 0.5) return "Praticamente iguais.";
  return `${hi}: ${pts.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ${pts >= 2 ? "pontos percentuais" : "ponto percentual"} a mais.`;
}

export default async function ComparePage({ searchParams }: PageProps<"/comparar">) {
  const query = await searchParams;
  const year = parseYear(query.ano);
  const a = getMunicipalityBySlug(first(query.a)) ?? getMunicipalityBySlug("aracaju")!;
  const b = getMunicipalityBySlug(first(query.b)) ?? getMunicipalityBySlug("nossa-senhora-do-socorro")!;
  const rows = getMunicipalityRows(year);
  const ra = rows.find((r) => r.code === a.code)!;
  const rb = rows.find((r) => r.code === b.code)!;
  const options = MUNICIPALITIES.map((m) => ({ value: m.slug, label: m.name }));
  const da = getDistributions(a.code, year);
  const db = getDistributions(b.code, year);
  const [sa, sb] = [short(a.name), short(b.name)];

  // Lead sentence
  const popGap = ra.population && rb.population ? Math.abs(ra.population - rb.population) / Math.max(ra.population, rb.population) : null;
  const pcRatio = ratio(ra.paidPerCapita, rb.paidPerCapita);
  const spendText =
    pcRatio == null
      ? "um deles não declarou o gasto do ano"
      : Math.abs(pcRatio - 1) < 0.03
        ? "gastaram praticamente o mesmo por habitante"
        : `${pcRatio > 1 ? a.name : b.name} pagou ${Math.round((Math.max(pcRatio, 1 / pcRatio) - 1) * 100)}% a mais por habitante`;
  const lede = `${a.name} e ${b.name} têm ${popGap == null ? "populações" : popGap < 0.15 ? "população parecida" : "portes diferentes"}. Em ${year}, ${spendText}.`;

  // "De cada R$ 100": categories of A's top areas, applied to both for a fair comparison.
  const areasA = getAreaRows(a.code, year, false);
  const areasB = getAreaRows(b.code, year, false);
  const cats = areasA.slice(0, 4).map((r) => r.code);
  const split = (areas: typeof areasA) => {
    const shares = cats.map((c) => areas.find((r) => r.code === c)?.share ?? 0);
    const units = toHundred([...shares, Math.max(0, 1 - shares.reduce((x, y) => x + y, 0))]);
    return units.map((u, i) => ({
      label: i < cats.length ? FUNCTIONS[cats[i]] : "Outras áreas",
      units: u,
      color: i < cats.length ? WAFFLE_COLORS[i] : WAFFLE_OTHER,
      dark: i < 2,
    }));
  };
  const hasSpending = areasA.length > 0 && areasB.length > 0;

  const perCapitaAreas = [...new Set([...areasA.map((r) => r.code), ...areasB.map((r) => r.code)])]
    .map((fn) => ({
      fn,
      a: areasA.find((r) => r.code === fn)?.paidPerCapita ?? 0,
      b: areasB.find((r) => r.code === fn)?.paidPerCapita ?? 0,
    }))
    .sort((x, y) => Math.max(y.a, y.b) - Math.max(x.a, x.b));

  const card = (m: typeof a, r: typeof ra, shape: "dot" | "diamond") => {
    const n = getInsights(m.code, year).length;
    return (
      <article className="card flex flex-col gap-3.5 p-5">
        <div className="flex items-center gap-2.5">
          <MarkerSwatch shape={shape} />
          <div>
            <h2 className="font-serif text-2xl leading-tight font-semibold text-ink-900">{m.name}</h2>
            <p className="text-sm text-ink-500">
              {m.territory} · {formatInteger(r.population)} habitantes
            </p>
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-3 border-t border-paper-200 pt-3.5">
          {[
            ["Gasto pago", r.paid == null ? "não declarado" : formatBRLCompact(r.paid)],
            ["Por habitante", r.paidPerCapita == null ? "—" : formatBRL(r.paidPerCapita)],
            ["Pontos de atenção", r.paid == null ? "—" : n ? `▲ ${n}` : "Nenhum"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[13px] text-ink-500">{label}</dt>
              <dd className="mt-0.5 font-serif text-xl font-semibold text-ink-900 tabular-nums sm:text-[1.5rem]">{value}</dd>
            </div>
          ))}
        </dl>
        <Link href={`/municipios/${m.slug}?ano=${year}`} className="text-[15px] font-semibold text-brand-700 hover:underline">
          Abrir raio-x de {m.name} →
        </Link>
      </article>
    );
  };

  return (
    <>
      <PageHeader breadcrumb={[{ label: "Início", href: "/" }, { label: "Comparar" }]} title="Comparar dois municípios">
        <FilterForm className="mt-1 flex flex-wrap items-end gap-3">
          <div className="flex min-w-0 flex-[1_1_16rem] items-end gap-2 sm:max-w-sm">
            <span className="mb-4"><MarkerSwatch shape="dot" /></span>
            <SelectField name="a" label="Município 1" value={a.slug} options={options} className="flex-1" />
          </div>
          <div className="flex min-w-0 flex-[1_1_16rem] items-end gap-2 sm:max-w-sm">
            <span className="mb-4"><MarkerSwatch shape="diamond" /></span>
            <SelectField name="b" label="Município 2" value={b.slug} options={options} className="flex-1" />
          </div>
          <SelectField name="ano" label="Ano" value={String(year)} options={yearOptions()} className="w-28" />
          <Link href={`/comparar?a=${b.slug}&b=${a.slug}&ano=${year}`} scroll={false} className="btn btn-secondary">
            ⇄ Trocar
          </Link>
        </FilterForm>
      </PageHeader>

      <div className="page flex flex-col gap-5 pt-6 lg:pt-8">
        <p className="max-w-[54rem] font-serif text-xl leading-[1.45] text-pretty text-ink-900 sm:text-[1.625rem]">{lede}</p>

        <div className="grid gap-4 md:grid-cols-2">
          {card(a, ra, "dot")}
          {card(b, rb, "diamond")}
        </div>

        <section aria-labelledby="indicadores" className="card flex flex-col gap-2 p-5 sm:p-8" data-testid="compare-table">
          <SectionTitle id="indicadores">Indicador por indicador</SectionTitle>
          <ul aria-label="Legenda" className="mt-2 mb-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-700">
            <li className="flex items-center gap-2">
              <MarkerSwatch shape="dot" /> {a.name}
            </li>
            <li className="flex items-center gap-2">
              <MarkerSwatch shape="diamond" /> {b.name}
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-[18px] border-l-2 border-dashed border-ink-700" aria-hidden /> Limite legal ou mediana de Sergipe
            </li>
          </ul>
          {da.map((d, i) => {
            const vb = db[i]?.value ?? null;
            const ref = d.legal ?? (d.stateMedian == null ? undefined : { value: d.stateMedian, label: "mediana SE" });
            return (
              <div key={d.id} className="grid items-center gap-x-8 gap-y-2 border-t border-paper-200 py-4 md:grid-cols-[15rem_minmax(0,1fr)]">
                <div>
                  <h3 className="text-base font-semibold text-ink-900">{d.label}</h3>
                  <p className="text-sm text-ink-700">{gapText(d, d.value, vb, sa, sb)}</p>
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <RangeDots
                    all={d.all}
                    markers={[
                      { value: d.value, label: `${a.name}: ${d.format(d.value)}`, shape: "dot" },
                      { value: vb, label: `${b.name}: ${d.format(vb)}`, shape: "diamond" },
                    ]}
                    labelledReference={ref}
                    label={`${d.label}: ${a.name} ${d.format(d.value)}, ${b.name} ${d.format(vb)}`}
                  />
                  <p className="flex flex-wrap justify-between gap-3 text-sm tabular-nums">
                    <span>
                      <strong className="font-semibold text-brand-700">{d.format(d.value)}</strong> {sa}
                    </span>
                    <span>
                      <strong className="font-semibold text-ink-900">{d.format(vb)}</strong> {sb}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
          <SourceNote className="mt-2">
            SICONFI/Tesouro Nacional (DCA, RREO e RGF), {year}. Os tracinhos cinza são os 75 municípios; a escala de cada linha
            vai do menor ao maior valor entre eles.
          </SourceNote>
        </section>

        {hasSpending && (
          <section aria-labelledby="cem" className="card flex flex-col gap-5 p-5 sm:p-8">
            <SectionTitle id="cem">De cada R$ 100 gastos</SectionTitle>
            {[
              { m: a, parts: split(areasA) },
              { m: b, parts: split(areasB) },
            ].map(({ m, parts }) => (
              <div key={m.code} className="flex flex-col gap-2">
                <p className="text-[15px] font-semibold text-ink-900">{m.name}</p>
                <StackedBar parts={parts} label={`${m.name}: ${parts.map((p) => `R$ ${p.units} ${p.label}`).join(", ")}`} />
              </div>
            ))}
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              {split(areasA).map((p) => (
                <li key={p.label} className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-[2px] ${p.color} ${p.color === WAFFLE_OTHER ? "shadow-[inset_0_0_0_1px_var(--color-paper-300)]" : ""}`} aria-hidden />
                  {p.label}
                </li>
              ))}
            </ul>
            <details className="group rounded-lg border border-paper-200">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-[15px] font-semibold text-brand-700 hover:bg-brand-50">
                Ver gasto por habitante em cada área
                <span aria-hidden className="transition-transform group-open:rotate-180">▾</span>
              </summary>
              <div className="border-t border-paper-200 p-3 sm:p-4">
                <DataTable minWidth={520} caption="Gasto por habitante em cada área">
                  <thead>
                    <tr>
                      <Th>Área</Th>
                      <Th align="right">{a.name}</Th>
                      <Th align="right">{b.name}</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {perCapitaAreas.map((x) => (
                      <tr key={x.fn}>
                        <Td>{FUNCTIONS[x.fn]}</Td>
                        <Td align="right" className="font-medium text-ink-900">{formatBRL(x.a)}</Td>
                        <Td align="right" className="font-medium text-ink-900">{formatBRL(x.b)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              </div>
            </details>
            <SourceNote>SICONFI/Tesouro Nacional, DCA Anexo I-E (despesa paga por função), {year}.</SourceNote>
          </section>
        )}
        {getEntityYear(a.code, year) == null || getEntityYear(b.code, year) == null ? (
          <p className="text-sm text-ink-500">Um dos municípios não tem dados declarados para {year}.</p>
        ) : null}
      </div>
    </>
  );
}
