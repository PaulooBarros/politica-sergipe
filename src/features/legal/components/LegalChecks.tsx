import ThresholdBar from "@/components/charts/ThresholdBar";
import NotDeclared from "@/components/ui/NotDeclared";
import SourceNote from "@/components/ui/SourceNote";
import Term from "@/components/ui/Term";
import { formatPoints } from "@/lib/format";
import type { CheckStatus, LegalCheck } from "../checks";

function statusText(c: LegalCheck): string {
  const min = c.kind === "minimum";
  const labels: Record<CheckStatus, string> = {
    ok: min ? "Cumpriu o mínimo" : "Dentro do limite",
    fail: min ? "Abaixo do mínimo" : "Acima do limite",
    prudential: "Acima do limite prudencial",
    alert: "Acima do limite de alerta",
    unknown: "Não declarado",
  };
  return labels[c.status];
}

/** Status chip: neutral with ✓ when the rule is met, amber with ▲ when it is not. */
export function LegalStatus({ check }: { check: LegalCheck }) {
  if (check.status === "unknown") return <NotDeclared />;
  const ok = check.status === "ok";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-sm font-semibold ${
        ok ? "border-paper-200 bg-paper-100 text-ink-700" : "border-alert-200 bg-alert-50 text-alert-800"
      }`}
    >
      <span aria-hidden className={ok ? "text-brand-600" : "text-[11px] text-alert-500"}>
        {ok ? "✓" : "▲"}
      </span>
      {statusText(check)}
    </span>
  );
}

export function LegalNote() {
  return (
    <SourceNote>
      percentuais declarados pelo próprio ente ao Tesouro Nacional (SICONFI): RREO Anexo 14 (educação, saúde e Fundeb,
      6º bimestre) e RGF Anexo 01 (pessoal, fim do ano). O Tribunal de Contas do Estado pode chegar a valores diferentes
      ao analisar as contas.
    </SourceNote>
  );
}

/** One row per legal rule: value, status, bar up to the minimum or limit (dashed line). */
export default function LegalChecks({ checks }: { checks: LegalCheck[] }) {
  return (
    <div className="flex flex-col" data-testid="legal-checks">
      {checks.map((c) => {
        const scale = c.kind === "minimum" ? Math.max(40, (c.value ?? 0) + 5, (c.threshold ?? 0) * 1.4) : Math.max(70, (c.value ?? 0) + 5);
        return (
          <article key={c.id} className="grid items-start gap-x-8 gap-y-3 border-t border-paper-200 py-5 md:grid-cols-[16rem_minmax(0,1fr)]">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-[17px] font-semibold text-ink-900">
                <Term id={c.glossary}>{c.label}</Term>
              </h3>
              <p className="text-sm text-ink-500">{c.base}</p>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="font-serif text-[1.75rem] leading-none font-semibold text-ink-900 tabular-nums">
                  {c.value == null ? "" : formatPoints(c.value)}
                </p>
                <LegalStatus check={c} />
              </div>
              {c.value != null && c.threshold != null && (
                <ThresholdBar value={c.value} threshold={c.threshold} kind={c.kind} max={scale} label={c.sentence} />
              )}
              <p className="text-sm leading-relaxed text-ink-700">{c.sentence}</p>
              <p className="text-xs text-ink-500">Regra: {c.law}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
