import Term from "@/components/ui/Term";
import { type CheckStatus, type LegalCheck, STATUS_LABEL } from "../checks";

const BADGE: Record<CheckStatus, string> = {
  ok: "bg-brand-100 text-brand-800",
  alert: "bg-alert-100 text-alert-800",
  prudential: "bg-alert-100 text-alert-800",
  fail: "bg-alert-500 text-white",
  unknown: "bg-paper-200 text-ink-700",
};
const ICON: Record<CheckStatus, string> = { ok: "✓", alert: "!", prudential: "!", fail: "✕", unknown: "?" };

/** Gauge from 0 to `max` with the value bar and the legal threshold as a tick. */
function Gauge({ check }: { check: LegalCheck }) {
  if (check.value == null || check.threshold == null) return null;
  const max = check.kind === "minimum" ? Math.max(100, check.value) : Math.max(70, check.value + 5);
  const pos = (v: number) => `${Math.min(100, (v / max) * 100)}%`;
  const failing = check.status !== "ok";

  return (
    <div className="relative mt-4 h-3 rounded-full bg-paper-200" role="img" aria-label={check.sentence}>
      <div
        className={`absolute inset-y-0 left-0 rounded-full ${failing ? "bg-alert-500" : "bg-brand-500"}`}
        style={{ width: pos(check.value) }}
      />
      {check.alertAt != null && (
        <div className="absolute -inset-y-1 w-px bg-ink-500" style={{ left: pos(check.alertAt) }} title={`Alerta: ${check.alertAt}%`} />
      )}
      {check.prudentialAt != null && (
        <div className="absolute -inset-y-1 w-px bg-ink-500" style={{ left: pos(check.prudentialAt) }} title={`Prudencial: ${check.prudentialAt}%`} />
      )}
      <div
        className="absolute -inset-y-1.5 w-[3px] rounded-full bg-ink-900 ring-2 ring-white"
        style={{ left: `calc(${pos(check.threshold)} - 1.5px)` }}
        title={`${check.kind === "minimum" ? "Mínimo" : "Limite"}: ${check.threshold}%`}
      />
    </div>
  );
}

export function LegalNote() {
  return (
    <p className="mt-4 text-xs leading-relaxed text-ink-500">
      Percentuais declarados pelo próprio ente ao Tesouro Nacional (RREO Anexo 14 e RGF Anexo 01, fim do ano). O Tribunal
      de Contas do Estado pode chegar a valores diferentes ao analisar as contas, pois alguns itens podem ser incluídos ou
      excluídos do cálculo.
    </p>
  );
}

export default function LegalChecks({ checks }: { checks: LegalCheck[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2" data-testid="legal-checks">
      {checks.map((c) => (
        <article key={c.id} className="rounded-lg border border-paper-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-ink-900">
              <Term id={c.glossary}>{c.label}</Term>
            </h3>
            <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${BADGE[c.status]}`}>
              <span aria-hidden>{ICON[c.status]}</span> {STATUS_LABEL[c.status]}
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-ink-900">
            {c.value == null ? "—" : `${c.value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`}
            {c.threshold != null && (
              <span className="ml-2 text-sm font-medium text-ink-500">
                {c.kind === "minimum" ? "mínimo" : "limite"} {c.threshold}%
              </span>
            )}
          </p>
          <Gauge check={c} />
          <p className="mt-3 text-sm leading-relaxed text-ink-700">{c.sentence}</p>
          <p className="mt-1 text-xs text-ink-500">Regra: {c.law}</p>
        </article>
      ))}
    </div>
  );
}
