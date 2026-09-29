"use client";

import { useState } from "react";

type Option = { slug: string; name: string };

type Props = {
  entities: Option[];
  initialEntity: string;
  initialQuestion: string;
};

/** Builds a ready-to-send information request under the LAI (Lei 12.527/2011). */
export default function LaiRequestBuilder({ entities, initialEntity, initialQuestion }: Props) {
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

  const text = `À ${recipient}

Assunto: Pedido de acesso à informação (Lei nº 12.527/2011)

Com base na Lei de Acesso à Informação (Lei nº 12.527/2011), solicito as seguintes informações:

${question.trim() || "[escreva aqui a sua pergunta]"}

Peço que a resposta seja enviada em formato digital e, sempre que possível, em formato aberto (planilha), conforme o art. 8º, § 3º, da Lei nº 12.527/2011.

Lembro que o prazo de resposta é de 20 dias, prorrogável por mais 10 dias mediante justificativa (art. 11), e que, em caso de negativa, tenho direito a recurso (art. 15).

Atenciosamente,
[seu nome]`;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="space-y-4">
        <label className="flex flex-col gap-1 text-sm text-ink-700">
          <span className="font-medium">Para qual ente?</span>
          <select
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            className="rounded-md border border-paper-300 bg-white px-3 py-2 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          >
            {entities.map((e) => (
              <option key={e.slug} value={e.slug}>
                {e.name}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="text-sm text-ink-700">
          <legend className="font-medium">Enviar para</legend>
          <div className="mt-1 flex flex-wrap gap-4">
            {(["executivo", "legislativo"] as const).map((t) => (
              <label key={t} className="flex items-center gap-2">
                <input type="radio" name="target" checked={target === t} onChange={() => setTarget(t)} className="accent-brand-600" />
                {t === "executivo" ? (isState ? "Governo do Estado" : "Prefeitura") : isState ? "Assembleia Legislativa" : "Câmara Municipal"}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex flex-col gap-1 text-sm text-ink-700">
          <span className="font-medium">Sua pergunta</span>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={5}
            placeholder="Ex.: Quais foram as 20 maiores despesas de 2025, com credor, contrato e objeto?"
            className="rounded-md border border-paper-300 bg-white px-3 py-2 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </label>
        <p className="text-xs text-ink-500">
          Dica: perguntas específicas (ano, área, tipo de documento) recebem respostas melhores. Você não precisa explicar
          por que quer a informação (art. 10, § 3º).
        </p>
      </div>
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink-900">Texto pronto do pedido</p>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {
                // Clipboard blocked: the text remains selectable below.
              }
            }}
            className="rounded-md bg-brand-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-800"
          >
            {copied ? "Copiado ✓" : "Copiar texto"}
          </button>
        </div>
        <pre className="mt-2 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-md border border-paper-200 bg-paper-100 p-4 font-sans text-sm leading-relaxed text-ink-900" data-testid="lai-text">
          {text}
        </pre>
        <p className="mt-2 text-xs text-ink-500">
          Envie pelo Serviço de Informação ao Cidadão (e-SIC) no site da prefeitura, da Câmara ou do Governo do Estado. Se
          não houver sistema on-line, o pedido pode ser protocolado presencialmente.
        </p>
      </div>
    </div>
  );
}
