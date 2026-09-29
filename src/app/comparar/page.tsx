import type { Metadata } from "next";
import Link from "next/link";
import { DataTable, Td, Th } from "@/components/ui/DataTable";
import FilterForm from "@/components/ui/FilterForm";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import SelectField from "@/components/ui/SelectField";
import Term from "@/components/ui/Term";
import BudgetSource from "@/features/budget/components/BudgetSource";
import { FUNCTIONS, getEntityYear, parseYear } from "@/features/budget/data";
import { getMunicipalityRows, type MunicipalityRow, ratio } from "@/features/budget/metrics";
import { yearOptions } from "@/features/budget/options";
import { getInsights } from "@/features/insights/rules";
import { getLegalChecks } from "@/features/legal/checks";
import { getMunicipalityBySlug, MUNICIPALITIES } from "@/features/municipalities/registry";
import { formatBRL, formatBRLShort, formatInteger, formatPercent } from "@/lib/format";
import type { GlossaryId } from "@/lib/glossary";

export const metadata: Metadata = { title: "Comparar municípios" };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

type Line = { label: string; term?: GlossaryId; a: string; b: string; bar?: [number | null, number | null] };

function lines(ra: MunicipalityRow, rb: MunicipalityRow, year: number): Line[] {
  const ea = getEntityYear(ra.code, year);
  const eb = getEntityYear(rb.code, year);
  const la = Object.fromEntries(getLegalChecks(ra.code, year).map((c) => [c.id, c.value]));
  const lb = Object.fromEntries(getLegalChecks(rb.code, year).map((c) => [c.id, c.value]));
  const pct = (v: number | null | undefined) => (v == null ? "—" : `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`);

  return [
    { label: "Território", a: ra.territory, b: rb.territory },
    { label: "Porte", a: ra.sizeClass?.label ?? "—", b: rb.sizeClass?.label ?? "—" },
    { label: "População", a: formatInteger(ra.population), b: formatInteger(rb.population), bar: [ra.population, rb.population] },
    { label: "Receita do ano", a: formatBRLShort(ea?.revenue?.total), b: formatBRLShort(eb?.revenue?.total) },
    { label: "Receita por habitante", a: formatBRL(ra.revenuePerCapita), b: formatBRL(rb.revenuePerCapita), bar: [ra.revenuePerCapita, rb.revenuePerCapita] },
    { label: "Royalties na receita", term: "royalties", a: formatPercent(ratio(ea?.revenue?.sources.royalties, ea?.revenue?.total)), b: formatPercent(ratio(eb?.revenue?.sources.royalties, eb?.revenue?.total)) },
    { label: "Orçamento previsto", term: "orcamento-previsto", a: formatBRLShort(ra.planned), b: formatBRLShort(rb.planned) },
    { label: "Gasto pago", term: "pagamento", a: formatBRLShort(ra.paid), b: formatBRLShort(rb.paid) },
    { label: "Gasto por habitante", a: formatBRL(ra.paidPerCapita), b: formatBRL(rb.paidPerCapita), bar: [ra.paidPerCapita, rb.paidPerCapita] },
    { label: "Orçamento executado", term: "execucao", a: formatPercent(ra.execution), b: formatPercent(rb.execution), bar: [ra.execution, rb.execution] },
    { label: "Educação (mínimo 25%)", term: "minimo-educacao", a: pct(la.education), b: pct(lb.education) },
    { label: "Saúde (mínimo 15%)", term: "minimo-saude", a: pct(la.health), b: pct(lb.health) },
    { label: "Pessoal (limite 54% da RCL)", term: "limite-pessoal", a: pct(la.personnel), b: pct(lb.personnel) },
    { label: "Pontos de atenção", term: "ponto-de-atencao", a: String(getInsights(ra.code, year).length), b: String(getInsights(rb.code, year).length) },
  ];
}

