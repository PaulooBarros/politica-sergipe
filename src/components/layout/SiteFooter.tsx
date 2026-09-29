import Link from "next/link";
import StateMark from "./StateMark";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-paper-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-ink-700 sm:grid-cols-[2fr_1fr_1fr] sm:px-6">
        <div className="flex gap-3">
          <StateMark className="h-8 w-8 shrink-0 text-brand-700" />
          <p className="max-w-sm">
            Projeto independente e apartidário. Mostra apenas dados públicos oficiais, com a fonte e os critérios de
            cada número.
          </p>
        </div>
        <div>
          <p className="font-semibold text-ink-900">Fontes</p>
          <ul className="mt-2 space-y-1">
            <li>Tesouro Nacional (SICONFI)</li>
            <li>IBGE (malha e municípios)</li>
            <li>Governo de Sergipe (territórios)</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-ink-900">Entenda os números</p>
          <ul className="mt-2 space-y-1">
            <li>
              <Link href="/sobre#glossario" className="text-brand-700 hover:underline">Glossário</Link>
            </li>
            <li>
              <Link href="/sobre#criterios" className="text-brand-700 hover:underline">Critérios dos pontos de atenção</Link>
            </li>
            <li>
              <Link href="/sobre#metodologia" className="text-brand-700 hover:underline">Metodologia</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
