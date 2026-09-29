import { FUNCTIONS, getEntityYear, STATE_CODE } from "@/features/budget/data";
import { getMunicipalityRows, median, ratio } from "@/features/budget/metrics";
import { getLegalChecks } from "@/features/legal/checks";
import { getMunicipalityByCode } from "@/features/municipalities/registry";
import { formatBRL, formatBRLShort, formatPercent } from "@/lib/format";

/**
 * "Pontos de atenção": objective patterns in the official data that deserve a
 * question. Every rule applies the same threshold to every entity, states the
 * fact with numbers, lists legitimate explanations and says where to check.
 * They never state or imply wrongdoing.
 */
export type Insight = {
  rule: RuleId;
  entityCode: string;
  year: number;
  title: string;
  fact: string;
  why: string;
  explanations: string[];
  check: string[];
  /** A neutral question a citizen can send to the legislature or file as an information request. */
  question: string;
  /** Used to order insights of the same rule (bigger = more unusual). */
  magnitude: number;
};

export type RuleId =
  | "legal-minimum"
  | "personnel-limit"
  | "budget-revised"
  | "low-execution"
  | "royalty-dependence"
  | "spending-jump"
  | "loans"
  | "spent-above-revenue"
  | "area-above-peers"
  | "high-spending-per-capita";

type Rule = { label: string; threshold: string; question: (year: number, title: string) => string };

export const RULES: Record<RuleId, Rule> = {
  "legal-minimum": {
    label: "Mínimo constitucional não atingido",
    threshold: "% declarado abaixo do mínimo de educação, saúde ou Fundeb",
    question: (y, t) =>
      `Por que o mínimo legal (${t.replace("Mínimo não atingido: ", "")}) não foi atingido em ${y}? Como e quando a diferença será compensada?`,
  },
  "personnel-limit": {
    label: "Gasto com pessoal acima do limite de alerta",
    threshold: "gasto com pessoal > 90% do limite da LRF",
    question: (y) =>
      `Quais medidas estão sendo adotadas para manter o gasto com pessoal dentro dos limites da Lei de Responsabilidade Fiscal, considerando o resultado de ${y}?`,
  },
  "budget-revised": {
    label: "Gasto muito acima do orçamento aprovado",
    threshold: "pago ≥ 125% do previsto na lei",
    question: (y) =>
      `Quais leis e decretos de crédito adicional ampliaram o orçamento de ${y}, com qual fonte de recursos e em quais áreas o valor adicional foi aplicado?`,
  },
  "low-execution": {
    label: "Orçamento pouco executado",
    threshold: "pago < 75% do autorizado",
    question: (y) =>
      `Quais obras, serviços e programas previstos no orçamento de ${y} não foram pagos no ano, e qual o motivo?`,
  },
  "royalty-dependence": {
    label: "Receita dependente de royalties",
    threshold: "royalties ≥ 15% da receita",
    question: (y) =>
      `Em quais despesas foram aplicados os royalties recebidos em ${y}? Existe planejamento para o caso de essa receita diminuir?`,
  },
  "spending-jump": {
    label: "Salto no gasto de um ano para o outro",
    threshold: "gasto pago cresceu ≥ 35%",
    question: (y) => `Quais despesas mais cresceram em ${y} em relação ao ano anterior, e o que explica o aumento?`,
  },
  loans: {
    label: "Receita com peso de empréstimos",
    threshold: "empréstimos ≥ 5% da receita",
    question: (y) =>
      `Quais operações de crédito foram contratadas até ${y}, para quais finalidades, com quais juros, prazos e parcelas previstas?`,
  },
  "spent-above-revenue": {
    label: "Gastou mais do que arrecadou",
    threshold: "pago > 103% da receita do ano",
    question: (y) =>
      `De onde vieram os recursos para pagar despesas acima da receita de ${y}? Qual era o saldo em caixa no início e no fim do ano?`,
  },
  "area-above-peers": {
    label: "Área com gasto muito acima dos municípios do mesmo porte",
    threshold: "≥ 3× a mediana do porte, em áreas com ≥ 8% do gasto (exceto Previdência)",
    question: (y, t) =>
      `Quais foram as principais despesas na área ${t.split(":")[0]} em ${y}, com os respectivos credores, contratos e objetos?`,
  },
  "high-spending-per-capita": {
    label: "Gasto por habitante muito acima do mesmo porte",
    threshold: "≥ 1,5× a mediana do porte",
    question: (y) => `Quais foram as 20 maiores despesas de ${y}, com credor, contrato e objeto de cada uma?`,
  },
};

const AREA_MIN_RATIO = 3;
const AREA_MIN_SHARE = 0.08;
/** R$ per inhabitant; below this the peer median is too small to compare against. */
const AREA_MIN_PEER_MEDIAN = 100;

