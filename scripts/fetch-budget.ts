// Builds data/budget.json with planned (RREO Anexo 02, 6th bimester) and paid
// (DCA Anexo I-E) expenses by government function, and revenue by source
// (DCA Anexo I-C), for the 75 Sergipe municipalities and the state government,
// plus territory assignments.
// Raw API responses are cached in data/raw/siconfi/ so reruns are fast.
// Run with: npm run data:budget

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const YEARS = [2021, 2022, 2023, 2024, 2025];
const STATE_CODE = "28";
const API_URL = "https://apidatalake.tesouro.gov.br/ords/siconfi/tt";
const CONCURRENCY = 5;
const ROOT = process.cwd();
const RAW_DIR = path.join(ROOT, "data", "raw", "siconfi");

// Functional classification (Portaria MOG nº 42/1999).
const FUNCTIONS: Record<string, string> = {
  "01": "Legislativa",
  "02": "Judiciária",
  "03": "Essencial à Justiça",
  "04": "Administração",
  "05": "Defesa Nacional",
  "06": "Segurança Pública",
  "07": "Relações Exteriores",
  "08": "Assistência Social",
  "09": "Previdência Social",
  "10": "Saúde",
  "11": "Trabalho",
  "12": "Educação",
  "13": "Cultura",
  "14": "Direitos da Cidadania",
  "15": "Urbanismo",
  "16": "Habitação",
  "17": "Saneamento",
  "18": "Gestão Ambiental",
  "19": "Ciência e Tecnologia",
  "20": "Agricultura",
  "21": "Organização Agrária",
  "22": "Indústria",
  "23": "Comércio e Serviços",
  "24": "Comunicações",
  "25": "Energia",
  "26": "Transporte",
  "27": "Desporto e Lazer",
  "28": "Encargos Especiais",
  "99": "Reserva de Contingência",
};

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
const FUNCTION_BY_NAME = new Map(Object.entries(FUNCTIONS).map(([code, name]) => [normalize(name), code]));

type Item = { coluna: string; cod_conta: string; conta: string; valor: number; populacao?: number };

type AreaValues = { planned?: number; authorized?: number; liquidated?: number; paid?: number };
type EntityYear = {
  population: number | null;
  planned: number | null;
  authorized: number | null;
  liquidated: number | null;
  paid: number | null;
  byFunction: Record<string, AreaValues>;
  revenue: Revenue | null;
};

type Kind = "dca" | "dca-receita" | "rreo";

const QUERIES: Record<Kind, (year: number, code: string) => string> = {
  dca: (year, code) => `dca?an_exercicio=${year}&no_anexo=DCA-Anexo%20I-E&id_ente=${code}`,
  "dca-receita": (year, code) => `dca?an_exercicio=${year}&no_anexo=DCA-Anexo%20I-C&id_ente=${code}`,
  rreo: (year, code) =>
    `rreo?an_exercicio=${year}&nr_periodo=6&co_tipo_demonstrativo=RREO&no_anexo=RREO-Anexo%2002&id_ente=${code}`,
};

async function fetchCached(kind: Kind, year: number, code: string): Promise<Item[]> {
  const file = path.join(RAW_DIR, `${kind}-${year}-${code}.json`);
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    // not cached yet
  }

  const url = `${API_URL}/${QUERIES[kind](year, code)}`;

  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const body = (await res.json()) as { items: Item[]; hasMore: boolean };
      if (body.hasMore) throw new Error("paginated response not handled");
      await mkdir(RAW_DIR, { recursive: true });
      await writeFile(file, JSON.stringify(body.items));
      return body.items;
    } catch (err) {
      if (attempt >= 4) throw new Error(`Failed ${url}: ${err}`);
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
  }
}

const round = (n: number) => Math.round(n);

function parseDca(items: Item[]) {
  const paid = items.filter((i) => i.coluna === "Despesas Pagas");
  const total = paid.find((i) => i.conta === "Despesas Exceto Intraorçamentárias");
  if (!total) return null;
  const byFunction: Record<string, number> = {};
  for (const item of paid) {
    const match = /^(\d{2}) - /.exec(item.conta);
    if (match) byFunction[match[1]] = (byFunction[match[1]] ?? 0) + item.valor;
  }
  return { population: total.populacao ?? null, paid: total.valor, byFunction };
}

