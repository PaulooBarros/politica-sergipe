"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/ui/Icons";

type Option = { slug: string; name: string };

type Props = {
  entities: Option[];
  initialEntity: string;
  initialQuestion: string;
  /** Most recent year with data, used in the model questions. */
  year: number;
};

const MODELS = (year: number) => [
  {
    label: "Folha de pagamento",
    hint: "Servidores, cargos e salários",
    text: `Qual a relação de servidores ativos em ${year}, com cargo, tipo de vínculo, lotação e remuneração bruta mensal?`,
  },
  {
    label: "Contratos e licitações",
    hint: "Empresas contratadas e valores",
    text: `Quais contratos foram firmados em ${year}, com objeto, empresa contratada, valor, vigência e processo licitatório correspondente?`,
  },
  {
    label: "Execução do orçamento",
    hint: "Quanto foi gasto em cada área",
    text: `Qual a execução orçamentária de ${year} por função, subfunção e ação, com os valores empenhados, liquidados e pagos?`,
  },
  {
    label: "Obras",
    hint: "Andamento e custo",
    text: `Quais obras estavam em andamento ou foram concluídas em ${year}, com localização, valor contratado, valor pago e percentual executado?`,
  },
];

function Step({ n, children }: { n: number; children: string }) {
  return (
    <span className="flex items-center gap-2 text-[15px] font-semibold text-ink-900">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700" aria-hidden>
        {n}
      </span>
      {children}
    </span>
  );
}

const radio = (on: boolean) =>
  `flex min-h-12 cursor-pointer items-center gap-2.5 rounded-md px-4 text-[15px] font-medium text-ink-900 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-300 ${
    on ? "border-2 border-brand-700 bg-brand-50" : "border border-paper-400 bg-white hover:border-brand-400"
  }`;
const dot = (on: boolean) => `h-[18px] w-[18px] shrink-0 rounded-full bg-white ${on ? "border-[6px] border-brand-700" : "border-2 border-ink-500"}`;

/** Builds a ready-to-send information request under the LAI (Lei 12.527/2011). */
export default function LaiRequestBuilder({ entities, initialEntity, initialQuestion, year }: Props) {
  const [entity, setEntity] = useState(initialEntity);
  const [target, setTarget] = useState<"executivo" | "legislativo">("executivo");
  const [question, setQuestion] = useState(initialQuestion);
  const [copied, setCopied] = useState(false);

  const isState = entity === "estado";
  const name = entities.find((e) => e.slug === entity)?.name ?? "";
  const recipient = isState
    ? target === "executivo"
      ? "Governo do Estado de Sergipe"
      : "Assembleia Legislativa do Estado de Sergipe"
    : target === "executivo"
      ? `Prefeitura Municipal de ${name}`
      : `Câmara Municipal de ${name}`;

  const text = `Ao Serviço de Informação ao Cidadão (SIC) — ${recipient}

Assunto: Pedido de acesso à informação (Lei nº 12.527/2011)

Com base na Lei de Acesso à Informação (Lei nº 12.527/2011), solicito as seguintes informações:

${question.trim() || "[escreva aqui a sua pergunta]"}

Peço que a resposta seja enviada em formato digital e, sempre que possível, em formato aberto (planilha), conforme o art. 8º, § 3º, da Lei nº 12.527/2011.

Lembro que o prazo de resposta é de 20 dias, prorrogável por mais 10 dias mediante justificativa (art. 11), e que, em caso de negativa, tenho direito a recurso (art. 15).

Atenciosamente,
[seu nome]`;

  return (
    <div className="grid items-start gap-x-10 gap-y-8 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <label className="flex flex-col gap-2">
          <Step n={1}>Para qual ente?</Step>
          <span className="relative block">
            <select value={entity} onChange={(e) => setEntity(e.target.value)} className="field h-12 cursor-pointer appearance-none pr-10 font-medium">
              {entities.map((e) => (
                <option key={e.slug} value={e.slug}>
                  {e.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3.5 h-2 w-3 -translate-y-1/2 text-ink-700" />
          </span>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2">
            <Step n={2}>Para quem enviar</Step>
          </legend>
          <div className="flex flex-wrap gap-2">
            {(["executivo", "legislativo"] as const).map((t) => (
              <label key={t} className={radio(target === t)}>
                <input type="radio" name="target" checked={target === t} onChange={() => setTarget(t)} className="sr-only" />
                <span className={dot(target === t)} aria-hidden />
                {t === "executivo" ? (isState ? "Governo do Estado" : "Prefeitura") : isState ? "Assembleia Legislativa" : "Câmara Municipal"}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2">
          <Step n={3}>O que você quer saber</Step>
          <p className="text-[13px] text-ink-500">Comece por um modelo ou escreva a sua pergunta.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {MODELS(year).map((m) => {
              const on = question === m.text;
              return (
                <button key={m.label} type="button" onClick={() => setQuestion(m.text)} aria-pressed={on} className={`${radio(on)} items-start py-3 text-left`}>
                  <span className={`${dot(on)} mt-0.5`} aria-hidden />
                  <span className="flex flex-col gap-0.5">
                    <span className="font-semibold">{m.label}</span>
                    <span className="text-[13px] font-normal text-ink-500">{m.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <label className="mt-2 flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-ink-700">Sua pergunta</span>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              placeholder={`Ex.: Quais foram as 20 maiores despesas de ${year}, com credor, contrato e objeto?`}
              className="field resize-y py-2.5 leading-6"
            />
          </label>
          <p className="text-[13px] text-ink-500">
            Perguntas específicas (ano, área, tipo de documento) recebem respostas melhores. Você não precisa explicar por que
            quer a informação (art. 10, § 3º).
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:sticky lg:top-6">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold tracking-[0.08em] text-ink-500 uppercase">Seu pedido</p>
          <p className="text-[13px] text-ink-500 tabular-nums">{text.length} caracteres</p>
        </div>
        <pre
          className="max-h-[30rem] overflow-auto rounded-lg border border-paper-300 bg-paper-100 p-5 font-serif text-[17px] leading-[27px] whitespace-pre-wrap text-ink-900"
          data-testid="lai-text"
        >
          {text}
        </pre>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {
                // Clipboard blocked: the text remains selectable above.
              }
            }}
            className="btn btn-primary h-12 px-5 text-base"
          >
            <span aria-live="polite">{copied ? "✓ Texto copiado" : "Copiar texto"}</span>
          </button>
        </div>
        <p className="text-[13px] leading-[19px] text-ink-500">
          Envie pelo Serviço de Informação ao Cidadão (e-SIC) no site da prefeitura, da Câmara, do Governo do Estado ou da
          Assembleia. Sem sistema on-line, o pedido pode ser protocolado presencialmente. O portal não envia nem guarda o seu
          pedido; guarde o número de protocolo.
        </p>
      </div>
    </div>
  );
}
