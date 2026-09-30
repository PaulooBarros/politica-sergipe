"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SearchIcon } from "@/components/ui/Icons";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/municipios", label: "Municípios" },
  { href: "/comparar", label: "Comparar" },
  { href: "/estado", label: "Governo do Estado" },
  { href: "/participe", label: "Participe" },
  { href: "/sobre", label: "Sobre" },
];

/** Desktop: inline links with an underline on the current page. Phones: search shortcut and a menu panel. */
export default function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <nav aria-label="Principal" className="hidden h-16 flex-1 gap-1 lg:flex">
        {LINKS.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center px-3 text-[15px] whitespace-nowrap transition-colors hover:text-white ${
                active ? "font-semibold text-white shadow-[inset_0_-3px_0_var(--color-brand-300)]" : "font-medium text-brand-200"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/municipios"
        className="hidden h-10 items-center gap-2 rounded-md border border-brand-200/45 px-3.5 text-sm text-white transition-colors hover:bg-white/10 lg:flex"
      >
        <SearchIcon className="h-4 w-4" />
        Buscar município
      </Link>

      <div className="ml-auto flex gap-1 lg:hidden">
        <Link href="/municipios" aria-label="Buscar município" className="grid h-11 w-11 place-items-center rounded-md text-white">
          <SearchIcon className="h-5 w-5" />
        </Link>
        <button
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="menu-principal"
          onClick={() => setOpen((o) => !o)}
          className="grid h-11 w-11 place-items-center rounded-md text-white"
        >
          <svg viewBox="0 0 22 22" stroke="currentColor" strokeWidth="1.8" className="h-[22px] w-[22px]" aria-hidden>
            {open ? <path d="M5 5l12 12M17 5L5 17" /> : <path d="M3 6h16M3 11h16M3 16h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="menu-principal" aria-label="Principal" className="absolute inset-x-0 top-full z-50 border-t border-white/10 bg-brand-900 shadow-pop lg:hidden">
          <ul className="page py-2">
            {LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-12 items-center border-l-[3px] pl-3 text-base ${
                      active ? "border-brand-300 font-semibold text-white" : "border-transparent text-brand-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </>
  );
}
