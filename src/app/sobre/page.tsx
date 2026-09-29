import type { Metadata } from "next";
import Link from "next/link";
import { DataTable, Td, Th } from "@/components/ui/DataTable";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import { CHANGELOG, DOWNLOADED_AT, IPCA, LATEST_YEAR, SOURCES, SOURCE_URLS, YEARS } from "@/features/budget/data";
import { RULES } from "@/features/insights/rules";
import { mapSource } from "@/features/map/geo";
import { formatBRLShort } from "@/lib/format";
import { GLOSSARY } from "@/lib/glossary";

export const metadata: Metadata = { title: "Metodologia" };

const date = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR");

export default function AboutPage() {
  const first = YEARS[YEARS.length - 1];
  const last = YEARS[0];

  return (
    <>
      <PageHeader
        eyebrow="Transparência"
        title="Metodologia"
        description={
          <p>
            De onde vêm os números, como são calculados e o que cada termo significa. Este portal é independente e
            apartidário: não opina, não classifica gestões como boas ou ruins e mostra apenas dados oficiais.
          </p>
        }
      />

      <Section id="glossario" title="Glossário">
        <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {Object.entries(GLOSSARY).map(([id, g]) => (
            <div key={id} id={`glossario-${id}`} className="border-l-2 border-brand-300 pl-4">
              <dt className="font-semibold text-brand-800">{g.term}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-ink-700">{g.text}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="fontes" title="Fontes">
        <ul className="space-y-3 text-ink-700">
          <li>
            <strong className="text-ink-900">Orçamento previsto, atualizado e liquidado:</strong> {SOURCES.planned}.
          </li>
          <li>
            <strong className="text-ink-900">Gasto pago e população:</strong> {SOURCES.paid}.
          </li>
          <li>
            <strong className="text-ink-900">Receita por origem:</strong> {SOURCES.revenue}.
          </li>
          <li>
            <strong className="text-ink-900">Mínimos de educação, saúde e Fundeb:</strong> {SOURCES.legalMinimums}.
          </li>
          <li>
            <strong className="text-ink-900">Gasto com pessoal:</strong> {SOURCES.personnel}.
          </li>
          <li>
            <strong className="text-ink-900">Inflação:</strong> {IPCA.source}.
          </li>
          <li>
            <strong className="text-ink-900">Acesso:</strong> API de dados abertos do SICONFI ({SOURCE_URLS.siconfi}),
            anos {first} a {last}, consultada em {date(DOWNLOADED_AT)}. Cada página de município tem os links diretos
            para as consultas usadas.
          </li>
          <li>
            <strong className="text-ink-900">Mapa:</strong> {mapSource.label}, malha de {mapSource.period}.
          </li>
          <li>
            <strong className="text-ink-900">Territórios:</strong> {SOURCES.territories}
          </li>
          <li>
            <strong className="text-ink-900">Baixar tudo:</strong>{" "}
            {[...YEARS].map((y, i) => (
              <span key={y}>
                {i > 0 && " · "}
                <Link href={`/dados/municipios?ano=${y}`} className="text-brand-700 hover:underline">
                  CSV {y}
                </Link>
              </span>
            ))}
          </li>
        </ul>
      </Section>

      <Section id="metodologia" title="Como os números são calculados">
        <ul className="list-disc space-y-2 pl-5 text-ink-700">
          <li>Os valores são os declarados por cada prefeitura e pelo Governo do Estado ao Tesouro Nacional. O portal não corrige nem estima valores; dado ausente aparece como &ldquo;não declarado&rdquo;.</li>
          <li>Valores em reais de cada ano. No gráfico de evolução, por padrão, os anos anteriores são corrigidos pelo IPCA para reais de {IPCA.baseYear} (média anual do índice).</li>
          <li>O orçamento previsto e o atualizado vêm do relatório bimestral (RREO) do fim do ano; o gasto pago vem da declaração anual (DCA). Por serem relatórios diferentes, o pago pode passar levemente de 100% do autorizado.</li>
          <li>Gasto por habitante = gasto pago dividido pela população informada pelo Tesouro para aquele ano.</li>
          <li>Receita = receitas realizadas no ano, sem operações intraorçamentárias e já descontadas as deduções (parte que vai para o Fundeb e, no caso do Estado, a cota do ICMS e do IPVA que pertence aos municípios).</li>
          <li>Mínimos de educação e saúde e gasto com pessoal são os percentuais declarados pelo próprio ente. O Tribunal de Contas pode chegar a valores diferentes ao analisar as contas.</li>
          <li>Comparações usam a <strong>mediana</strong>: dos 75 municípios, dos municípios do mesmo território e dos municípios do mesmo porte.</li>
          <li>O porte usa faixas de população: até 10 mil, 10 a 20 mil, 20 a 50 mil, 50 a 100 mil e mais de 100 mil habitantes.</li>
          <li>No mapa, os municípios são divididos em 5 grupos com a mesma quantidade (quintis). A cor mostra a posição relativa, não um julgamento.</li>
        </ul>
      </Section>

      <Section id="criterios" title="Critérios dos pontos de atenção">
        <p className="mb-4 max-w-3xl text-ink-700">
          Os pontos de atenção são calculados automaticamente, com os mesmos limites para todos os municípios e para o
          Governo do Estado. Eles indicam o que foge do padrão, não o que é irregular: cada um vem com explicações
          legítimas possíveis, os órgãos onde a informação pode ser conferida e uma pergunta pronta para enviar a quem
          decide.
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

      <Section id="atualizacoes" title="Histórico de atualizações">
        <p className="text-ink-700">
          Última consulta ao Tesouro Nacional: <strong>{date(DOWNLOADED_AT)}</strong>. Ano mais recente disponível:{" "}
          {LATEST_YEAR}. Quando um município corrige (retifica) uma declaração, a diferença é registrada aqui.
        </p>
        {CHANGELOG.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">Nenhuma retificação registrada desde o início do acompanhamento.</p>
        ) : (
          <div className="mt-4 space-y-5">
            {CHANGELOG.map((entry) => (
              <div key={entry.date}>
                <p className="font-semibold text-ink-900">{date(entry.date)}</p>
                <ul className="mt-1 space-y-1 text-sm text-ink-700">
                  {entry.changes.map((c, i) => (
                    <li key={i}>
                      {c.name}, {c.year}: {c.field.toLowerCase()} passou de {formatBRLShort(c.before)} para{" "}
                      {formatBRLShort(c.after)}.
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
