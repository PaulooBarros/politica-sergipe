import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import Term from "@/components/ui/Term";
import { LATEST_YEAR } from "@/features/budget/data";
import { getMunicipalityBySlug, MUNICIPALITIES } from "@/features/municipalities/registry";
import LaiRequestBuilder from "@/features/participation/LaiRequestBuilder";

export const metadata: Metadata = { title: "Participe" };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

const LAWS = [
  { short: "PPA", name: "Plano Plurianual", text: "Metas e programas para 4 anos. Feito no 1º ano de cada mandato.", when: "Vale do 2º ano do mandato ao 1º do mandato seguinte" },
  { short: "LDO", name: "Lei de Diretrizes Orçamentárias", text: "Prioridades e regras para montar o orçamento do ano seguinte.", when: "Votada no meio do ano" },
  { short: "LOA", name: "Lei Orçamentária Anual", text: "O orçamento em si: quanto se prevê arrecadar e gastar em cada área.", when: "Votada até o fim do ano, vale no ano seguinte" },
];

// Reference dates from the Constitution (ADCT, art. 35, § 2º). Months are 1–12; ends are inclusive.
const TRACKS = [
  { law: "PPA", bars: [{ from: 1, to: 8, label: "Executivo elabora (1º ano do mandato)", vote: false }, { from: 9, to: 12, label: "Legislativo vota", vote: true }] },
  { law: "LDO", bars: [{ from: 1, to: 4, label: "Executivo elabora", vote: false }, { from: 5, to: 7, label: "Legislativo vota", vote: true }] },
  { law: "LOA", bars: [{ from: 5, to: 8, label: "Executivo elabora", vote: false }, { from: 9, to: 12, label: "Legislativo vota", vote: true }] },
];
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

// Deadlines follow the Constitution (ADCT, art. 35, § 2º) and the LRF. Municipalities
// and the state may set other dates in their own laws (Lei Orgânica, Constituição Estadual).
const CALENDAR = [
  { month: "Fevereiro", title: "Audiência de metas fiscais (3º quadrimestre)", text: "O Executivo apresenta em audiência pública, na Câmara ou na Assembleia, o cumprimento das metas do ano anterior.", law: "LRF, art. 9º, § 4º" },
  { month: "Até 15 de abril", title: "Proposta da LDO", text: "O Executivo envia a Lei de Diretrizes Orçamentárias: prioridades e metas para o ano seguinte.", law: "ADCT, art. 35, § 2º, II" },
  { month: "Maio", title: "Audiência de metas fiscais (1º quadrimestre)", text: "Nova prestação de contas pública sobre as metas fiscais.", law: "LRF, art. 9º, § 4º" },
  { month: "Até 17 de julho", title: "Votação da LDO", text: "O Legislativo vota a LDO antes do recesso. É um bom momento para cobrar prioridades junto a vereadores e deputados.", law: "ADCT, art. 35, § 2º, II" },
  { month: "Até 31 de agosto", title: "Proposta da LOA", text: "O Executivo envia o orçamento do ano seguinte. No primeiro ano de mandato, também o Plano Plurianual (PPA).", law: "ADCT, art. 35, § 2º, I e III" },
  { month: "Setembro", title: "Audiência de metas fiscais (2º quadrimestre)", text: "Terceira audiência pública de metas fiscais do ano.", law: "LRF, art. 9º, § 4º" },
  { month: "Setembro a dezembro", title: "Discussão e emendas da LOA", text: "O Legislativo discute o orçamento e pode propor emendas. A lei exige incentivo à participação popular e audiências públicas.", law: "LRF, art. 48, § 1º, I" },
  { month: "Até 22 de dezembro", title: "Votação da LOA", text: "O orçamento é votado até o fim da sessão legislativa e passa a valer em 1º de janeiro.", law: "ADCT, art. 35, § 2º, III" },
];

