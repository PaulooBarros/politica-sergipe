import type { AreaRow } from "../metrics";

const TOP = 6;

/** "De cada R$ 100 gastos": the spending split as a receipt, in whole reais. */
export default function HundredReais({ rows, who }: { rows: AreaRow[]; who: string }) {
  const withShare = rows.filter((r) => (r.share ?? 0) > 0);
  if (withShare.length === 0) return null;

  const top = withShare.slice(0, TOP);
  const rest = withShare.slice(TOP).reduce((acc, r) => acc + (r.share ?? 0), 0);
  const lines = [...top.map((r) => ({ name: r.name, share: r.share! })), ...(rest > 0 ? [{ name: "Outras áreas", share: rest }] : [])];

  // Round to whole reais that still add up to 100 (largest remainder).
  const raw = lines.map((l) => l.share * 100);
  const whole = raw.map(Math.floor);
  let missing = 100 - whole.reduce((a, b) => a + b, 0);
  raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac)
    .forEach(({ i }) => {
      if (missing > 0) {
        whole[i] += 1;
        missing -= 1;
      }
    });

  return (
    <div className="rounded-lg border border-paper-200 bg-paper-100/60 p-5" data-testid="hundred-reais">
      <p className="text-sm font-semibold text-ink-900">De cada R$ 100 que {who} gastou</p>
      <ul className="mt-3 space-y-2">
        {lines.map((l, i) => (
          <li key={l.name} className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3">
            <span className="text-right text-lg font-bold tabular-nums text-ink-900">R$ {whole[i]}</span>
            <span className="min-w-0">
              <span className="flex items-baseline gap-2 text-sm text-ink-700">
                <span className="truncate">{l.name}</span>
                <span className="flex-1 border-b border-dotted border-paper-300" aria-hidden />
              </span>
              <span className="mt-1 block h-1.5 rounded-full bg-paper-200" aria-hidden>
                <span className="block h-full rounded-full bg-brand-500" style={{ width: `${whole[i]}%` }} />
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
