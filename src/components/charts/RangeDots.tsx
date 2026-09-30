export type RangeMarker = { value: number | null; label: string; shape: "dot" | "diamond" };
export type RangeReference = { value: number | null; label: string; line: "solid" | "dotted" | "dashed" };

type Props = {
  /** Every municipality's value, drawn as light ticks for context. */
  all: number[];
  markers: RangeMarker[];
  references?: RangeReference[];
  /** A single labelled reference, e.g. "limite 54%". */
  labelledReference?: { value: number; label: string };
  label: string;
};

const LINE = { solid: "border-solid border-ink-900", dotted: "border-dotted border-ink-500", dashed: "border-dashed border-paper-400" };

/**
 * Where one (or two) municipalities sit among all 75: grey ticks for everyone,
 * reference lines told apart by their stroke (works in greyscale), markers told apart by shape.
 */
export default function RangeDots({ all, markers, references = [], labelledReference, label }: Props) {
  const domain = [...all, ...markers.map((m) => m.value), labelledReference?.value].filter((v): v is number => v != null);
  const min = Math.min(...domain);
  const max = Math.max(...domain);
  const x = (v: number) => (max === min ? 50 : ((v - min) / (max - min)) * 100);
  const shown = markers.filter((m) => m.value != null) as (RangeMarker & { value: number })[];
  const lo = Math.min(...shown.map((m) => x(m.value)));
  const hi = Math.max(...shown.map((m) => x(m.value)));

  return (
    <div className="relative mx-2.5 h-11" role="img" aria-label={label}>
      {all.map((v, i) => (
        <span key={i} className="absolute top-4 h-3 w-0.5 rounded-[1px] bg-paper-300" style={{ left: `calc(${x(v)}% - 1px)` }} />
      ))}
      {shown.length === 2 && <span className="absolute top-[20px] h-1 rounded-sm bg-brand-300" style={{ left: `${lo}%`, width: `${hi - lo}%` }} />}
      {references.map(
        (r) =>
          r.value != null && (
            <span key={r.label} title={r.label} className={`absolute inset-y-1 border-l-[3px] ${LINE[r.line]}`} style={{ left: `${x(r.value)}%` }} />
          ),
      )}
      {labelledReference && (
        <>
          <span className="absolute inset-y-2 border-l-2 border-dashed border-ink-700" style={{ left: `${x(labelledReference.value)}%` }} />
          <span className="absolute -top-1.5 text-xs font-semibold whitespace-nowrap text-ink-700" style={{ left: `calc(${x(labelledReference.value)}% + 5px)` }}>
            {labelledReference.label}
          </span>
        </>
      )}
      {shown.map((m) =>
        m.shape === "dot" ? (
          <span
            key={m.label}
            title={m.label}
            className="absolute top-[14px] h-4 w-4 rounded-full bg-brand-700 shadow-[0_0_0_2px_#fff,0_0_0_3px_var(--color-brand-700)]"
            style={{ left: `calc(${x(m.value)}% - 8px)` }}
          />
        ) : (
          <span
            key={m.label}
            title={m.label}
            className="absolute top-[15px] h-3.5 w-3.5 rotate-45 border-[3px] border-ink-900 bg-white shadow-[0_0_0_2px_#fff]"
            style={{ left: `calc(${x(m.value)}% - 7px)` }}
          />
        ),
      )}
    </div>
  );
}

/** Legend swatches matching RangeDots, for use outside the chart. */
export function MarkerSwatch({ shape }: { shape: RangeMarker["shape"] }) {
  return shape === "dot" ? (
    <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-full bg-brand-700" aria-hidden />
  ) : (
    <span className="inline-block h-3 w-3 shrink-0 rotate-45 border-[3px] border-ink-900 bg-white" aria-hidden />
  );
}

export function LineSwatch({ line }: { line: RangeReference["line"] }) {
  return <span className={`inline-block h-[18px] w-0 shrink-0 border-l-[3px] ${LINE[line]}`} aria-hidden />;
}
