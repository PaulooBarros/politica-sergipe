import Link from "next/link";

const GROUP = "flex h-11 overflow-hidden rounded-md border border-paper-400 bg-white";
const ITEM = "flex items-center justify-center px-3.5 text-[15px] whitespace-nowrap tabular-nums transition-colors";
const ON = "bg-brand-700 font-semibold text-white";
const OFF = "font-medium text-ink-700 hover:bg-brand-50 hover:text-brand-800";

/** Segmented control whose options are links (state lives in the URL). */
export function SegmentedLinks({
  label,
  items,
  showLabel = true,
}: {
  label: string;
  items: { label: string; href: string; active: boolean }[];
  showLabel?: boolean;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-1.5">
      {showLabel && (
        <span className="text-[13px] font-semibold text-ink-700" aria-hidden>
          {label}
        </span>
      )}
      <div className={GROUP}>
        {items.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            scroll={false}
            aria-current={item.active ? "true" : undefined}
            className={`${ITEM} ${i > 0 ? "border-l border-paper-300" : ""} ${item.active ? ON : OFF}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Segmented control made of radio buttons, for GET forms (FilterForm submits on change). */
export function SegmentedRadio({
  name,
  label,
  value,
  options,
  className = "",
}: {
  name: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <fieldset className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <legend className="mb-1.5 text-[13px] font-semibold text-ink-700">{label}</legend>
      <div className={GROUP}>
        {options.map((o, i) => (
          <label key={o.value} className={`flex-1 cursor-pointer ${i > 0 ? "border-l border-paper-300" : ""}`}>
            <input type="radio" name={name} value={o.value} defaultChecked={o.value === value} className="peer sr-only" />
            <span
              className={`${ITEM} h-full px-2 peer-checked:bg-brand-700 peer-checked:font-semibold peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:-outline-offset-3 peer-focus-visible:outline-brand-300 ${OFF}`}
            >
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
