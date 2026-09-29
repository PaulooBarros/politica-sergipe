"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

type Item = { name: string; slug: string; territory: string };

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function MunicipalitySearch({ items, linkQuery = "" }: { items: Item[]; linkQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const listId = useId();

  const q = normalize(query.trim());
  const results = q ? items.filter((i) => normalize(i.name).includes(q)).slice(0, 8) : [];

  return (
    <div className="relative">
      <label htmlFor={`${listId}-input`} className="text-sm font-medium text-ink-700">
        Encontre seu município
      </label>
      <input
        id={`${listId}-input`}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results[0]) router.push(`/municipios/${results[0].slug}${linkQuery}`);
        }}
        placeholder="Digite o nome, por exemplo: Itabaiana"
        autoComplete="off"
        aria-controls={listId}
        className="mt-1 w-full rounded-md border border-paper-300 bg-paper-50 px-4 py-3 text-base text-ink-900 placeholder:text-ink-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
      {results.length > 0 && (
        <ul
          id={listId}
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-paper-200 bg-paper-50 shadow-lg"
        >
          {results.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/municipios/${r.slug}${linkQuery}`}
                className="flex justify-between gap-3 px-4 py-2.5 hover:bg-brand-50 focus:bg-brand-50 focus:outline-none"
              >
                <span className="font-medium text-ink-900">{r.name}</span>
                <span className="text-sm text-ink-500">{r.territory}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {q && results.length === 0 && (
        <p className="mt-2 text-sm text-ink-500">Nenhum município encontrado com esse nome.</p>
      )}
    </div>
  );
}
