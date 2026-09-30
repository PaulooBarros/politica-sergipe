import type { Metadata } from "next";
import Link from "next/link";
import ProgressBar from "@/components/charts/ProgressBar";
import CollapsibleFilters from "@/components/ui/CollapsibleFilters";
import { DataTable, Td, Th } from "@/components/ui/DataTable";
import FilterForm from "@/components/ui/FilterForm";
import { DownloadIcon, SearchIcon } from "@/components/ui/Icons";
import NotDeclared from "@/components/ui/NotDeclared";
import PageHeader from "@/components/ui/PageHeader";
import { SegmentedRadio } from "@/components/ui/Segmented";
import SelectField from "@/components/ui/SelectField";
import SourceNote from "@/components/ui/SourceNote";
import { FUNCTIONS, parseArea, parseYear } from "@/features/budget/data";
import { getMunicipalityRows, medianPerCapita, type MunicipalityRow } from "@/features/budget/metrics";
import { areaOptions, yearOptions } from "@/features/budget/options";
import { getInsights } from "@/features/insights/rules";
import { getLegalChecks } from "@/features/legal/checks";
import { SIZE_CLASSES, TERRITORIES } from "@/features/municipalities/registry";
import { formatBRL, formatBRLCompact, formatInteger, formatPercent, formatPoints } from "@/lib/format";
import { slugify } from "@/lib/slug";

export const metadata: Metadata = { title: "Municípios" };

type Row = MunicipalityRow & { insightCount: number; personnel: number | null; personnelOver: boolean };

const SORTS: Record<string, { label: string; pick: ((r: Row) => number | null) | null; firstDir: "asc" | "desc" }> = {
  nome: { label: "Município", pick: null, firstDir: "asc" },
  populacao: { label: "População", pick: (r) => r.population, firstDir: "desc" },
  pago: { label: "Gasto pago", pick: (r) => r.paid, firstDir: "desc" },
  gasto: { label: "Por habitante", pick: (r) => r.paidPerCapita, firstDir: "desc" },
  receita: { label: "Receita/hab.", pick: (r) => r.revenuePerCapita, firstDir: "desc" },
  execucao: { label: "Executado", pick: (r) => r.execution, firstDir: "desc" },
  pessoal: { label: "Pessoal", pick: (r) => r.personnel, firstDir: "desc" },
  atencao: { label: "Atenção", pick: (r) => (r.paid == null ? null : r.insightCount), firstDir: "desc" },
};
type SortKey = keyof typeof SORTS;

