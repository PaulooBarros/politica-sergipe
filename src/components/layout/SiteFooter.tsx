import Link from "next/link";
import { DOWNLOADED_AT, LATEST_YEAR } from "@/features/budget/data";
import StateMark from "./StateMark";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/", label: "Mapa de Sergipe" },
      { href: "/municipios", label: "Os 75 municípios" },
      { href: "/comparar", label: "Comparar municípios" },
      { href: "/estado", label: "Governo do Estado" },
    ],
  },
  {
    title: "Participe",
    links: [
      { href: "/participe#calendario", label: "Calendário do orçamento" },
      { href: "/participe#pedido", label: "Pedido de informação (LAI)" },
      { href: "/participe#quem-fiscaliza", label: "Quem fiscaliza" },
    ],
  },
  {
    title: "Entenda os dados",
    links: [
      { href: "/sobre#glossario", label: "Glossário" },
      { href: "/sobre#criterios", label: "Critérios dos pontos de atenção" },
      { href: "/sobre#metodologia", label: "Metodologia e fontes" },
      { href: `/dados/municipios?ano=${LATEST_YEAR}`, label: `Baixar dados (CSV, ${LATEST_YEAR})` },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-paper-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-ink-700 sm:px-6 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="flex gap-3">
          <StateMark className="h-8 w-8 shrink-0 text-brand-700" />
          <div className="space-y-2">
            <p className="max-w-sm">
              Projeto independente e apartidário. Mostra apenas dados públicos oficiais, com a fonte e os critérios de
              cada número.
            </p>
            <p className="text-xs text-ink-500">
              Dados do Tesouro Nacional consultados em {new Date(`${DOWNLOADED_AT}T12:00:00`).toLocaleDateString("pt-BR")}.
              Em breve: <Link href="/eleicoes" className="hover:underline">eleições</Link> e{" "}
              <Link href="/quiz" className="hover:underline">quiz cívico</Link>.
            </p>
          </div>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="font-semibold text-ink-900">{col.title}</p>
            <ul className="mt-2 space-y-1">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-brand-700 hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
