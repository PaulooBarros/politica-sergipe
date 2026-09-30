"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { SearchIcon } from "@/components/ui/Icons";

type Item = { name: string; slug: string; territory: string };

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Large search box: suggestions while typing, Enter or "Buscar" opens the first match. */
export default function MunicipalitySearch({ items, linkQuery = "" }: { items: Item[]; linkQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const id = useId();

  const q = normalize(query.trim());
  const results = q ? items.filter((i) => normalize(i.name).includes(q)).slice(0, 6) : [];
  const go = () => {
    if (results[0]) router.push(`/municipios/${results[0].slug}${linkQuery}`);
    else router.push(`/municipios?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form
      role="search"
      className="relative max-w-[42.5rem]"
      onSubmit={(e) => {
        e.preventDefault();
        go();
      }}
    >
      <label htmlFor={`${id}-input`} className="mb-2 block text-[15px] font-semibold text-ink-900">
        Procure seu município
      </label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-ink-500" />
          <input
            id={`${id}-input`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex.: Itabaiana"
            autoComplete="off"
            aria-controls={`${id}-list`}
            aria-expanded={results.length > 0}
            role="combobox"
            className="h-14 w-full rounded-md border-2 border-ink-700 bg-white pr-4 pl-12 text-lg text-ink-900 placeholder:text-ink-500 focus:border-brand-900"
          />
        </div>
        <button type="submit" className="btn btn-primary h-14 shrink-0 px-5 text-[17px] sm:px-7">
          Buscar
        </button>
      </div>
      {results.length > 0 && (
        <ul id={`${id}-list`} role="listbox" className="absolute inset-x-0 top-full z-30 mt-1.5 rounded-lg border border-paper-300 bg-white p-1.5 shadow-pop">
          {results.map((r) => (
            <li key={r.slug} role="option" aria-selected={false}>
              <Link
                href={`/municipios/${r.slug}${linkQuery}`}
                className="flex min-h-11 items-center justify-between gap-3 rounded-md px-3 text-base text-ink-900 hover:bg-brand-50 focus:bg-brand-50"
              >
                <span>{r.name}</span>
                <span className="text-[13px] text-ink-500">{r.territory}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {q && results.length === 0 && (
        <p className="mt-2 text-sm font-medium text-ink-700">Nenhum município com esse nome. Confira a grafia.</p>
      )}
    </form>
  );
}