const OVERSIGHT = [
  {
    name: "Câmara Municipal",
    text: "Vota o orçamento da prefeitura, fiscaliza o Executivo e julga as contas do prefeito com base no parecer do TCE.",
    when: "Para acompanhar a votação do orçamento, pedir audiência pública, propor emendas por meio de vereadores ou cobrar o julgamento das contas.",
  },
  {
    name: "Assembleia Legislativa de Sergipe",
    text: "Vota o orçamento do Estado e fiscaliza o Governo.",
    when: "Para acompanhar o orçamento estadual e as audiências públicas sobre ele.",
    link: { href: "https://al.se.leg.br", label: "al.se.leg.br" },
  },
  {
    name: "Tribunal de Contas do Estado (TCE-SE)",
    text: "Analisa as contas do Estado e dos 75 municípios, emite pareceres e fiscaliza licitações e contratos.",
    when: "Para consultar o parecer sobre as contas ou comunicar suspeita de irregularidade. Qualquer cidadão pode fazer denúncia.",
    link: { href: "https://www.tce.se.gov.br", label: "tce.se.gov.br" },
  },
  {
    name: "Ministério Público de Sergipe",
    text: "Pode investigar e propor ações na Justiça quando há indícios de irregularidade.",
    when: "Quando houver indícios de irregularidade que precisem de investigação.",
    link: { href: "https://www.mpse.mp.br", label: "mpse.mp.br" },
  },
];

/** What is happening in the budget cycle this month (reference dates). */
function nowTip(date: Date) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const next = date.getFullYear() + 1;
  if (m === 1) return "O orçamento aprovado no fim do ano passado começou a valer. É um bom momento para ler a LOA e ver o que foi previsto para cada área.";
  if (m === 2) return "Mês da audiência pública de metas fiscais do 3º quadrimestre: o Executivo presta contas do ano anterior no Legislativo.";
  if (m < 4 || (m === 4 && d <= 15)) return "O Executivo prepara a LDO, com as prioridades do orçamento do ano que vem (referência: envio até 15 de abril).";
  if (m < 7 || (m === 7 && d <= 17)) return "A LDO está no Legislativo (referência: votação até 17 de julho). É o momento de cobrar prioridades junto a vereadores e deputados.";
  if (m <= 8) return `O Executivo prepara a proposta de orçamento de ${next} (LOA), que deve chegar ao Legislativo até 31 de agosto.`;
  return `A proposta de orçamento de ${next} (LOA) já deve estar no Legislativo. É um bom momento para pedir a data da audiência pública e ler a proposta.`;
}

