import type { Metadata } from "next";
import { DataTable, Td, Th } from "@/components/ui/DataTable";
import PageHeader from "@/components/ui/PageHeader";
import { RULES } from "@/features/insights/rules";
import Section from "@/components/ui/Section";
import { DOWNLOADED_AT, SOURCES, SOURCE_URLS, YEARS } from "@/features/budget/data";
import { mapSource } from "@/features/map/geo";

export const metadata: Metadata = { title: "Sobre os dados" };

const GLOSSARY = [
  {
    term: "Orçamento previsto (dotação inicial)",
    text: "Quanto a Lei Orçamentária Anual (LOA), aprovada pela Câmara de Vereadores ou pela Assembleia Legislativa, autorizou gastar no ano.",
  },
  {
    term: "Orçamento atualizado (dotação atualizada)",
    text: "O orçamento previsto depois dos ajustes feitos ao longo do ano (créditos adicionais, remanejamentos). É o limite de gasto que valeu de fato.",
  },
  {
    term: "Empenho",
    text: "Primeira etapa do gasto: o governo reserva o dinheiro para uma despesa específica, como um contrato.",
  },
  {
    term: "Liquidação",
    text: "Segunda etapa: o governo confirma que o serviço foi prestado ou o produto foi entregue.",
  },
  {
    term: "Pagamento (gasto real)",
    text: "Última etapa: o dinheiro sai do caixa. É o número que este portal chama de gasto real.",
  },
  {
    term: "Orçamento executado",
    text: "Gasto real dividido pelo orçamento atualizado. Mostra quanto do que foi autorizado virou pagamento no mesmo ano.",
  },
  {
    term: "Função (área)",
    text: "Classificação nacional que diz em qual área o dinheiro foi gasto: Saúde, Educação, Urbanismo etc. Vale igual para todos os municípios, o que permite comparar.",
  },
  {
    term: "Encargos especiais",
    text: "Despesas que não se ligam a um serviço específico, como pagamento de dívidas e precatórios.",
  },
  {
    term: "Despesas intraorçamentárias",
    text: "Pagamentos entre órgãos do próprio governo (por exemplo, a prefeitura pagando seu próprio instituto de previdência). Ficam fora dos números para não contar o mesmo dinheiro duas vezes.",
  },
  {
    term: "FPM (Fundo de Participação dos Municípios)",
    text: "Parte do Imposto de Renda e do IPI que a União divide com os municípios. Municípios muito pequenos recebem um valor mínimo, o que faz a receita por habitante deles ser alta.",
  },
  {
    term: "Royalties e compensações financeiras",
    text: "Pagamentos a estados e municípios pela exploração de petróleo, gás, energia hidrelétrica e minérios em seu território. Variam com a produção e com o preço do petróleo.",
  },
  {
    term: "Mediana",
    text: "O valor do meio: metade dos municípios fica acima e metade abaixo. É usada nas comparações porque um único município com valor extremo não a distorce, ao contrário da média.",
  },
  {
    term: "Ponto de atenção",
    text: "Padrão fora do comum nos dados oficiais, calculado com os mesmos critérios para todos. Não é acusação: serve para orientar perguntas e indicar onde conferir.",
  },
  {
    term: "Território de planejamento",
    text: "Agrupamento de municípios vizinhos usado pelo Governo de Sergipe para planejar políticas públicas. São 8 territórios, definidos em 2007.",
  },
];

