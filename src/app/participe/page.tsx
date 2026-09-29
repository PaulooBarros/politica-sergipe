import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import Term from "@/components/ui/Term";
import { getMunicipalityBySlug, MUNICIPALITIES } from "@/features/municipalities/registry";
import LaiRequestBuilder from "@/features/participation/LaiRequestBuilder";

export const metadata: Metadata = { title: "Participe" };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

// Deadlines follow the Constitution (ADCT, art. 35, § 2º) and the LRF. Municipalities
// and the state may set other dates in their own laws (Lei Orgânica, Constituição Estadual).
const CALENDAR = [
  { month: "Fevereiro", title: "Audiência de metas fiscais (3º quadrimestre)", text: "O Executivo apresenta em audiência pública, na Câmara ou na Assembleia, o cumprimento das metas do ano anterior.", law: "LRF, art. 9º, § 4º" },
  { month: "Abril", title: "Proposta da LDO", text: "O Executivo envia a Lei de Diretrizes Orçamentárias: prioridades e metas para o ano seguinte. Prazo de referência: 15 de abril.", law: "ADCT, art. 35, § 2º, II" },
  { month: "Maio", title: "Audiência de metas fiscais (1º quadrimestre)", text: "Nova prestação de contas pública sobre as metas fiscais.", law: "LRF, art. 9º, § 4º" },
  { month: "Julho", title: "Votação da LDO", text: "O Legislativo vota a LDO antes do recesso. É um bom momento para cobrar prioridades junto a vereadores e deputados.", law: "ADCT, art. 35, § 2º, II" },
  { month: "Agosto", title: "Proposta da LOA", text: "O Executivo envia o orçamento do ano seguinte (Lei Orçamentária Anual). Prazo de referência: 31 de agosto. No primeiro ano de mandato, também o Plano Plurianual (PPA).", law: "ADCT, art. 35, § 2º, I e III" },
  { month: "Setembro", title: "Audiência de metas fiscais (2º quadrimestre)", text: "Terceira audiência pública de metas fiscais do ano.", law: "LRF, art. 9º, § 4º" },
  { month: "Set. a dez.", title: "Discussão e emendas da LOA", text: "O Legislativo discute o orçamento e pode propor emendas. A lei exige incentivo à participação popular e audiências públicas durante a elaboração e a discussão dos planos e orçamentos.", law: "LRF, art. 48, § 1º, I" },
  { month: "Dezembro", title: "Votação da LOA", text: "O orçamento é votado até o fim da sessão legislativa (referência: 22 de dezembro) e passa a valer em 1º de janeiro.", law: "ADCT, art. 35, § 2º, III" },
];

const OVERSIGHT = [
  { name: "Câmara Municipal", text: "Vota o orçamento da prefeitura, fiscaliza o Executivo e julga as contas do prefeito com base no parecer do TCE." },
  { name: "Assembleia Legislativa de Sergipe", text: "Vota o orçamento do Estado e fiscaliza o Governo. Site: al.se.leg.br." },
  { name: "Tribunal de Contas do Estado (TCE-SE)", text: "Analisa as contas do Estado e dos 75 municípios e emite pareceres. Recebe denúncias de qualquer cidadão. Site: tce.se.gov.br." },
  { name: "Ministério Público de Sergipe", text: "Pode investigar e propor ações quando há indícios de irregularidade. Site: mpse.mp.br." },
];

export default async function ParticipatePage({ searchParams }: PageProps<"/participe">) {
  const query = await searchParams;
  const slug = first(query.municipio);
  const initialEntity = slug === "estado" || getMunicipalityBySlug(slug) ? slug : "aracaju";
  const entities = [{ slug: "estado", name: "Governo do Estado de Sergipe" }, ...MUNICIPALITIES.map((m) => ({ slug: m.slug, name: m.name }))];

  return (
    <>
      <PageHeader
        eyebrow="Participe"
        title="Do dado à ação"
        description={
          <p>
            Entender as contas é o primeiro passo. Aqui você vê quando o orçamento é decidido, a quem perguntar e como
            fazer um pedido formal de informação.
          </p>
        }
      />

      <Section id="calendario" number="1" title="O calendário do orçamento" description="Os momentos do ano em que o orçamento é proposto, discutido e votado.">
        <ol className="relative space-y-5 border-l-2 border-brand-200 pl-6">
          {CALENDAR.map((c) => (
            <li key={c.title} className="relative">
              <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-brand-500 ring-2 ring-brand-200" aria-hidden />
              <p className="text-xs font-bold uppercase tracking-wide text-brand-700">{c.month}</p>
              <p className="font-semibold text-ink-900">{c.title}</p>
              <p className="text-sm text-ink-700">{c.text}</p>
              <p className="text-xs text-ink-500">{c.law}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-xs text-ink-500">
          Datas de referência da Constituição Federal (ADCT, art. 35) e da Lei de Responsabilidade Fiscal. Cada município
          pode definir prazos próprios na sua Lei Orgânica, e o Estado na Constituição Estadual: confirme na Câmara ou na
          Assembleia.
        </p>
      </Section>

      <Section id="quem-fiscaliza" number="2" title="Quem fiscaliza">
        <div className="grid gap-4 sm:grid-cols-2">
          {OVERSIGHT.map((o) => (
            <div key={o.name} className="rounded-lg border border-paper-200 p-4">
              <p className="font-semibold text-ink-900">{o.name}</p>
              <p className="mt-1 text-sm text-ink-700">{o.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="pedido"
        number="3"
        title="Faça um pedido de informação"
        description={
          <p>
            Pela <Term id="lai">Lei de Acesso à Informação</Term>, qualquer pessoa pode pedir dados a um órgão público, sem
            justificar. Monte o texto abaixo, copie e envie pelo e-SIC do órgão.
          </p>
        }
      >
        <LaiRequestBuilder
          key={`${initialEntity}:${first(query.pergunta)}`}
          entities={entities}
          initialEntity={initialEntity}
          initialQuestion={first(query.pergunta)}
        />
      </Section>
    </>
  );
}
