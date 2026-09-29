// Downloads the Sergipe municipal mesh and names from IBGE once and saves a
// static GeoJSON at data/sergipe-municipios.json.
// Run with: npm run data:map

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const STATE_CODE = 28; // Sergipe
const MESH_PERIOD = "2022";
const EXPECTED_COUNT = 75;

const MESH_URL =
  `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${STATE_CODE}` +
  `?formato=application/vnd.geo%2Bjson&qualidade=intermediaria` +
  `&intrarregiao=municipio&periodo=${MESH_PERIOD}`;
const NAMES_URL = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${STATE_CODE}/municipios`;

type MeshFeature = {
  type: "Feature";
  geometry: unknown;
  properties: { codarea: string };
};

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return (await res.json()) as T;
}

async function main() {
  const [mesh, municipalities] = await Promise.all([
    getJson<{ features: MeshFeature[] }>(MESH_URL),
    getJson<{ id: number; nome: string }[]>(NAMES_URL),
  ]);

  const names = new Map(municipalities.map((m) => [String(m.id), m.nome]));

  const features = mesh.features.map((f) => {
    const name = names.get(f.properties.codarea);
    if (!name) throw new Error(`No name for IBGE code ${f.properties.codarea}`);
    return {
      type: "Feature" as const,
      geometry: f.geometry,
      properties: { code: f.properties.codarea, name },
    };
  });

  if (features.length !== EXPECTED_COUNT || names.size !== EXPECTED_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_COUNT} municipalities, got ${features.length} shapes and ${names.size} names`,
    );
  }

  features.sort((a, b) => a.properties.name.localeCompare(b.properties.name, "pt-BR"));

  const output = {
    type: "FeatureCollection",
    metadata: {
      source: "IBGE – API de Malhas Geográficas (v3) e API de Localidades (v1)",
      meshPeriod: MESH_PERIOD,
      urls: [MESH_URL, NAMES_URL],
      downloadedAt: new Date().toISOString().slice(0, 10),
    },
    features,
  };

  const outFile = path.join(process.cwd(), "data", "sergipe-municipios.json");
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(output));
  console.log(`Saved ${features.length} municipalities to ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