export default function AboutPage() {
  const first = YEARS[YEARS.length - 1];
  const last = YEARS[0];

  return (
    <>
      <PageHeader
        eyebrow="Transparência"
        title="Sobre os dados"
        description={
          <p>
            De onde vêm os números, como são calculados e o que cada termo significa. Este portal é independente e
            apartidário: não opina, não classifica gestões como boas ou ruins e mostra apenas dados oficiais.
          </p>
        }
      />

      <Section id="glossario" title="Glossário">
        <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {GLOSSARY.map((g) => (
            <div key={g.term} className="border-t-[3px] border-brand-800 pt-3">
              <dt className="font-semibold text-brand-800">{g.term}</dt>
              <dd className="mt-1 text-ink-700">{g.text}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="fontes" title="Fontes">
        <ul className="space-y-3 text-ink-700">
          <li>
            <strong className="text-ink-900">Orçamento previsto, atualizado e liquidado:</strong> {SOURCES.planned}.
            Anos {first} a {last}.
          </li>
          <li>
            <strong className="text-ink-900">Gasto pago e população:</strong> {SOURCES.paid}. Anos {first} a {last}.
          </li>
          <li>
            <strong className="text-ink-900">Receita por origem:</strong> {SOURCES.revenue}. Anos {first} a {last}.
          </li>
          <li>
            <strong className="text-ink-900">Acesso:</strong> API de dados abertos do SICONFI ({SOURCE_URLS.siconfi}),
            consultada em {new Date(`${DOWNLOADED_AT}T12:00:00`).toLocaleDateString("pt-BR")}.
          </li>
          <li>
            <strong className="text-ink-900">Mapa:</strong> {mapSource.label}, malha de {mapSource.period}.
          </li>
          <li>
            <strong className="text-ink-900">Territórios:</strong> {SOURCES.territories}
          </li>
        </ul>
      </Section>

      <Section id="metodologia" title="Metodologia">
        <ul className="list-disc space-y-2 pl-5 text-ink-700">
          <li>Os valores são os declarados por cada prefeitura e pelo Governo do Estado ao Tesouro Nacional. O portal não corrige nem estima valores; dado ausente aparece como &ldquo;não declarado&rdquo;.</li>
          <li>Valores em reais correntes de cada ano, sem correção pela inflação.</li>
          <li>O orçamento previsto e o atualizado vêm do relatório bimestral (RREO) do fim do ano; o gasto pago vem da declaração anual (DCA). Por serem relatórios diferentes, o pago pode passar levemente de 100% do autorizado.</li>
          <li>Gasto por habitante = gasto pago dividido pela população informada pelo Tesouro para aquele ano.</li>
          <li>Receita = receitas realizadas no ano, sem operações intraorçamentárias e já descontadas as deduções (parte que vai para o Fundeb e, no caso do Estado, a cota do ICMS e do IPVA que pertence aos municípios).</li>
          <li>Comparações usam a <strong>mediana</strong> do gasto por habitante: dos 75 municípios, dos municípios do mesmo território e dos municípios do mesmo porte.</li>
          <li>O porte usa faixas de população: até 10 mil, 10 a 20 mil, 20 a 50 mil, 50 a 100 mil e mais de 100 mil habitantes.</li>
          <li>No mapa, os municípios são divididos em 5 grupos com a mesma quantidade (quintis). A cor mostra a posição relativa, não um julgamento.</li>
        </ul>
      </Section>

      <Section id="criterios" title="Critérios dos pontos de atenção">
        <p className="max-w-3xl text-ink-700">
          Os pontos de atenção são calculados automaticamente, com os mesmos limites para todos os municípios e para o
          Governo do Estado. Eles indicam o que foge do padrão, não o que é irregular: cada um vem com explicações
          legítimas possíveis e com os órgãos onde a informação pode ser conferida (Câmara Municipal ou Assembleia,
          portal da transparência e Tribunal de Contas do Estado).
        </p>
        <DataTable minWidth={560}>
          <thead>
            <tr>
              <Th>Ponto de atenção</Th>
              <Th>Quando aparece</Th>
            </tr>
          </thead>
          <tbody>
            {Object.values(RULES).map((r) => (
              <tr key={r.label}>
                <Td className="font-medium">{r.label}</Td>
                <Td className="text-ink-700">{r.threshold}</Td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </Section>
    </>
  );
}