// Revenue sources, as top-level accounts of the DCA Anexo I-C (MCASP revenue
// classification). Values are net of deductions (FUNDEB share and, for the
// state, the constitutional share handed to municipalities).
const REVENUE_SOURCES: Record<string, string[]> = {
  own: ["1.1.0.0.00.0.0"], // impostos, taxas e contribuições de melhoria
  federalShare: ["1.7.1.1.00.0.0"], // FPM/FPE and other shares of federal taxes
  stateShare: ["1.7.2.1.00.0.0"], // cota-parte do ICMS, IPVA
  royalties: ["1.7.1.2.00.0.0", "1.7.2.2.00.0.0"], // petróleo, recursos hídricos, mineração
  fundeb: ["1.7.5.1.00.0.0", "1.7.1.5.00.0.0"],
  health: ["1.7.1.3.00.0.0", "1.7.2.3.00.0.0", "2.4.1.1.00.0.0"], // SUS
  loans: ["2.1.0.0.00.0.0"], // operações de crédito
};
const REVENUE_TOTAL = "ReceitasExcetoIntraOrcamentarias";

type Revenue = { total: number; sources: Record<string, number> };

function parseRevenue(items: Item[], code: string, year: number, warnings: string[]): Revenue | null {
  const net = (codConta: string) =>
    items
      .filter((i) => i.cod_conta === codConta)
      .reduce((acc, i) => acc + (i.coluna === "Receitas Brutas Realizadas" ? i.valor : -i.valor), 0);

  if (!items.some((i) => i.cod_conta === REVENUE_TOTAL)) return null;
  const total = net(REVENUE_TOTAL);

  const sources: Record<string, number> = {};
  for (const [key, accounts] of Object.entries(REVENUE_SOURCES)) {
    sources[key] = round(accounts.reduce((acc, a) => acc + net(`RO${a}`), 0));
  }
  const known = Object.values(sources).reduce((a, b) => a + b, 0);
  sources.other = round(total - known);
  if (sources.other < -0.01 * total) {
    warnings.push(`${code}/${year}: revenue sources exceed total by ${(-sources.other / 1e6).toFixed(1)} mi`);
  }
  return { total: round(total), sources };
}

const RREO_COLUMNS = {
  planned: "DOTAÇÃO INICIAL",
  authorized: "DOTAÇÃO ATUALIZADA (a)",
  liquidated: "DESPESAS LIQUIDADAS ATÉ O BIMESTRE (d)",
} as const;
const RREO_TOTAL = "DESPESAS (EXCETO INTRA-ORÇAMENTÁRIAS) (I)";

function parseRreo(items: Item[]) {
  const rows = items.filter((i) => i.cod_conta === "RREO2TotalDespesas");
  const totals: Partial<Record<keyof typeof RREO_COLUMNS, number>> = {};
  const byFunction: Record<string, Partial<Record<keyof typeof RREO_COLUMNS, number>>> = {};

  for (const [key, column] of Object.entries(RREO_COLUMNS) as [keyof typeof RREO_COLUMNS, string][]) {
    for (const row of rows.filter((r) => r.coluna === column)) {
      if (row.conta === RREO_TOTAL) {
        totals[key] = row.valor;
        continue;
      }
      const fn = FUNCTION_BY_NAME.get(normalize(row.conta));
      if (fn) (byFunction[fn] ??= {})[key] = ((byFunction[fn] ?? {})[key] ?? 0) + row.valor;
    }
  }
  if (totals.planned === undefined) return null;
  return { totals, byFunction };
}

async function buildEntityYear(code: string, year: number, warnings: string[]): Promise<EntityYear> {
  const [dcaItems, rreoItems, revenueItems] = await Promise.all([
    fetchCached("dca", year, code),
    fetchCached("rreo", year, code),
    fetchCached("dca-receita", year, code),
  ]);
  const dca = parseDca(dcaItems);
  const rreo = parseRreo(rreoItems);
  const revenue = parseRevenue(revenueItems, code, year, warnings);

  if (rreo) {
    const sum = Object.values(rreo.byFunction).reduce((a, f) => a + (f.planned ?? 0), 0);
    const diff = Math.abs(sum - rreo.totals.planned!) / Math.max(rreo.totals.planned!, 1);
    if (diff > 0.005) {
      warnings.push(`${code}/${year}: RREO function sum differs from total by ${(diff * 100).toFixed(1)}%`);
    }
  }

  const byFunction: Record<string, AreaValues> = {};
  const fnCodes = new Set([...Object.keys(dca?.byFunction ?? {}), ...Object.keys(rreo?.byFunction ?? {})]);
  for (const fn of fnCodes) {
    const values: AreaValues = {};
    const r = rreo?.byFunction[fn];
    if (r?.planned !== undefined) values.planned = round(r.planned);
    if (r?.authorized !== undefined) values.authorized = round(r.authorized);
    if (r?.liquidated !== undefined) values.liquidated = round(r.liquidated);
    if (dca?.byFunction[fn] !== undefined) values.paid = round(dca.byFunction[fn]);
    byFunction[fn] = values;
  }

  const population = dca?.population ?? (rreoItems[0]?.populacao ?? null);
  return {
    population,
    planned: rreo ? round(rreo.totals.planned!) : null,
    authorized: rreo?.totals.authorized !== undefined ? round(rreo.totals.authorized) : null,
    liquidated: rreo?.totals.liquidated !== undefined ? round(rreo.totals.liquidated) : null,
    paid: dca ? round(dca.paid) : null,
    byFunction,
    revenue,
  };
}