const times = (v: number) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} vezes`;

function oversight(isState: boolean) {
  return isState
    ? {
        legislature: "Assembleia Legislativa de Sergipe (leis orçamentárias e de créditos adicionais)",
        transparency: "Portal da Transparência do Governo de Sergipe (despesas por órgão e credor)",
      }
    : {
        legislature: "Câmara Municipal (lei do orçamento e leis de créditos adicionais do ano)",
        transparency: "Portal da Transparência da prefeitura (despesas por credor e contratos)",
      };
}
const TCE = "Tribunal de Contas do Estado de Sergipe, TCE-SE (prestação de contas anual e pareceres), tce.se.gov.br";

export function getInsights(entityCode: string, year: number): Insight[] {
  const entity = getEntityYear(entityCode, year);
  if (!entity) return [];
  const isState = entityCode === STATE_CODE;
  const who = isState ? "O Governo do Estado" : "A prefeitura";
  const { legislature, transparency } = oversight(isState);
  const insights: Insight[] = [];
  const add = (i: Omit<Insight, "entityCode" | "year" | "question">) =>
    insights.push({ ...i, entityCode, year, question: RULES[i.rule].question(year, i.title) });

  // 0. Legal obligations (as declared by the entity itself)
  for (const c of getLegalChecks(entityCode, year)) {
    if (c.id !== "personnel" && c.status === "fail") {
      add({
        rule: "legal-minimum",
        title: `Mínimo não atingido: ${c.label.toLowerCase()}`,
        fact: c.sentence,
        why: "Os mínimos de educação, saúde e Fundeb são obrigações da Constituição e de leis federais. Não cumpri-los pode levar à rejeição das contas e à suspensão de transferências.",
        explanations: [
          "Diferença compensada no ano seguinte, como a lei às vezes permite.",
          "Erro de preenchimento no relatório, corrigido depois (retificação).",
          "Receita maior que a prevista no fim do ano, elevando o valor mínimo exigido.",
        ],
        check: [TCE, isState ? "SIOPE e SIOPS (sistemas federais de educação e saúde)" : "SIOPE (educação) e SIOPS (saúde), sistemas federais onde o município declara esses gastos"],
        magnitude: 1 + (c.threshold! - c.value!) / c.threshold!,
      });
    }
    if (c.id === "personnel" && (c.status === "alert" || c.status === "prudential" || c.status === "fail")) {
      add({
        rule: "personnel-limit",
        title: c.status === "fail" ? "Gasto com pessoal acima do limite da LRF" : "Gasto com pessoal perto do limite da LRF",
        fact: c.sentence,
        why: "Acima do limite prudencial, a lei proíbe novas contratações e reajustes; acima do máximo, o excesso precisa ser eliminado em até dois quadrimestres, sob pena de sanções.",
        explanations: [
          "Queda da receita corrente líquida, que reduz o limite em reais.",
          "Reajustes do piso nacional (magistério, enfermagem) e novas contratações.",
          "Diferença de método: o percentual é o declarado pelo próprio ente, e o TCE-SE pode chegar a outro valor ao analisar as contas.",
        ],
        check: [transparency, TCE],
        magnitude: c.value! / c.threshold!,
      });
    }
  }

  const { paid, planned, authorized, revenue } = entity;

  // 1. Budget heavily revised during the year
  const paidVsPlanned = ratio(paid, planned);
  if (paidVsPlanned != null && paidVsPlanned >= 1.25) {
    add({
      rule: "budget-revised",
      title: RULES["budget-revised"].label,
      fact: `${who} pagou ${formatBRLShort(paid)}, o equivalente a ${formatPercent(paidVsPlanned)} do orçamento aprovado em lei para ${year} (${formatBRLShort(planned)}).`,
      why: "O orçamento aprovado é o compromisso público de como o dinheiro será usado. Quando o gasto real supera muito o previsto, boa parte das decisões foi tomada ao longo do ano, por créditos adicionais, com menos debate público.",
      explanations: [
        "Receita maior que a esperada (royalties, transferências extras da União).",
        "Orçamento inicial subestimado.",
        "Uso de saldo em caixa de anos anteriores.",
      ],
      check: [legislature, TCE],
      magnitude: paidVsPlanned,
    });
  }

  // 2. Low execution
  const execution = ratio(paid, authorized);
  if (execution != null && execution < 0.75) {
    add({
      rule: "low-execution",
      title: RULES["low-execution"].label,
      fact: `Do orçamento autorizado de ${formatBRLShort(authorized)} para ${year}, foram pagos ${formatBRLShort(paid)} (${formatPercent(execution)}).`,
      why: "Dinheiro autorizado que não foi pago no ano não virou serviço, obra ou compra naquele ano.",
      explanations: [
        "Obras e contratos atrasados, com pagamento deixado para o ano seguinte (restos a pagar).",
        "Receita abaixo do previsto: o orçamento foi autorizado, mas o dinheiro não entrou.",
        "Orçamento superestimado na origem.",
      ],
      check: [transparency, TCE],
      magnitude: 1 - execution,
    });
  }

  if (revenue) {
    // 3. Royalty dependence
    const royaltyShare = ratio(revenue.sources.royalties, revenue.total);
    if (royaltyShare != null && royaltyShare >= 0.15) {
      add({
        rule: "royalty-dependence",
        title: RULES["royalty-dependence"].label,
        fact: `${formatPercent(royaltyShare)} da receita de ${year} (${formatBRLShort(revenue.sources.royalties)}) veio de royalties e compensações por petróleo, gás, energia ou mineração.`,
        why: "Royalties variam com a produção e o preço do petróleo e podem cair de um ano para o outro. Gastos permanentes (salários, custeio) apoiados nessa receita ficam em risco.",
        explanations: [
          "Produção de petróleo, gás, energia ou minério no território do município.",
          "Mudanças nas regras de distribuição ou na produção dos campos.",
        ],
        check: [
          "Agência Nacional do Petróleo, ANP (valores de royalties distribuídos por município)",
          `${transparency}: em que foram aplicados os royalties`,
        ],
        magnitude: royaltyShare,
      });
    }

    // 4. Loans
    const loanShare = ratio(revenue.sources.loans, revenue.total);
    if (loanShare != null && loanShare >= 0.05) {
      add({
        rule: "loans",
        title: RULES.loans.label,
        fact: `${formatBRLShort(revenue.sources.loans)} (${formatPercent(loanShare)} da receita de ${year}) vieram de empréstimos.`,
        why: "Empréstimos financiam investimentos hoje, mas são pagos com juros pelas gestões seguintes.",
        explanations: [
          "Financiamento de obras de infraestrutura (drenagem, pavimentação, mobilidade).",
          "Programas federais de crédito para investimento.",
        ],
        check: [`${legislature}: leis que autorizaram os empréstimos`, TCE],
        magnitude: loanShare,
      });
    }

    // 5. Spent above revenue
    const paidVsRevenue = ratio(paid, revenue.total);
    if (paidVsRevenue != null && paidVsRevenue > 1.03) {
      add({
        rule: "spent-above-revenue",
        title: RULES["spent-above-revenue"].label,
        fact: `${who} pagou ${formatBRLShort(paid)} e arrecadou ${formatBRLShort(revenue.total)} em ${year}: ${formatBRLShort(paid! - revenue.total)} a mais do que entrou.`,
        why: "Gastar acima da receita do ano só é possível usando dinheiro guardado de anos anteriores. Se isso se repete, o caixa se esgota.",
        explanations: [
          "Uso de saldo acumulado em anos anteriores (superávit financeiro).",
          "Recursos recebidos no fim do ano anterior e gastos neste.",
        ],
        check: ["Balanço anual e relatório de gestão fiscal (RGF)", TCE],
        magnitude: paidVsRevenue,
      });
    }
  }

  // 6. Spending jump
  const previous = getEntityYear(entityCode, year - 1);
  const growth = previous?.paid ? ratio(paid, previous.paid) : null;
  if (growth != null && growth >= 1.35) {
    add({
      rule: "spending-jump",
      title: RULES["spending-jump"].label,
      fact: `O gasto pago passou de ${formatBRLShort(previous!.paid)} em ${year - 1} para ${formatBRLShort(paid)} em ${year}, alta de ${formatPercent(growth - 1)}.`,
      why: "Um aumento grande em um único ano muda a escala do que a gestão administra e merece saber para onde foi o dinheiro novo.",
      explanations: [
        "Nova receita (royalties, repasses extras, empréstimos).",
        "Obras de grande porte concentradas no ano.",
        "Reajustes de pessoal ou novos serviços.",
      ],
      check: [transparency, TCE],
      magnitude: growth,
    });
  }

  if (!isState) insights.push(...getPeerInsights(entityCode, year));
  return insights;
}

/** Rules that compare a municipality with others of the same population size. */
function getPeerInsights(code: string, year: number): Insight[] {
  const rows = getMunicipalityRows(year);
  const self = rows.find((r) => r.code === code);
  if (!self?.sizeClass || self.paidPerCapita == null) return [];
  const peers = rows.filter((r) => r.sizeClass?.id === self.sizeClass!.id);
  const { transparency } = oversight(false);
  const insights: Insight[] = [];
  const sizeLabel = self.sizeClass.label.toLowerCase();

  // 7. High total spending per capita, with revenue context
  const peerMedian = median(peers.map((r) => r.paidPerCapita));
  const spendRatio = ratio(self.paidPerCapita, peerMedian);
  if (spendRatio != null && spendRatio >= 1.5) {
    const revenueRatio = ratio(self.revenuePerCapita, median(peers.map((r) => r.revenuePerCapita)));
    const revenueContext =
      revenueRatio != null && revenueRatio >= 1.3
        ? `A receita por habitante também é ${times(revenueRatio)} a mediana do grupo: o gasto alto acompanha uma receita alta.`
        : `Já a receita por habitante é ${revenueRatio == null ? "desconhecida" : `${times(revenueRatio)} a mediana`}, o que torna o gasto alto menos explicado pela arrecadação.`;
    insights.push({
      rule: "high-spending-per-capita",
      entityCode: code,
      year,
      title: RULES["high-spending-per-capita"].label,
      fact: `A prefeitura pagou ${formatBRL(self.paidPerCapita)} por habitante, ${times(spendRatio)} a mediana dos municípios com ${sizeLabel} (${formatBRL(peerMedian)}). ${revenueContext}`,
      why: "Municípios de porte parecido costumam ter custos parecidos por morador. Uma diferença grande pede explicação.",
      explanations: [
        "Receita extra (royalties, ICMS de grandes empresas ou usinas instaladas no município).",
        "Piso do FPM: municípios muito pequenos recebem um valor mínimo, que rende muito por habitante.",
        "População subestimada na base usada pelo Tesouro.",
      ],
      check: [transparency, TCE],
      question: RULES["high-spending-per-capita"].question(year, ""),
      magnitude: spendRatio,
    });
  }

  // 8. Areas far above peers (only relevant areas, top 2). Previdência is left
  // out: it depends on whether the municipality has its own pension fund.
  const entity = getEntityYear(code, year)!;
  const areaInsights = Object.entries(entity.byFunction)
    .filter(([fn, v]) => fn !== "09" && (ratio(v.paid, entity.paid) ?? 0) >= AREA_MIN_SHARE)
    .map(([fn, v]) => {
      const perCapita = ratio(v.paid, entity.population)!;
      const peerArea = median(getMunicipalityRows(year, fn).filter((r) => r.sizeClass?.id === self.sizeClass!.id).map((r) => r.paidPerCapita));
      return { fn, perCapita, peerArea, r: ratio(perCapita, peerArea) };
    })
    .filter((a) => (a.peerArea ?? 0) >= AREA_MIN_PEER_MEDIAN && a.r != null && a.r >= AREA_MIN_RATIO)
    .sort((a, b) => b.r! - a.r!)
    .slice(0, 2);

  for (const a of areaInsights) {
    const name = FUNCTIONS[a.fn];
    insights.push({
      rule: "area-above-peers",
      entityCode: code,
      year,
      title: `${name}: gasto muito acima do mesmo porte`,
      fact: `Foram ${formatBRL(a.perCapita)} por habitante em ${name}, ${times(a.r!)} a mediana dos municípios com ${sizeLabel} (${formatBRL(a.peerArea)}).`,
      why: `A área ${name} ocupa uma fatia do orçamento bem maior que em municípios parecidos.`,
      explanations: [
        "Serviço que atende moradores de municípios vizinhos (hospital regional, transporte escolar).",
        "Forma de classificar despesas: algumas prefeituras lançam em uma área gastos que outras distribuem entre várias.",
        "Investimento pontual concentrado no ano.",
      ],
      check: [`${transparency}: filtrar a função ${name}`, TCE],
      question: RULES["area-above-peers"].question(year, `${name}:`),
      magnitude: a.r!,
    });
  }
  return insights;
}

export type StateHighlight = { rule: RuleId; items: (Insight & { name: string; slug: string })[]; total: number };

/** For the overview: the most unusual cases of each rule across all municipalities. */
export function getStateHighlights(year: number, perRule = 3): StateHighlight[] {
  const all = getMunicipalityRows(year).flatMap((r) => getInsights(r.code, year));
  const byRule = new Map<RuleId, Insight[]>();
  for (const i of all) byRule.set(i.rule, [...(byRule.get(i.rule) ?? []), i]);

  return (Object.keys(RULES) as RuleId[])
    .filter((rule) => byRule.has(rule))
    .map((rule) => {
      const list = byRule.get(rule)!.sort((a, b) => b.magnitude - a.magnitude);
      // One entry per municipality (area rule can fire twice for the same place)
      const unique = list.filter((i, idx) => list.findIndex((j) => j.entityCode === i.entityCode) === idx);
      return {
        rule,
        total: unique.length,
        items: unique.slice(0, perRule).map((i) => {
          const m = getMunicipalityByCode(i.entityCode)!;
          return { ...i, name: m.name, slug: m.slug };
        }),
      };
    });
}

export function countMunicipalitiesWithInsights(year: number) {
  return getMunicipalityRows(year).filter((r) => getInsights(r.code, year).length > 0).length;
}
