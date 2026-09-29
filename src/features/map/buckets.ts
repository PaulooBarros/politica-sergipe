import type { MapValue } from "./MapExplorer";

/**
 * Splits values into 5 quantile classes (15 municipalities each when all 75
 * have data), so the map shows how municipalities compare, not outliers.
 */
export function quantileBuckets(
  values: Record<string, number | null>,
  format: (v: number) => string,
): { values: Record<string, MapValue>; legend: string[] } {
  const sorted = Object.values(values)
    .filter((v): v is number => v != null)
    .sort((a, b) => a - b);
  const CLASSES = 5;
  const breaks = Array.from({ length: CLASSES - 1 }, (_, i) => sorted[Math.floor(((i + 1) * sorted.length) / CLASSES)]);

  const bucketOf = (v: number) => breaks.filter((b) => v >= b).length;

  const legend = Array.from({ length: CLASSES }, (_, i) => {
    if (i === 0) return `Até ${format(breaks[0])}`;
    if (i === CLASSES - 1) return `${format(breaks[CLASSES - 2])} ou mais`;
    return `${format(breaks[i - 1])} a ${format(breaks[i])}`;
  });

  return {
    values: Object.fromEntries(
      Object.entries(values).map(([code, v]) => [
        code,
        { label: v == null ? "não declarado" : format(v), bucket: v == null ? null : bucketOf(v) },
      ]),
    ),
    legend,
  };
}
