/** Plain-language definitions shared by the glossary page and inline <Term> tooltips. */
export const GLOSSARY = {
  "orcamento-previsto": {
    term: "Orçamento previsto (dotação inicial)",
    text: "Quanto a Lei Orçamentária Anual (LOA), aprovada pela Câmara de Vereadores ou pela Assembleia Legislativa, autorizou gastar no ano.",
  },
  "orcamento-atualizado": {
    term: "Orçamento atualizado (dotação atualizada)",
    text: "O orçamento previsto depois dos ajustes feitos ao longo do ano (créditos adicionais, remanejamentos). É o limite de gasto que valeu de fato.",
  },
  empenho: {
    term: "Empenho",
    text: "Primeira etapa do gasto: o governo reserva o dinheiro para uma despesa específica, como um contrato.",
  },
  liquidacao: {
    term: "Liquidação",
    text: "Segunda etapa: o governo confirma que o serviço foi prestado ou o produto foi entregue.",
  },
  pagamento: {
    term: "Pagamento (gasto real)",
    text: "Última etapa: o dinheiro sai do caixa. É o número que este portal chama de gasto real.",
  },
  execucao: {
    term: "Orçamento executado",
    text: "Gasto real dividido pelo orçamento atualizado. Mostra quanto do que foi autorizado virou pagamento no mesmo ano.",
  },
  funcao: {
    term: "Função (área)",
    text: "Classificação nacional que diz em qual área o dinheiro foi gasto: Saúde, Educação, Urbanismo etc. Vale igual para todos, o que permite comparar.",
  },
  "encargos-especiais": {
    term: "Encargos especiais",
    text: "Despesas que não se ligam a um serviço específico, como pagamento de dívidas e precatórios.",
  },
  intraorcamentarias: {
    term: "Despesas intraorçamentárias",
    text: "Pagamentos entre órgãos do próprio governo (por exemplo, a prefeitura pagando seu instituto de previdência). Ficam fora dos números para não contar o mesmo dinheiro duas vezes.",
  },
  fpm: {
    term: "FPM (Fundo de Participação dos Municípios)",
    text: "Parte do Imposto de Renda e do IPI que a União divide com os municípios. Municípios muito pequenos recebem um valor mínimo, o que faz a receita por habitante deles ser alta.",
  },
  royalties: {
    term: "Royalties e compensações financeiras",
    text: "Pagamentos pela exploração de petróleo, gás, energia hidrelétrica e minérios no território. Variam com a produção e com o preço do petróleo.",
  },
  fundeb: {
    term: "Fundeb",
    text: "Fundo que junta parte dos impostos e redistribui para a educação básica conforme o número de alunos matriculados.",
  },
  rcl: {
    term: "Receita corrente líquida (RCL)",
    text: "Receita do ano sem empréstimos e sem valores que apenas passam pelo caixa. É a base usada pela Lei de Responsabilidade Fiscal para os limites de gasto com pessoal e de dívida.",
  },
  "minimo-educacao": {
    term: "Mínimo da educação (25%)",
    text: "A Constituição (art. 212) obriga estados e municípios a aplicar pelo menos 25% da receita de impostos na manutenção e desenvolvimento do ensino.",
  },
  "minimo-saude": {
    term: "Mínimo da saúde (15% e 12%)",
    text: "A Lei Complementar 141/2012 obriga municípios a aplicar pelo menos 15% da receita de impostos em ações e serviços públicos de saúde; os estados, 12%.",
  },
  "limite-pessoal": {
    term: "Limite de gasto com pessoal",
    text: "A Lei de Responsabilidade Fiscal limita o gasto do Poder Executivo com pessoal a 54% da RCL nos municípios e 49% nos estados. Há avisos antes: limite de alerta (90% do máximo) e prudencial (95%).",
  },
  ipca: {
    term: "Correção pela inflação (IPCA)",
    text: "Valores de anos anteriores convertidos para reais do ano mais recente pelo IPCA, o índice oficial de inflação do IBGE. Assim dá para saber se o gasto cresceu de verdade.",
  },
  mediana: {
    term: "Mediana",
    text: "O valor do meio: metade dos municípios fica acima e metade abaixo. Um único município com valor extremo não a distorce, ao contrário da média.",
  },
  "ponto-de-atencao": {
    term: "Ponto de atenção",
    text: "Padrão fora do comum nos dados oficiais, calculado com os mesmos critérios para todos. Não é acusação: serve para orientar perguntas e indicar onde conferir.",
  },
  territorio: {
    term: "Território de planejamento",
    text: "Agrupamento de municípios vizinhos usado pelo Governo de Sergipe para planejar políticas públicas. São 8 territórios, definidos em 2007.",
  },
  lai: {
    term: "Lei de Acesso à Informação (LAI)",
    text: "Lei 12.527/2011: qualquer pessoa pode pedir informações a órgãos públicos, sem precisar justificar. O prazo de resposta é de 20 dias, prorrogáveis por mais 10.",
  },
} as const;

export type GlossaryId = keyof typeof GLOSSARY;