export default async function ParticipatePage({ searchParams }: PageProps<"/participe">) {
  const query = await searchParams;
  const slug = first(query.municipio);
  const initialEntity = slug === "estado" || getMunicipalityBySlug(slug) ? slug : "aracaju";
  const entities = [{ slug: "estado", name: "Governo do Estado de Sergipe" }, ...MUNICIPALITIES.map((m) => ({ slug: m.slug, name: m.name }))];
  const today = new Date();
  const todayPosition = (today.getMonth() + (today.getDate() - 1) / 31) / 12;

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Início", href: "/" }, { label: "Participe" }]}
        title="O orçamento é decidido todo ano. Você pode acompanhar e perguntar."
        description="Três leis definem como a prefeitura e o Estado gastam. Todas passam pelo Legislativo, têm prazos conhecidos e devem ter audiências públicas."
      />

      <div className="page flex flex-col gap-10 pt-6 lg:gap-16 lg:pt-8">
        <Section id="calendario" eyebrow="Calendário do orçamento" title="Plano, diretrizes e orçamento: quem faz, e quando">
          <div className="grid gap-3 md:grid-cols-3">
            {LAWS.map((l) => (
              <div key={l.short} className="flex flex-col gap-1.5 rounded-lg border border-paper-200 p-4">
                <p className="flex items-baseline gap-2">
                  <span className="font-serif text-[1.75rem] font-bold text-brand-700">{l.short}</span>
                  <span className="text-sm font-semibold text-ink-900">{l.name}</span>
                </p>
                <p className="text-[15px] leading-[23px] text-ink-700">{l.text}</p>
                <p className="text-[13px] text-ink-500">{l.when}</p>
              </div>
            ))}
          </div>

          <div
            role="img"
            aria-label="Linha do tempo de referência do ciclo do orçamento ao longo do ano"
            className="relative hidden grid-cols-[72px_repeat(12,minmax(0,1fr))] gap-y-2.5 md:grid"
          >
            <span />
            {MONTHS.map((m) => (
              <span key={m} className="border-b border-paper-200 pb-1.5 text-center text-xs font-semibold text-ink-500 uppercase">
                {m}
              </span>
            ))}
            {TRACKS.map((t, row) => (
              <div key={t.law} className="contents">
                <span className="self-center text-sm font-semibold text-ink-900" style={{ gridColumn: 1, gridRow: row + 2 }}>
                  {t.law}
                </span>
                {t.bars.map((b) => (
                  <span
                    key={b.label}
                    className={`mx-0.5 flex h-8 items-center overflow-hidden rounded px-2 text-xs font-semibold whitespace-nowrap ${b.vote ? "bg-brand-700 text-white" : "bg-brand-100 text-brand-800"}`}
                    style={{ gridColumn: `${b.from + 1} / ${b.to + 2}`, gridRow: row + 2 }}
                  >
                    {b.label}
                  </span>
                ))}
              </div>
            ))}
            <span
              className="pointer-events-none absolute top-6 -bottom-1.5 border-l-2 border-ink-900"
              style={{ left: `calc(72px + (100% - 72px) * ${todayPosition})` }}
              aria-hidden
            >
              <span className="absolute -top-5 -left-[30px] w-[60px] text-center text-[11px] font-bold text-ink-900">HOJE</span>
            </span>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-brand-200 bg-brand-50 p-4">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-700 text-sm font-bold text-white" aria-hidden>
              i
            </span>
            <p className="text-[15px] leading-[23px] text-ink-700">
              <strong className="font-semibold text-ink-900">
                Agora, em {today.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}:
              </strong>{" "}
              {nowTip(today)} Os prazos exatos estão na Lei Orgânica de cada município e na Constituição do Estado.
            </p>
          </div>

          <div>
            <h3 className="text-[17px] font-semibold text-ink-900">Passo a passo do ano</h3>
            <ol className="mt-4 ml-1.5 grid gap-x-10 gap-y-5 border-l-2 border-brand-200 pl-5 md:grid-cols-2 md:border-l-0 md:pl-0">
              {CALENDAR.map((c) => (
                <li key={c.title} className="relative md:border-l-2 md:border-brand-200 md:pl-5">
                  <span className="absolute top-1 -left-[29px] h-3.5 w-3.5 rounded-full border-2 border-brand-400 bg-white md:-left-[9px]" aria-hidden />
                  <p className="text-[13px] font-semibold text-brand-600">{c.month}</p>
                  <p className="font-semibold text-ink-900">{c.title}</p>
                  <p className="text-[15px] leading-[22px] text-ink-700">{c.text}</p>
                  <p className="mt-0.5 text-xs text-ink-500">{c.law}</p>
                </li>
              ))}
            </ol>
          </div>
          <p className="text-xs leading-[17px] text-ink-500">
            Datas de referência da Constituição Federal (ADCT, art. 35) e da Lei de Responsabilidade Fiscal. Cada município pode
            definir prazos próprios na sua Lei Orgânica, e o Estado na Constituição Estadual: confirme na Câmara ou na
            Assembleia.
          </p>
        </Section>

        <Section id="quem-fiscaliza" variant="plain" eyebrow="Quem fiscaliza" title="Quatro instituições acompanham as contas, cada uma com um papel">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {OVERSIGHT.map((o) => (
              <article key={o.name} className="card flex flex-col gap-2.5 p-5">
                <h3 className="text-[19px] leading-tight font-semibold text-ink-900">{o.name}</h3>
                <p className="text-[15px] leading-[23px] text-ink-700">{o.text}</p>
                <h4 className="mt-1.5 text-xs font-semibold tracking-[0.08em] text-ink-500 uppercase">Quando procurar</h4>
                <p className="text-[15px] leading-[23px] text-ink-700">{o.when}</p>
                {o.link ? (
                  <a href={o.link.href} target="_blank" rel="noopener noreferrer" className="mt-auto pt-1.5 text-[15px] font-semibold text-brand-700 hover:underline">
                    {o.link.label} ↗
                  </a>
                ) : (
                  <p className="mt-auto pt-1.5 text-sm text-ink-500">Cada Câmara tem o próprio site e ouvidoria.</p>
                )}
              </article>
            ))}
          </div>
        </Section>

        <Section
          id="pedido"
          eyebrow="Lei de Acesso à Informação"
          title="Monte um pedido de informação em 1 minuto"
          description={
            <p>
              Pela <Term id="lai">Lei de Acesso à Informação</Term>, qualquer pessoa pode pedir dados a um órgão público, sem
              justificar. O órgão tem até 20 dias para responder, prorrogáveis por mais 10 (Lei 12.527/2011, art. 11).
            </p>
          }
        >
          <LaiRequestBuilder
            key={`${initialEntity}:${first(query.pergunta)}`}
            entities={entities}
            initialEntity={initialEntity}
            initialQuestion={first(query.pergunta)}
            year={LATEST_YEAR}
          />
        </Section>
      </div>
    </>
  );
}
