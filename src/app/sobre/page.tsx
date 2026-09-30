import type { Metadata } from "next";
import Link from "next/link";
import { DataTable, Td, Th } from "@/components/ui/DataTable";
import { DownloadIcon } from "@/components/ui/Icons";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import SectionNav from "@/components/ui/SectionNav";
import { CHANGELOG, DOWNLOADED_AT, IPCA, LATEST_YEAR, SOURCE_URLS, SOURCES, YEARS } from "@/features/budget/data";
import { getStateHighlights, RULES, type RuleId } from "@/features/insights/rules";
import { mapSource } from "@/features/map/geo";
import { formatBRLShort, formatDate } from "@/lib/format";
import { GLOSSARY } from "@/lib/glossary";

export const metadata: Metadata = { title: "Sobre os dados" };

const CHAPTERS = [
  { id: "principios", label: "Princípios" },
  { id: "glossario", label: "Glossário" },
  { id: "fontes", label: "Fontes" },
  { id: "metodologia", label: "Metodologia" },
  { id: "criterios", label: "Critérios" },
  { id: "atualizacoes", label: "Atualizações" },
];
const eyebrow = (id: string) => {
  const i = CHAPTERS.findIndex((c) => c.id === id);
  return `${i + 1} · ${CHAPTERS[i].label}`;
};

const PRINCIPLES = [
  { title: "Apartidário", text: "Não opina, não classifica gestões como boas ou ruins e não induz voto. Ordenar por um número é permitido; qualificar, não." },
  { title: "Fiscalizador, não acusador", text: "Aponta o que foge do padrão, com critério público e igual para todos, explicações legítimas possíveis e onde conferir." },
  { title: "Só dados públicos e citados", text: "Todo número vem de fonte oficial, com o ano e o link da consulta. Dado ausente aparece como “não declarado”, nunca como zero." },
];

