import mapData from "../../../data/sergipe-municipios.json";
import { TERRITORY_BY_CODE } from "@/features/budget/data";
import { slugify } from "@/lib/slug";

export type Municipality = {
  code: string;
  name: string;
  slug: string;
  territory: string;
};

// West-to-east reading order, as the state usually presents its territories.
export const TERRITORIES = [
  "Alto Sertão Sergipano",
  "Médio Sertão Sergipano",
  "Baixo São Francisco",
  "Agreste Central Sergipano",
  "Leste Sergipano",
  "Centro-Sul Sergipano",
  "Sul Sergipano",
  "Grande Aracaju",
];

export const MUNICIPALITIES: Municipality[] = (
  mapData as unknown as { features: { properties: { code: string; name: string } }[] }
).features
  .map(({ properties: { code, name } }) => ({
    code,
    name,
    slug: slugify(name),
    territory: TERRITORY_BY_CODE[code],
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

const BY_SLUG = new Map(MUNICIPALITIES.map((m) => [m.slug, m]));
const BY_CODE = new Map(MUNICIPALITIES.map((m) => [m.code, m]));

export function getMunicipalityBySlug(slug: string) {
  return BY_SLUG.get(slug) ?? null;
}

export function getMunicipalityByCode(code: string) {
  return BY_CODE.get(code) ?? null;
}

/** Population size classes, adapted from IBGE's ranges to Sergipe's reality. */
export const SIZE_CLASSES = [
  { id: "ate-10-mil", label: "Até 10 mil habitantes", max: 10_000 },
  { id: "10-a-20-mil", label: "10 mil a 20 mil", max: 20_000 },
  { id: "20-a-50-mil", label: "20 mil a 50 mil", max: 50_000 },
  { id: "50-a-100-mil", label: "50 mil a 100 mil", max: 100_000 },
  { id: "mais-de-100-mil", label: "Mais de 100 mil", max: Infinity },
] as const;

export type SizeClass = (typeof SIZE_CLASSES)[number];

export function getSizeClass(population: number | null): SizeClass | null {
  if (population == null) return null;
  return SIZE_CLASSES.find((c) => population <= c.max) ?? null;
}