async function runPool<T>(tasks: (() => Promise<T>)[], size: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (next < tasks.length) {
        const i = next++;
        results[i] = await tasks[i]();
      }
    }),
  );
  return results;
}

async function loadTerritories(names: Map<string, string>) {
  const file = path.join(ROOT, "data", "sources", "territorios.json");
  const src = JSON.parse(await readFile(file, "utf8")) as {
    source: string;
    url: string;
    territories: Record<string, string[]>;
  };
  const byCode: Record<string, string> = {};
  const codeByName = new Map([...names].map(([code, name]) => [normalize(name), code]));
  for (const [territory, list] of Object.entries(src.territories)) {
    for (const name of list) {
      const code = codeByName.get(normalize(name));
      if (!code) throw new Error(`Territory list: unknown municipality "${name}"`);
      if (byCode[code]) throw new Error(`Territory list: "${name}" appears twice`);
      byCode[code] = territory;
    }
  }
  const unassigned = [...names].filter(([code]) => !byCode[code]).map(([, n]) => n);
  if (unassigned.length) throw new Error(`Territory list: missing ${unassigned.join(", ")}`);
  return { source: src.source, url: src.url, byCode };
}

async function main() {
  const map = JSON.parse(await readFile(path.join(ROOT, "data", "sergipe-municipios.json"), "utf8")) as {
    features: { properties: { code: string; name: string } }[];
  };
  const names = new Map(map.features.map((f) => [f.properties.code, f.properties.name]));
  const territories = await loadTerritories(names);

  const codes = [STATE_CODE, ...names.keys()];
  const warnings: string[] = [];
  const entities: Record<string, Record<string, EntityYear>> = {};
  const missing: Record<string, { planned: string[]; paid: string[]; revenue: string[] }> = {};

  for (const year of YEARS) {
    const results = await runPool(
      codes.map((code) => async () => ({ code, data: await buildEntityYear(code, year, warnings) })),
      CONCURRENCY,
    );
    missing[year] = { planned: [], paid: [], revenue: [] };
    for (const { code, data } of results) {
      (entities[code] ??= {})[year] = data;
      const label = code === STATE_CODE ? "Governo do Estado" : names.get(code)!;
      if (data.planned === null) missing[year].planned.push(label);
      if (data.paid === null) missing[year].paid.push(label);
      if (data.revenue === null) missing[year].revenue.push(label);
    }
    console.log(
      `${year}: missing planned [${missing[year].planned.join(", ")}], ` +
        `paid [${missing[year].paid.join(", ")}], revenue [${missing[year].revenue.join(", ")}]`,
    );
  }
  for (const w of warnings) console.warn(`WARN ${w}`);

  const output = {
    metadata: {
      sources: {
        planned:
          "Tesouro Nacional – SICONFI, Relatório Resumido da Execução Orçamentária (RREO), Anexo 02, 6º bimestre",
        paid: "Tesouro Nacional – SICONFI, Declaração de Contas Anuais (DCA), Anexo I-E",
        revenue: "Tesouro Nacional – SICONFI, Declaração de Contas Anuais (DCA), Anexo I-C",
        territories: territories.source,
      },
      urls: { siconfi: API_URL, territories: territories.url },
      downloadedAt: new Date().toISOString().slice(0, 10),
      missing,
    },
    functions: FUNCTIONS,
    territories: territories.byCode,
    entities,
  };

  const outFile = path.join(ROOT, "data", "budget.json");
  await writeFile(outFile, JSON.stringify(output));
  console.log(`Saved to ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
