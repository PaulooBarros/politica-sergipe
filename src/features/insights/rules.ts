import { FUNCTIONS, getEntityYear, STATE_CODE } from "@/features/budget/data";
import { getMunicipalityRows, median, ratio } from "@/features/budget/metrics";
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
  /** Used to order insights of the same rule (bigger = more unusual). */
  magnitude: number;
};

export type RuleId =
  | "budget-revised"
  | "low-execution"
  | "royalty-dependence"
  | "spending-jump"
  | "loans"
  | "spent-above-revenue"
  | "area-above-peers"
  | "high-spending-per-capita";

export const RULES: Record<RuleId, { label: string; threshold: string }> = {
  "budget-revised": { label: "Gasto muito acima do orçamento aprovado", threshold: "pago ≥ 125% do previsto na lei" },
  "low-execution": { label: "Orçamento pouco executado", threshold: "pago < 75% do autorizado" },
  "royalty-dependence": { label: "Receita dependente de royalties", threshold: "royalties ≥ 15% da receita" },
  "spending-jump": { label: "Salto no gasto de um ano para o outro", threshold: "gasto pago cresceu ≥ 35%" },
  loans: { label: "Receita com peso de empréstimos", threshold: "empréstimos ≥ 5% da receita" },
  "spent-above-revenue": { label: "Gastou mais do que arrecadou", threshold: "pago > 103% da receita do ano" },
  "area-above-peers": {
    label: "Área com gasto muito acima dos municípios do mesmo porte",
    threshold: "≥ 3× a mediana do porte, em áreas com ≥ 8% do gasto (exceto Previdência)",
  },
  "high-spending-per-capita": {
    label: "Gasto por habitante muito acima do mesmo porte",
    threshold: "≥ 1,5× a mediana do porte",
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
  const add = (i: Omit<Insight, "entityCode" | "year">) => insights.push({ ...i, entityCode, year });

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
