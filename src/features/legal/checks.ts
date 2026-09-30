import { getEntityYear, STATE_CODE } from "@/features/budget/data";
import type { GlossaryId } from "@/lib/glossary";

export type CheckStatus = "ok" | "alert" | "prudential" | "fail" | "unknown";

export type LegalCheck = {
  id: "education" | "health" | "fundebPay" | "personnel";
  label: string;
  /** What the percentage is measured against, in plain words. */
  base: string;
  glossary: GlossaryId;
  /** Percentage actually applied/spent, as declared. */
  value: number | null;
  /** Legal threshold: a minimum for education/health/fundeb, a maximum for personnel. */
  threshold: number | null;
  kind: "minimum" | "maximum";
  status: CheckStatus;
  sentence: string;
  law: string;
  /** For personnel: the warning levels before the maximum. */
  alertAt?: number;
  prudentialAt?: number;
};

const pct = (v: number) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

export function getLegalChecks(code: string, year: number): LegalCheck[] {
  const legal = getEntityYear(code, year)?.legal;
  const isState = code === STATE_CODE;
  const who = isState ? "O Governo do Estado" : "A prefeitura";

  const minimum = (
    id: "education" | "health" | "fundebPay",
    label: string,
    glossary: GlossaryId,
    law: string,
    what: string,
    base: string,
  ): LegalCheck => {
    const item = legal?.[id] ?? null;
    if (!item) {
      return { id, label, base, glossary, value: null, threshold: null, kind: "minimum", status: "unknown", law, sentence: "Não declarado ao Tesouro Nacional para este ano." };
    }
    const ok = item.applied >= item.minimum;
    return {
      id,
      label,
      base,
      glossary,
      law,
      value: item.applied,
      threshold: item.minimum,
      kind: "minimum",
      status: ok ? "ok" : "fail",
      sentence: ok
        ? `${who} declarou ter aplicado ${pct(item.applied)} ${what}. O mínimo é ${pct(item.minimum)}.`
        : `${who} declarou ter aplicado ${pct(item.applied)} ${what}, abaixo do mínimo de ${pct(item.minimum)}.`,
    };
  };

  const personnel = legal?.personnel ?? null;
  const personnelBase = "% da receita corrente líquida (Poder Executivo)";
  const personnelCheck: LegalCheck = personnel
    ? {
        id: "personnel",
        label: "Gasto com pessoal",
        base: personnelBase,
        glossary: "limite-pessoal",
        law: "Lei de Responsabilidade Fiscal, arts. 19, 20 e 22",
        value: personnel.percent,
        threshold: personnel.limit,
        kind: "maximum",
        alertAt: personnel.alert,
        prudentialAt: personnel.prudential,
        status:
          personnel.percent > personnel.limit
            ? "fail"
            : personnel.percent > personnel.prudential
              ? "prudential"
              : personnel.percent > personnel.alert
                ? "alert"
                : "ok",
        sentence: `O Poder Executivo gastou ${pct(personnel.percent)} da receita corrente líquida com pessoal (${personnel.period}). O limite é ${pct(personnel.limit)}; o alerta começa em ${pct(personnel.alert)} e o limite prudencial em ${pct(personnel.prudential)}.`,
      }
    : {
        id: "personnel",
        label: "Gasto com pessoal",
        base: personnelBase,
        glossary: "limite-pessoal",
        law: "Lei de Responsabilidade Fiscal, arts. 19, 20 e 22",
        value: null,
        threshold: null,
        kind: "maximum",
        status: "unknown",
        sentence: "Relatório de Gestão Fiscal não declarado ao Tesouro Nacional para este ano.",
      };

  return [
    minimum("education", "Educação", "minimo-educacao", "Constituição Federal, art. 212", "da receita de impostos em manutenção e desenvolvimento do ensino", "% da receita de impostos aplicada no ensino"),
    minimum("health", "Saúde", "minimo-saude", "Lei Complementar 141/2012, arts. 6º e 7º", "da receita de impostos em ações e serviços públicos de saúde", "% da receita de impostos aplicada em saúde"),
    minimum("fundebPay", "Fundeb para profissionais da educação", "fundeb", "Lei 14.113/2020, art. 26", "do Fundeb na remuneração dos profissionais da educação", "% do Fundeb pago aos profissionais da educação"),
    personnelCheck,
  ];
}

/** How many municipalities break each rule in a year (for the overview). */
export function getLegalSummary(codes: string[], year: number) {
  const all = codes.map((code) => getLegalChecks(code, year));
  const count = (id: LegalCheck["id"], statuses: CheckStatus[]) =>
    all.filter((checks) => statuses.includes(checks.find((c) => c.id === id)!.status)).length;
  const declared = (id: LegalCheck["id"]) => all.filter((checks) => checks.find((c) => c.id === id)!.status !== "unknown").length;
  return {
    educationBelow: count("education", ["fail"]),
    educationDeclared: declared("education"),
    healthBelow: count("health", ["fail"]),
    healthDeclared: declared("health"),
    personnelAboveLimit: count("personnel", ["fail"]),
    personnelAboveAlert: count("personnel", ["alert", "prudential"]),
    personnelDeclared: declared("personnel"),
  };
}

const MINIMUM_NAME: Record<string, string> = { education: "educação", health: "saúde", fundebPay: "Fundeb" };

const list = (items: string[]) => (items.length <= 1 ? items[0] : `${items.slice(0, -1).join(", ")} e ${items.at(-1)}`);

/** Chapter title stating what the declared numbers show, e.g. "Cumpriu os mínimos de educação e saúde, mas passou do limite de pessoal". */
export function legalHeadline(checks: LegalCheck[]): string {
  const minimums = checks.filter((c) => c.kind === "minimum" && c.status !== "unknown");
  const personnel = checks.find((c) => c.id === "personnel");
  if (minimums.length === 0 && (!personnel || personnel.status === "unknown")) {
    return "As obrigações legais deste ano não foram declaradas ao Tesouro Nacional";
  }

  const met = minimums.filter((c) => c.status === "ok").map((c) => MINIMUM_NAME[c.id]);
  const missed = minimums.filter((c) => c.status !== "ok").map((c) => MINIMUM_NAME[c.id]);
  const good: string[] = [];
  const bad: string[] = [];
  if (met.length) good.push(`cumpriu ${met.length === 1 ? "o mínimo" : "os mínimos"} de ${list(met)}`);
  if (missed.length) bad.push(`ficou abaixo do mínimo de ${list(missed)}`);
  if (personnel?.status === "ok") good.push("ficou dentro do limite de pessoal");
  if (personnel?.status === "fail") bad.push("passou do limite de gasto com pessoal");
  if (personnel?.status === "prudential") bad.push("passou do limite prudencial de gasto com pessoal");
  if (personnel?.status === "alert") bad.push("passou do limite de alerta de gasto com pessoal");

  const sentence = good.length && bad.length ? `${list(good)}, mas ${list(bad)}` : list([...good, ...bad]);
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}
