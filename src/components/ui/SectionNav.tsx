type Props = {
  title: string;
  items: { id: string; number: string; label: string; badge?: number }[];
};

/** Sticky table of contents for long report pages (desktop only). */
export default function SectionNav({ title, items }: Props) {
  return (
    <nav aria-label={title} className="sticky top-6 mt-6 hidden rounded-lg border border-paper-200 bg-white p-3 lg:block">
      <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">{title}</p>
      <ol className="space-y-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-ink-700 hover:bg-brand-50 hover:text-brand-800"
            >
              <span className="w-5 text-xs font-bold text-brand-500">{item.number}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="rounded-full bg-alert-100 px-1.5 text-xs font-bold text-alert-700">{item.badge}</span>
              ) : null}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