function Bars({ values }: { values: [number | null, number | null] }) {
  const max = Math.max(values[0] ?? 0, values[1] ?? 0, 1);
  return (
    <div className="mt-1.5 grid grid-cols-2 gap-3" aria-hidden>
      {values.map((v, i) => (
        <div key={i} className="h-1.5 rounded-full bg-paper-200">
          <div className={`h-full rounded-full ${i === 0 ? "bg-brand-500" : "bg-alert-500"}`} style={{ width: `${((v ?? 0) / max) * 100}%` }} />
        </div>
      ))}
    </div>
  );
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

  const ea = getEntityYear(a.code, year);
  const eb = getEntityYear(b.code, year);
  const areas = [...new Set([...Object.keys(ea?.byFunction ?? {}), ...Object.keys(eb?.byFunction ?? {})])]
    .map((fn) => ({
      fn,
      a: ratio(ea?.byFunction[fn]?.paid ?? 0, ea?.population),
      b: ratio(eb?.byFunction[fn]?.paid ?? 0, eb?.population),
    }))
    .filter((x) => (x.a ?? 0) > 0 || (x.b ?? 0) > 0)
    .sort((x, y) => Math.max(y.a ?? 0, y.b ?? 0) - Math.max(x.a ?? 0, x.b ?? 0));

  return (
    <>
      <PageHeader
        eyebrow="Comparar"
        title={`${a.name} × ${b.name}`}
        description={<p>Os principais números de dois municípios lado a lado. Para comparar tamanhos diferentes, olhe os valores por habitante.</p>}
      />

      <FilterForm className="grid gap-4 rounded-lg border border-paper-200 bg-white p-5 sm:grid-cols-3">
        <SelectField name="a" label="Município A" value={a.slug} options={options} />
        <SelectField name="b" label="Município B" value={b.slug} options={options} />
        <SelectField name="ano" label="Ano" value={String(year)} options={yearOptions()} />
      </FilterForm>

      <Section id="indicadores" title="Indicadores principais">
        <DataTable minWidth={560} testId="compare-table">
          <thead>
            <tr>
              <Th className="w-1/3">Indicador</Th>
              <Th>
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-brand-500" />{a.name}</span>
              </Th>
              <Th>
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-alert-500" />{b.name}</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {lines(ra, rb, year).map((l) => (
              <tr key={l.label}>
                <Td className="text-ink-700">{l.term ? <Term id={l.term}>{l.label}</Term> : l.label}</Td>
                <Td colSpan={2}>
                  <div className="grid grid-cols-2 gap-3 font-semibold tabular-nums text-ink-900">
                    <span>{l.a}</span>
                    <span>{l.b}</span>
                  </div>
                  {l.bar && <Bars values={l.bar} />}
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </Section>

      <Section id="areas" title="Gasto por habitante em cada área">
        <DataTable minWidth={560}>
          <thead>
            <tr>
              <Th className="w-1/3">Área</Th>
              <Th>{a.name}</Th>
              <Th>{b.name}</Th>
            </tr>
          </thead>
          <tbody>
            {areas.map((x) => (
              <tr key={x.fn}>
                <Td className="text-ink-700">{FUNCTIONS[x.fn]}</Td>
                <Td colSpan={2}>
                  <div className="grid grid-cols-2 gap-3 font-semibold tabular-nums">
                    <span>{formatBRL(x.a)}</span>
                    <span>{formatBRL(x.b)}</span>
                  </div>
                  <Bars values={[x.a, x.b]} />
                </Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
        <BudgetSource year={year} />
      </Section>

      <p className="mt-6 text-sm text-ink-700">
        Ver raio-x completo:{" "}
        <Link href={`/municipios/${a.slug}?ano=${year}`} className="text-brand-700 hover:underline">{a.name}</Link> ·{" "}
        <Link href={`/municipios/${b.slug}?ano=${year}`} className="text-brand-700 hover:underline">{b.name}</Link>
      </p>
    </>
  );
}
