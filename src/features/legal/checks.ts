import { getEntityYear, STATE_CODE } from "@/features/budget/data";
import type { GlossaryId } from "@/lib/glossary";

export type CheckStatus = "ok" | "alert" | "prudential" | "fail" | "unknown";

export type LegalCheck = {
  id: "education" | "health" | "fundebPay" | "personnel";
  label: string;
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
  ): LegalCheck => {
    const item = legal?.[id] ?? null;
    if (!item) {
      return { id, label, glossary, value: null, threshold: null, kind: "minimum", status: "unknown", law, sentence: "Não declarado ao Tesouro Nacional para este ano." };
    }
    const ok = item.applied >= item.minimum;
    return {
      id,
      label,
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
  const personnelCheck: LegalCheck = personnel
    ? {
        id: "personnel",
        label: "Gasto com pessoal",
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
        glossary: "limite-pessoal",
        law: "Lei de Responsabilidade Fiscal, arts. 19, 20 e 22",
        value: null,
        threshold: null,
        kind: "maximum",
        status: "unknown",
        sentence: "Relatório de Gestão Fiscal não declarado ao Tesouro Nacional para este ano.",
      };

  return [
    minimum("education", "Educação", "minimo-educacao", "Constituição Federal, art. 212", "da receita de impostos em manutenção e desenvolvimento do ensino"),
    minimum("health", "Saúde", "minimo-saude", "Lei Complementar 141/2012, arts. 6º e 7º", "da receita de impostos em ações e serviços públicos de saúde"),
    minimum("fundebPay", "Fundeb para profissionais da educação", "fundeb", "Lei 14.113/2020, art. 26", "do Fundeb na remuneração dos profissionais da educação"),
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

export const STATUS_LABEL: Record<CheckStatus, string> = {
  ok: "Dentro da regra",
  alert: "Acima do limite de alerta",
  prudential: "Acima do limite prudencial",
  fail: "Fora da regra",
  unknown: "Não declarado",
};
