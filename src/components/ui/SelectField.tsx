import { ChevronDownIcon } from "./Icons";

type Option = { value: string; label: string };

type Props = {
  name: string;
  label: string;
  value: string;
  options: Option[];
  className?: string;
};

/** Native select inside a GET form (FilterForm submits on change). */
export default function SelectField({ name, label, value, options, className = "" }: Props) {
  return (
    <label className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <span className="text-[13px] font-semibold text-ink-700">{label}</span>
      <span className="relative block">
        <select
          name={name}
          defaultValue={value}
          key={value}
          className="field cursor-pointer appearance-none truncate pr-9 text-[15px] font-medium"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 h-2 w-3 -translate-y-1/2 text-ink-700" />
      </span>
    </label>
  );
}
