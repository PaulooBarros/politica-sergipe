"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Mapa" },
  { href: "/municipios", label: "Municípios" },
  { href: "/estado", label: "Governo do Estado" },
  { href: "/eleicoes", label: "Eleições" },
  { href: "/quiz", label: "Quiz" },
  { href: "/sobre", label: "Metodologia" },
];

export default function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Principal" className="-mx-2 overflow-x-auto">
      <ul className="flex text-sm font-medium">
        {LINKS.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap border-b-[3px] px-3 py-5 transition-colors ${
                  active ? "border-white text-white" : "border-transparent text-brand-200 hover:border-brand-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