/** Sorts by the chosen column; missing values always go last, whatever the direction. */
function sortRows(rows: Row[], key: SortKey, dir: string) {
  const sign = dir === "asc" ? 1 : -1;
  const pick = SORTS[key].pick;
  return [...rows].sort((a, b) => {
    if (!pick) return sign * a.name.localeCompare(b.name, "pt-BR");
    const va = pick(a);
    const vb = pick(b);
    if (va == null) return vb == null ? 0 : 1;
    if (vb == null) return -1;
    return sign * (va - vb) || a.name.localeCompare(b.name, "pt-BR");
  });
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

function AttentionTag({ row }: { row: Row }) {
  if (row.paid == null) return <NotDeclared label="não declarou" />;
  if (row.insightCount === 0) return <span className="text-[13px] text-ink-500">Nenhum</span>;
  return (
    <span className="rounded border border-alert-200 bg-alert-50 px-2 py-0.5 text-[13px] font-semibold whitespace-nowrap text-alert-800">
      <span aria-hidden className="text-[10px] text-alert-500">▲</span> {row.insightCount}
      <span className="sr-only"> {row.insightCount === 1 ? "ponto" : "pontos"} de atenção</span>
    </span>
  );
}

function Personnel({ row }: { row: Row }) {
  if (row.personnel == null) return <span className="text-sm text-ink-500 italic">não declarado</span>;
  return (
    <span className={row.personnelOver ? "font-semibold text-alert-800" : undefined}>
      {row.personnelOver && <span aria-hidden className="mr-1 text-[10px] text-alert-500">▲</span>}
      {formatPoints(row.personnel)}
    </span>
  );
}

export default async function MunicipalitiesPage({ searchParams }: PageProps<"/municipios">) {
  const query = await searchParams;
  const year = parseYear(query.ano);
  const area = parseArea(query.area);
  const territorySlug = first(query.territorio);
  const territory = TERRITORIES.find((t) => slugify(t) === territorySlug) ?? null;
  const size = SIZE_CLASSES.find((c) => c.id === first(query.porte)) ?? null;
  const attention = ["sim", "nao"].includes(first(query.atencao)) ? first(query.atencao) : "";
  const search = first(query.q).trim();
  const sortKey: SortKey = Object.hasOwn(SORTS, first(query.ordem)) ? first(query.ordem) : "nome";
  const dir = first(query.dir) === "asc" || first(query.dir) === "desc" ? first(query.dir) : SORTS[sortKey].firstDir;

  const normalizedSearch = slugify(search);
  const allRows: Row[] = getMunicipalityRows(year, area).map((r) => {
    const personnel = getLegalChecks(r.code, year).find((c) => c.id === "personnel");
    return {
      ...r,
      // Revenue is not split by area, so it only makes sense for the whole budget.
      revenuePerCapita: area ? null : r.revenuePerCapita,
      insightCount: getInsights(r.code, year).length,
      personnel: personnel?.value ?? null,
      personnelOver: personnel?.status === "fail",
    };
  });
  const filtered = allRows
    .filter((r) => !territory || r.territory === territory)
    .filter((r) => !size || r.sizeClass?.id === size.id)
    .filter((r) => (attention === "sim" ? r.insightCount > 0 : attention === "nao" ? r.insightCount === 0 && r.paid != null : true))
    .filter((r) => !normalizedSearch || r.slug.includes(normalizedSearch));
  const rows = sortRows(filtered, sortKey, dir);

  const stateMedian = medianPerCapita(allRows);
  const areaLabel = area ? FUNCTIONS[area] : null;

  const params: Record<string, string> = {
    ano: String(year),
    area: area ?? "",
    territorio: territory ? territorySlug : "",
    porte: size?.id ?? "",
    atencao: attention,
    q: search,
  };
  const hrefWith = (changes: Record<string, string>) =>
    `/municipios?${new URLSearchParams(Object.entries({ ...params, ordem: sortKey, dir, ...changes }).filter(([, v]) => v))}`;
  const sortHref = (key: SortKey) =>
    hrefWith({ ordem: key, dir: key === sortKey ? (dir === "asc" ? "desc" : "asc") : SORTS[key].firstDir });

  const chips = [
    search && { label: `“${search}”`, href: hrefWith({ q: "" }) },
    territory && { label: territory, href: hrefWith({ territorio: "" }) },
    size && { label: size.label, href: hrefWith({ porte: "" }) },
    areaLabel && { label: `Área: ${areaLabel}`, href: hrefWith({ area: "" }) },
    attention && { label: attention === "sim" ? "Com pontos de atenção" : "Sem pontos de atenção", href: hrefWith({ atencao: "" }) },
  ].filter((c): c is { label: string; href: string } => Boolean(c));

  const columns: SortKey[] = ["nome", "populacao", "pago", "gasto", ...(area ? [] : (["receita"] as SortKey[])), "execucao", "pessoal", "atencao"];

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Início", href: "/" }, { label: "Municípios" }]}
        title="Os 75 municípios de Sergipe"
        description={
          <p>
            Filtre, ordene e compare. Clique no nome para abrir o raio-x completo. A ordem padrão é alfabética: o portal não
            faz ranking de &ldquo;melhores&rdquo; ou &ldquo;piores&rdquo;.
          </p>
        }
      />

      <div className="page flex flex-col gap-4 pt-6">
        <CollapsibleFilters activeCount={chips.length}>
          <FilterForm action="/municipios" className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <input type="hidden" name="ordem" value={sortKey} />
            <input type="hidden" name="dir" value={dir} />
            <label className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
              <span className="text-[13px] font-semibold text-ink-700">Buscar pelo nome</span>
              <span className="flex gap-2">
                <input type="search" name="q" defaultValue={search} key={search} placeholder="Ex.: Lagarto" className="field min-w-0" />
                <button type="submit" className="btn btn-primary px-3.5" aria-label="Buscar">
                  <SearchIcon />
                </button>
              </span>
            </label>
            <SelectField name="ano" label="Ano" value={String(year)} options={yearOptions()} />
            <SelectField
              name="territorio"
              label="Território"
              value={territory ? territorySlug : ""}
              options={[{ value: "", label: "Todos os territórios" }, ...TERRITORIES.map((t) => ({ value: slugify(t), label: t }))]}
            />
            <SelectField
              name="porte"
              label="Porte (habitantes)"
              value={size?.id ?? ""}
              options={[{ value: "", label: "Todos os portes" }, ...SIZE_CLASSES.map((c) => ({ value: c.id, label: c.label }))]}
            />
            <SelectField name="area" label="Área de gasto" value={area ?? ""} options={areaOptions("Orçamento inteiro")} />
            <SegmentedRadio
              name="atencao"
              label="Pontos de atenção"
              value={attention}
              className="sm:col-span-2"
              options={[
                { value: "", label: "Todos" },
                { value: "sim", label: "Com pontos" },
                { value: "nao", label: "Sem pontos" },
              ]}
            />
          </FilterForm>
        </CollapsibleFilters>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p aria-live="polite" className="text-[15px] text-ink-700" data-testid="result-count">
            <strong className="font-semibold text-ink-900">
              {rows.length === 75 ? "Mostrando os 75 municípios" : `${rows.length} de 75 municípios`}
            </strong>{" "}
            · dados de {year}
            {areaLabel && ` · gastos em ${areaLabel.toLowerCase()}`} · mediana por habitante: {formatBRL(stateMedian)}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                scroll={false}
                className="flex h-8 items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 text-[13px] font-medium text-brand-700 hover:border-brand-300"
                aria-label={`Remover filtro ${c.label}`}
              >
                {c.label} <span aria-hidden>✕</span>
              </Link>
            ))}
            <a href={`/dados/municipios?ano=${year}`} className="flex items-center gap-1.5 text-sm text-brand-700 hover:underline">
              <DownloadIcon /> Baixar CSV de {year}
            </a>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2.5 rounded-lg border border-dashed border-paper-400 bg-white px-6 py-10 text-center">
            <h2 className="text-[19px] font-semibold text-ink-900">Nenhum município com esses filtros</h2>
            <p className="text-[15px] text-ink-500">Tente outro nome ou remova um dos filtros.</p>
            <Link href={`/municipios?ano=${year}`} className="btn btn-secondary mt-1 border-brand-700 text-brand-700">
              Limpar filtros
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <DataTable testId="municipality-table" minWidth={960} caption={`Municípios de Sergipe, ${year}`}>
                <thead>
                  <tr>
                    {columns.map((key) => {
                      const active = key === sortKey;
                      return (
                        <Th
                          key={key}
                          align={key === "nome" ? "left" : "right"}
                          className="p-0!"
                          sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
                        >
                          <Link
                            href={sortHref(key)}
                            scroll={false}
                            className={`flex h-12 items-center gap-1 px-4 ${key === "nome" ? "justify-start" : "justify-end"} ${
                              active ? "bg-brand-100 text-brand-900" : "hover:text-brand-700"
                            }`}
                          >
                            {key === "gasto" && areaLabel ? `${areaLabel}/hab.` : key === "pago" && areaLabel ? `Pago em ${areaLabel.toLowerCase()}` : SORTS[key].label}
                            <span aria-hidden className={`text-[10px] ${active ? "text-brand-700" : "text-paper-400"}`}>
                              {active ? (dir === "asc" ? "▲" : "▼") : "↕"}
                            </span>
                          </Link>
                        </Th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.code}>
                      <Td>
                        <Link
                          href={`/municipios/${r.slug}?ano=${year}${area ? `&area=${area}#gastos` : ""}`}
                          className="font-semibold text-brand-700 hover:underline"
                        >
                          {r.name}
                        </Link>
                        <span className="block text-[13px] text-ink-500">
                          {r.territory} · {r.sizeClass?.label.toLowerCase() ?? "—"}
                        </span>
                      </Td>
                      <Td align="right">{formatInteger(r.population)}</Td>
                      <Td align="right" className="font-semibold text-ink-900">
                        {r.paid == null ? <NotDeclared /> : formatBRLCompact(r.paid)}
                      </Td>
                      <Td align="right">{r.paidPerCapita == null ? "—" : formatBRL(r.paidPerCapita)}</Td>
                      {!area && <Td align="right">{r.revenuePerCapita == null ? "—" : formatBRL(r.revenuePerCapita)}</Td>}
                      <Td align="right">
                        <div className="ml-auto flex max-w-32 items-center justify-end gap-2">
                          <div className="w-12">
                            <ProgressBar ratio={r.execution} label={`${formatPercent(r.execution)} executado`} />
                          </div>
                          <span className="w-12">{formatPercent(r.execution)}</span>
                        </div>
                      </Td>
                      <Td align="right">
                        <Personnel row={r} />
                      </Td>
                      <Td align="right">
                        {r.insightCount > 0 ? (
                          <Link href={`/municipios/${r.slug}?ano=${year}#atencao`} className="hover:opacity-80">
                            <AttentionTag row={r} />
                          </Link>
                        ) : (
                          <AttentionTag row={r} />
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              <FilterForm action="/municipios" className="flex items-end gap-2">
                {Object.entries(params).map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}
                <SelectField
                  name="ordem"
                  label="Ordenar por"
                  value={sortKey}
                  className="flex-1"
                  options={(Object.keys(SORTS) as SortKey[]).map((k) => ({ value: k, label: SORTS[k].label }))}
                />
              </FilterForm>
              <ul className="flex flex-col gap-2">
                {rows.map((r) => (
                  <li key={r.code}>
                    <Link href={`/municipios/${r.slug}?ano=${year}`} className="card block px-4 py-3.5">
                      <span className="flex items-start justify-between gap-2">
                        <span>
                          <span className="block text-[17px] font-semibold text-brand-700">{r.name}</span>
                          <span className="block text-[13px] text-ink-500">
                            {r.territory} · {formatInteger(r.population)} hab.
                          </span>
                        </span>
                        <AttentionTag row={r} />
                      </span>
                      <dl className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 tabular-nums">
                        <div>
                          <dt className="text-xs text-ink-500">Por habitante</dt>
                          <dd className="text-[15px] font-semibold text-ink-900">{formatBRL(r.paidPerCapita)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-ink-500">Executado</dt>
                          <dd className="text-[15px] font-semibold text-ink-900">{formatPercent(r.execution)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-ink-500">Pessoal</dt>
                          <dd className="text-[15px] font-semibold text-ink-900">
                            <Personnel row={r} />
                          </dd>
                        </div>
                      </dl>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
        <SourceNote>
          SICONFI/Tesouro Nacional: DCA Anexo I-E (pago e população), RREO Anexo 02 (orçamento), DCA Anexo I-C (receita) e
          RGF Anexo 01 (pessoal, % da receita corrente líquida; ▲ acima do limite de 54%), {year}. Valores em reais de{" "}
          {year}.
        </SourceNote>
      </div>
    </>
  );
}
