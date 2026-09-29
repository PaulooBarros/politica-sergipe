type Option = { value: string; label: string };

type Props = {
  name: string;
  label: string;
  value: string;
  options: Option[];
};

export default function SelectField({ name, label, value, options }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink-700">
      <span className="font-medium">{label}</span>
      <select
        name={name}
        defaultValue={value}
        key={value}
        className="rounded-md border border-paper-300 bg-paper-50 px-3 py-2 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
