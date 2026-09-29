import type { Metadata } from "next";
import Link from "next/link";
import ProgressBar from "@/components/charts/ProgressBar";
import { DataTable, Td, Th } from "@/components/ui/DataTable";
import FilterForm from "@/components/ui/FilterForm";
import PageHeader from "@/components/ui/PageHeader";
import SelectField from "@/components/ui/SelectField";
import BudgetSource from "@/features/budget/components/BudgetSource";
import { FUNCTIONS, parseArea, parseYear } from "@/features/budget/data";
import { getMunicipalityRows, medianPerCapita, type MunicipalityRow } from "@/features/budget/metrics";
import { areaOptions, yearOptions } from "@/features/budget/options";
import { getInsights } from "@/features/insights/rules";
import { SIZE_CLASSES, TERRITORIES } from "@/features/municipalities/registry";
import { formatBRL, formatInteger, formatPercent } from "@/lib/format";
import { slugify } from "@/lib/slug";

export const metadata: Metadata = { title: "Municípios" };

type Row = MunicipalityRow & { insightCount: number };

const desc = (pick: (r: Row) => number | null) => (a: Row, b: Row) => (pick(b) ?? -1) - (pick(a) ?? -1);

const SORTS = {
  nome: { label: "Município", align: "left", compare: (a: Row, b: Row) => a.name.localeCompare(b.name, "pt-BR") },
  populacao: { label: "População", align: "right", compare: desc((r) => r.population) },
  receita: { label: "Receita/hab.", align: "right", compare: desc((r) => r.revenuePerCapita) },
  gasto: { label: "Gasto/hab.", align: "right", compare: desc((r) => r.paidPerCapita) },
  execucao: { label: "Executado", align: "right", compare: desc((r) => r.execution) },
  atencao: { label: "Pontos de atenção", align: "right", compare: desc((r) => r.insightCount) },
} as const;
type SortKey = keyof typeof SORTS;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function MunicipalitiesPage({ searchParams }: PageProps<"/municipios">) {
  const query = await searchParams;
  const year = parseYear(query.ano);
  const area = parseArea(query.area);
  const territorySlug = first(query.territorio);
  const territory = TERRITORIES.find((t) => slugify(t) === territorySlug) ?? null;
  const size = SIZE_CLASSES.find((c) => c.id === first(query.porte)) ?? null;
  const onlyFlagged = first(query.atencao) === "sim";
  const search = first(query.q).trim();
  const sortKey: SortKey = first(query.ordem) in SORTS ? (first(query.ordem) as SortKey) : "nome";

  const normalizedSearch = slugify(search);
  const allRows: Row[] = getMunicipalityRows(year, area).map((r) => ({
    ...r,
    // Revenue is not split by area, so it only makes sense for the whole budget.
    revenuePerCapita: area ? null : r.revenuePerCapita,
    insightCount: getInsights(r.code, year).length,
  }));
  const rows = allRows
    .filter((r) => !territory || r.territory === territory)
    .filter((r) => !size || r.sizeClass?.id === size.id)
    .filter((r) => !onlyFlagged || r.insightCount > 0)
    .filter((r) => !normalizedSearch || r.slug.includes(normalizedSearch))
    .sort(SORTS[sortKey].compare);

  const stateMedian = medianPerCapita(allRows);
  const areaLabel = area ? FUNCTIONS[area] : null;

  const params = {
    ano: String(year),
    area: area ?? "",
    territorio: territory ? territorySlug : "",
    porte: size?.id ?? "",
    atencao: onlyFlagged ? "sim" : "",
    q: search,
  };
  const sortHref = (key: SortKey) =>
    `/municipios?${new URLSearchParams(Object.entries({ ...params, ordem: key }).filter(([, v]) => v))}`;
  const hasFilters = Boolean(area || territory || size || search || onlyFlagged);

  return (
    <>
      <PageHeader
        eyebrow="Os 75 municípios"
        title="Compare os municípios"
        description={
          <p>
            Receita, gasto, execução do orçamento e pontos de atenção de cada prefeitura. Filtre por território, porte ou
            área e ordene por qualquer coluna.
          </p>
        }
      />

      <FilterForm className="grid gap-4 rounded-lg border border-paper-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-6">
        <input type="hidden" name="ordem" value={sortKey} />
        <SelectField name="ano" label="Ano" value={String(year)} options={yearOptions()} />
        <SelectField
          name="territorio"
          label="Território"
          value={territory ? territorySlug : ""}
          options={[{ value: "", label: "Todos" }, ...TERRITORIES.map((t) => ({ value: slugify(t), label: t }))]}
        />
        <SelectField
          name="porte"
          label="Porte"
          value={size?.id ?? ""}
          options={[{ value: "", label: "Todos" }, ...SIZE_CLASSES.map((c) => ({ value: c.id, label: c.label }))]}
        />
        <SelectField name="area" label="Área de gasto" value={area ?? ""} options={areaOptions("Orçamento inteiro")} />
        <SelectField
          name="atencao"
          label="Pontos de atenção"
          value={onlyFlagged ? "sim" : ""}
          options={[
            { value: "", label: "Todos os municípios" },
            { value: "sim", label: "Só com pontos de atenção" },
          ]}
        />
        <label className="flex flex-col gap-1 text-sm text-ink-700">
          <span className="font-medium">Buscar por nome</span>
          <span className="flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={search}
              key={search}
              placeholder="Ex.: Lagarto"
              className="w-full min-w-0 rounded-sm border border-paper-300 bg-paper-50 px-3 py-2 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <button type="submit" className="rounded-md bg-brand-700 px-3 py-2 font-medium text-white hover:bg-brand-800">
              Buscar
            </button>
          </span>
        </label>
      </FilterForm>

      <div className="mt-6 mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-ink-700" data-testid="result-count">
          <strong className="text-ink-900">{rows.length}</strong> {rows.length === 1 ? "município" : "municípios"}
          {areaLabel && (
            <>
              {" "}· gastos em <strong className="text-ink-900">{areaLabel}</strong>
            </>
          )}{" "}
          · {year}
        </p>
        <p className="text-sm text-ink-500">
          Mediana de Sergipe: <strong className="text-ink-900">{formatBRL(stateMedian)}</strong> de gasto por habitante
          {areaLabel ? ` em ${areaLabel}` : ""}
          {hasFilters && (
            <>
              {" "}·{" "}
              <Link href={`/municipios?ano=${year}`} className="text-brand-700 underline underline-offset-2">
                limpar filtros
              </Link>
            </>
          )}
        </p>
      </div>

      <DataTable testId="municipality-table" minWidth={880}>
        <thead>
          <tr>
            {(Object.keys(SORTS) as SortKey[]).map((key) => (
              <Th key={key} align={SORTS[key].align}>
                <Link
                  href={sortHref(key)}
                  scroll={false}
                  aria-sort={sortKey === key ? (key === "nome" ? "ascending" : "descending") : undefined}
                  className={`hover:text-brand-700 ${sortKey === key ? "text-ink-900" : ""}`}
                >
                  {SORTS[key].label}
                  <span aria-hidden className={sortKey === key ? "" : "opacity-0"}> {key === "nome" ? "↑" : "↓"}</span>
                </Link>
              </Th>
            ))}
            <Th>Território</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code} className="hover:bg-paper-200/40">
              <Td>
                <Link
                  href={`/municipios/${r.slug}?ano=${year}${area ? `&area=${area}#evolucao` : ""}`}
                  className="font-semibold text-brand-800 hover:underline"
                >
                  {r.name}
                </Link>
              </Td>
              <Td align="right">{formatInteger(r.population)}</Td>
              <Td align="right" className="text-ink-700">{area ? "—" : formatBRL(r.revenuePerCapita)}</Td>
              <Td align="right" className="font-semibold">{formatBRL(r.paidPerCapita)}</Td>
              <Td align="right">
                <div className="ml-auto flex max-w-32 items-center justify-end gap-2">
                  <div className="w-14">
                    <ProgressBar ratio={r.execution} label={`${formatPercent(r.execution)} executado`} />
                  </div>
                  <span className="w-12">{formatPercent(r.execution)}</span>
                </div>
              </Td>
              <Td align="right">
                {r.insightCount > 0 ? (
                  <Link
                    href={`/municipios/${r.slug}?ano=${year}#atencao`}
                    className="inline-block min-w-7 rounded-full bg-alert-100 px-2 text-center font-semibold text-alert-800 hover:bg-alert-200"
                  >
                    {r.insightCount}
                  </Link>
                ) : (
                  <span className="text-ink-500">—</span>
                )}
              </Td>
              <Td className="text-ink-700">{r.territory}</Td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="py-8 text-center text-ink-500">
                Nenhum município corresponde aos filtros.
              </td>
            </tr>
          )}
        </tbody>
      </DataTable>
      <BudgetSource year={year} />
    </>
  );
}