export default function AboutPage() {
  const first = YEARS[YEARS.length - 1];
  const last = YEARS[0];
  const counts = new Map(getStateHighlights(LATEST_YEAR).map((h) => [h.rule, h.total]));

  return (
    <article id="topo">
      <PageHeader
        breadcrumb={[{ label: "Início", href: "/" }, { label: "Sobre" }]}
        eyebrow="Transparência"
        title="Sobre os dados"
        description="De onde vêm os números, como são calculados e o que cada termo significa. Este portal é independente e apartidário e mostra apenas dados oficiais."
      />
      <SectionNav title="Seções" items={CHAPTERS} />

      <div className="page flex flex-col gap-5 pt-6 lg:pt-10">
        <Section id="principios" eyebrow={eyebrow("principios")} title="Três regras valem para todas as páginas">
          <div className="grid gap-4 md:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="rounded-lg border border-paper-200 p-5">
                <h3 className="text-[17px] font-semibold text-ink-900">{p.title}</h3>
                <p className="mt-1.5 text-[15px] leading-[23px] text-ink-700">{p.text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="glossario" eyebrow={eyebrow("glossario")} title="O que cada termo significa" backToTop>
          <dl className="grid gap-x-12 gap-y-6 md:grid-cols-2">
            {Object.entries(GLOSSARY).map(([id, g]) => (
              <div key={id} id={`glossario-${id}`} className="scroll-mt-20 border-l-2 border-brand-300 pl-4 target:border-brand-700 target:bg-brand-50">
                <dt className="text-base font-semibold text-ink-900">{g.term}</dt>
                <dd className="mt-1 text-[15px] leading-relaxed text-ink-700">{g.text}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="fontes" eyebrow={eyebrow("fontes")} title="De onde vêm os números" backToTop>
          <dl className="flex flex-col border-t border-paper-200">
            {[
              ["Orçamento previsto, atualizado e liquidado", SOURCES.planned],
              ["Gasto pago e população", SOURCES.paid],
              ["Receita por origem", SOURCES.revenue],
              ["Mínimos de educação, saúde e Fundeb", SOURCES.legalMinimums],
              ["Gasto com pessoal", SOURCES.personnel],
              ["Inflação", IPCA.source],
              ["Mapa", `${mapSource.label}, malha de ${mapSource.period}`],
              ["Territórios", SOURCES.territories],
              ["Acesso", `API de dados abertos do SICONFI (${SOURCE_URLS.siconfi}), anos ${first} a ${last}, consultada em ${formatDate(DOWNLOADED_AT)}. Cada raio-x tem os links diretos das consultas usadas.`],
            ].map(([label, text]) => (
              <div key={label} className="grid gap-x-8 gap-y-1 border-b border-paper-200 py-3.5 md:grid-cols-[16rem_minmax(0,1fr)]">
                <dt className="font-semibold text-ink-900">{label}</dt>
                <dd className="text-[15px] leading-relaxed break-words text-ink-700">{text}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-semibold text-ink-900">Baixar tudo (CSV):</span>
            {[...YEARS].reverse().map((y) => (
              <a key={y} href={`/dados/municipios?ano=${y}`} className="btn btn-secondary min-h-9 px-3 text-sm">
                <DownloadIcon /> {y}
              </a>
            ))}
          </div>
        </Section>

        <Section id="metodologia" eyebrow={eyebrow("metodologia")} title="Como os números são calculados" backToTop>
          <ul className="max-w-[50rem] list-disc space-y-2.5 pl-5 text-body text-ink-700">
            <li>Os valores são os declarados por cada prefeitura e pelo Governo do Estado ao Tesouro Nacional. O portal não corrige nem estima valores; dado ausente aparece como &ldquo;não declarado&rdquo;.</li>
            <li>Valores em reais de cada ano. No gráfico de evolução, por padrão, os anos anteriores são corrigidos pelo IPCA para reais de {IPCA.baseYear} (média anual do índice).</li>
            <li>O orçamento previsto e o atualizado vêm do relatório bimestral (RREO) do fim do ano; o gasto pago vem da declaração anual (DCA). Por serem relatórios diferentes, o pago pode passar levemente de 100% do autorizado.</li>
            <li>Gasto por habitante = gasto pago dividido pela população informada pelo Tesouro para aquele ano. Somas de vários municípios dividem só pela população de quem declarou.</li>
            <li>Receita = receitas realizadas no ano, sem operações intraorçamentárias e já descontadas as deduções (parte que vai para o Fundeb e, no caso do Estado, a cota do ICMS e do IPVA que pertence aos municípios).</li>
            <li>Mínimos de educação e saúde e gasto com pessoal são os percentuais declarados pelo próprio ente. O Tribunal de Contas pode chegar a valores diferentes ao analisar as contas.</li>
            <li>Comparações usam a <strong className="font-semibold text-ink-900">mediana</strong>: dos 75 municípios, dos municípios do mesmo território e dos municípios do mesmo porte.</li>
            <li>O porte usa faixas de população: até 10 mil, 10 a 20 mil, 20 a 50 mil, 50 a 100 mil e mais de 100 mil habitantes.</li>
            <li>No mapa, os municípios são divididos em 5 grupos com a mesma quantidade (quintis). A cor mostra a posição relativa, não um julgamento.</li>
          </ul>
        </Section>

        <Section
          id="criterios"
          eyebrow={eyebrow("criterios")}
          title="Critérios dos pontos de atenção"
          description="Calculados automaticamente, com os mesmos limites para todos os municípios e para o Governo do Estado. Indicam o que foge do padrão, não o que é irregular: cada um vem com explicações legítimas possíveis, onde conferir e uma pergunta pronta."
          backToTop
        >
          <DataTable minWidth={620} caption="Critérios dos pontos de atenção">
            <thead>
              <tr>
                <Th>Ponto de atenção</Th>
                <Th>Quando aparece</Th>
                <Th align="right">Municípios em {LATEST_YEAR}</Th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(RULES) as RuleId[]).map((id) => (
                <tr key={id}>
                  <Td className="font-medium text-ink-900">{RULES[id].label}</Td>
                  <Td>{RULES[id].threshold}</Td>
                  <Td align="right">{counts.get(id) ?? 0}</Td>
                </tr>
              ))}
            </tbody>
          </DataTable>
          <p className="text-[15px] text-ink-700">
            Veja os municípios com pontos de atenção na{" "}
            <Link href={`/municipios?ano=${LATEST_YEAR}&atencao=sim&ordem=atencao`} className="link">
              lista de municípios
            </Link>
            .
          </p>
        </Section>

        <Section id="atualizacoes" eyebrow={eyebrow("atualizacoes")} title="Histórico de atualizações" backToTop>
          <p className="text-body text-ink-700">
            Última consulta ao Tesouro Nacional: <strong className="font-semibold text-ink-900">{formatDate(DOWNLOADED_AT)}</strong>. Ano
            mais recente disponível: {LATEST_YEAR}. Quando um ente corrige (retifica) uma declaração, a diferença é registrada aqui.
          </p>
          {CHANGELOG.length === 0 ? (
            <p className="text-sm text-ink-500">Nenhuma retificação registrada desde o início do acompanhamento.</p>
          ) : (
            <div className="flex flex-col gap-5">
              {CHANGELOG.map((entry) => (
                <div key={entry.date}>
                  <p className="font-semibold text-ink-900">{formatDate(entry.date)}</p>
                  <ul className="mt-1 space-y-1 text-[15px] text-ink-700">
                    {entry.changes.map((c, i) => (
                      <li key={i}>
                        {c.name}, {c.year}: {c.field.toLowerCase()} passou de {formatBRLShort(c.before)} para {formatBRLShort(c.after)}.
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </article>
  );
}
