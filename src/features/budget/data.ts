import budgetJson from "../../../data/budget.json";

export type AreaValues = {
  planned?: number;
  authorized?: number;
  liquidated?: number;
  paid?: number;
};

export type RevenueSource = "own" | "federalShare" | "stateShare" | "royalties" | "fundeb" | "health" | "loans" | "other";

export type Revenue = {
  total: number;
  sources: Record<RevenueSource, number>;
};

export type EntityYear = {
  population: number | null;
  planned: number | null;
  authorized: number | null;
  liquidated: number | null;
  paid: number | null;
  byFunction: Record<string, AreaValues>;
  revenue: Revenue | null;
};

type BudgetFile = {
  metadata: {
    sources: { planned: string; paid: string; revenue: string; territories: string };
    urls: { siconfi: string; territories: string };
    downloadedAt: string;
  };
  functions: Record<string, string>;
  territories: Record<string, string>;
  entities: Record<string, Record<string, EntityYear>>;
};

const budget = budgetJson as unknown as BudgetFile;

export const STATE_CODE = "28";

/** Most recent first. */
export const YEARS = Object.keys(budget.entities[STATE_CODE]).map(Number).sort((a, b) => b - a);
export const LATEST_YEAR = YEARS[0];

export const FUNCTIONS = budget.functions;
export const SOURCES = budget.metadata.sources;
export const SOURCE_URLS = budget.metadata.urls;
export const DOWNLOADED_AT = budget.metadata.downloadedAt;
export const TERRITORY_BY_CODE = budget.territories;

/** Plain-language names and explanations for each revenue source. */
export const REVENUE_SOURCES: Record<RevenueSource, { label: string; stateLabel?: string; description: string }> = {
  own: {
    label: "Impostos e taxas próprios",
    description: "IPTU, ISS, ITBI e taxas cobradas pela própria prefeitura.",
  },
  federalShare: {
    label: "Fundo de Participação (FPM)",
    stateLabel: "Fundo de Participação (FPE)",
    description: "Parte do Imposto de Renda e do IPI que a União divide com estados e municípios.",
  },
  stateShare: {
    label: "Cota do ICMS e do IPVA",
    description: "Parte dos impostos estaduais que o Estado repassa aos municípios.",
  },
  royalties: {
    label: "Royalties e compensações",
    description: "Compensação por petróleo, gás, hidrelétricas e mineração no território.",
  },
  fundeb: {
    label: "Fundeb (educação)",
    description: "Fundo que redistribui recursos para a educação básica conforme o número de alunos.",
  },
  health: {
    label: "SUS (saúde)",
    description: "Repasses da União e do Estado para ações e serviços de saúde.",
  },
  loans: {
    label: "Empréstimos",
    description: "Operações de crédito: dinheiro tomado emprestado, a ser pago nos anos seguintes.",
  },
  other: {
    label: "Outras receitas",
    description: "Convênios, rendimentos de aplicações, contribuições e demais receitas.",
  },
};

export function getEntityYear(code: string, year: number): EntityYear | null {
  return budget.entities[code]?.[year] ?? null;
}

/** Reads ?ano= and falls back to the latest year when missing or invalid. */
export function parseYear(value: string | string[] | undefined): number {
  const year = Number(Array.isArray(value) ? value[0] : value);
  return YEARS.includes(year) ? year : LATEST_YEAR;
}

/** Reads ?area= and returns a function code, or null for "all areas". */
export function parseArea(value: string | string[] | undefined): string | null {
  const area = Array.isArray(value) ? value[0] : value;
  return area && area in FUNCTIONS ? area : null;
}
