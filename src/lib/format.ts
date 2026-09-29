const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const integer = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 });

/** R$ 1.234 */
export function formatBRL(value: number | null | undefined) {
  return value == null ? "não declarado" : currency.format(value);
}

/** R$ 3,4 bilhões / R$ 850,2 milhões / R$ 12,5 mil */
export function formatBRLShort(value: number | null | undefined) {
  if (value == null) return "não declarado";
  const abs = Math.abs(value);
  if (abs >= 1e9) return `R$ ${decimal.format(value / 1e9)} ${abs >= 2e9 ? "bilhões" : "bilhão"}`;
  if (abs >= 1e6) return `R$ ${decimal.format(value / 1e6)} ${abs >= 2e6 ? "milhões" : "milhão"}`;
  if (abs >= 1e3) return `R$ ${decimal.format(value / 1e3)} mil`;
  return currency.format(value);
}

/** 83,4% */
export function formatPercent(ratio: number | null | undefined) {
  return ratio == null ? "—" : `${decimal.format(ratio * 100)}%`;
}

/** 605.309 */
export function formatInteger(value: number | null | undefined) {
  return value == null ? "—" : integer.format(value);
}
