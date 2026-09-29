import { FUNCTIONS, YEARS } from "./data";

/** Options for an "área" select, sorted by name, with "all areas" first. */
export function areaOptions(allLabel = "Todas as áreas") {
  return [
    { value: "", label: allLabel },
    ...Object.entries(FUNCTIONS)
      .filter(([code]) => code !== "99")
      .sort(([, a], [, b]) => a.localeCompare(b, "pt-BR"))
      .map(([code, name]) => ({ value: code, label: name })),
  ];
}

export function yearOptions() {
  return YEARS.map((y) => ({ value: String(y), label: String(y) }));
}
