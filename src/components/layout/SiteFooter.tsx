import Link from "next/link";
import { DOWNLOADED_AT, LATEST_YEAR } from "@/features/budget/data";
import { formatDate } from "@/lib/format";
import { DownloadIcon } from "@/components/ui/Icons";
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
      { href: "/participe#quem-fiscaliza", label: "Quem fiscaliza" },
      { href: "/participe#pedido", label: "Pedido de informação (LAI)" },
    ],
  },
  {
    title: "Entenda os dados",
    links: [
      { href: "/sobre#glossario", label: "Glossário" },
      { href: "/sobre#criterios", label: "Critérios dos pontos de atenção" },
      { href: "/sobre#metodologia", label: "Metodologia" },
      { href: "/sobre#fontes", label: "Fontes" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-brand-950 text-brand-100">
      <div className="page grid gap-10 py-12 text-sm lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <StateMark className="h-[34px] w-[30px] text-brand-200" />
            <span className="text-base font-semibold tracking-tight text-white">
              Contas públicas <span className="font-medium text-brand-300">· Sergipe</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm leading-relaxed text-brand-200">
            Projeto independente e apartidário. Mostra apenas dados públicos oficiais, com a fonte e o critério de cada
            número. Não avalia gestões nem indica voto.
          </p>
          <a
            href={`/dados/municipios?ano=${LATEST_YEAR}`}
            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md border border-brand-200/40 px-3 text-white transition-colors hover:bg-white/10"
          >
            <DownloadIcon /> Baixar dados de {LATEST_YEAR} (CSV)
          </a>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="eyebrow text-brand-300">{col.title}</h2>
            <ul className="mt-3 space-y-1">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-8 items-center text-brand-100 transition-colors hover:text-white hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="page flex flex-wrap justify-between gap-x-6 gap-y-2 py-5 text-xs leading-relaxed text-brand-300">
          <p>
            Fontes: SICONFI/Tesouro Nacional (RREO, RGF e DCA), IBGE (malha municipal e IPCA). Dados consultados em{" "}
            {formatDate(DOWNLOADED_AT)}.
          </p>
          <p>
            Em breve:{" "}
            <Link href="/eleicoes" className="underline underline-offset-2 hover:text-white">
              eleições
            </Link>{" "}
            e{" "}
            <Link href="/quiz" className="underline underline-offset-2 hover:text-white">
              quiz cívico
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
