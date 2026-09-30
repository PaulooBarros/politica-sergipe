/** "Não declarado": grey hatch plus text, never a zero or an empty cell. */
export default function NotDeclared({ size = "sm", label = "não declarado" }: { size?: "sm" | "lg"; label?: string }) {
  if (size === "lg") {
    return (
      <p className="flex items-center gap-2.5 py-1.5 text-xl text-ink-500 italic">
        <span className="bg-nd h-6 w-10 shrink-0 rounded-sm" aria-hidden />
        {label}
      </p>
    );
  }
  return <span className="bg-nd rounded px-2 py-0.5 text-[13px] whitespace-nowrap text-ink-500 italic">{label}</span>;
}
