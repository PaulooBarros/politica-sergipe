// Downloads the monthly IPCA index (IBGE, SIDRA table 1737) and saves yearly
// deflators to data/ipca.json, so amounts can be shown in constant reais of the
// most recent year.
// Run with: npm run data:ipca

import { writeFile } from "node:fs/promises";
import path from "node:path";

const FIRST_YEAR = 2021;
const LAST_YEAR = 2025;
const URL = `https://apisidra.ibge.gov.br/values/t/1737/n1/all/v/2266/p/${FIRST_YEAR}01-${LAST_YEAR}12`;

async function main() {
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  // First row is the header; D3C = "YYYYMM", V = index number (Dec/1993 = 100)
  const rows = ((await res.json()) as { D3C: string; V: string }[]).slice(1);

  const byYear = new Map<number, number[]>();
  for (const r of rows) {
    const year = Number(r.D3C.slice(0, 4));
    byYear.set(year, [...(byYear.get(year) ?? []), Number(r.V)]);
  }

  const averages: Record<number, number> = {};
  for (const [year, values] of byYear) {
    if (values.length !== 12) throw new Error(`IPCA ${year}: expected 12 months, got ${values.length}`);
    averages[year] = values.reduce((a, b) => a + b, 0) / 12;
  }

  // Multiply a year's amount by its factor to express it in reais of LAST_YEAR.
  const factors = Object.fromEntries(
    Object.entries(averages).map(([year, avg]) => [year, averages[LAST_YEAR] / avg]),
  );

  const output = {
    source: "IBGE – IPCA, número-índice mensal (SIDRA, tabela 1737); fator pela média anual do índice",
    url: URL,
    baseYear: LAST_YEAR,
    downloadedAt: new Date().toISOString().slice(0, 10),
    factors,
  };
  const outFile = path.join(process.cwd(), "data", "ipca.json");
  await writeFile(outFile, JSON.stringify(output, null, 2));
  console.log(`Saved to ${outFile}:`, factors);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
