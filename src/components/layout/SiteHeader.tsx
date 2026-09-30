import Link from "next/link";
import { DOWNLOADED_AT } from "@/features/budget/data";
import { formatDate } from "@/lib/format";
import MainNav from "./MainNav";
import StateMark from "./StateMark";

/** Institutional strip (neutrality notice and data date) above the aubergine navigation bar. */
export default function SiteHeader() {
  return (
    <header>
      <div className="bg-brand-950 text-[13px] leading-[18px] text-brand-200">
        <div className="page flex items-center justify-between gap-4 py-[7px]">
          <span>Portal informativo e apartidário · dados oficiais do Tesouro Nacional e do IBGE</span>
          <span className="hidden text-brand-300 lg:inline">Dados consultados em {formatDate(DOWNLOADED_AT)}</span>
        </div>
      </div>
      <div className="relative bg-brand-900 text-white">
        <div className="page flex h-16 items-center gap-8">
          <Link href="/" className="flex min-h-11 shrink-0 items-center gap-3 text-white" aria-label="Contas públicas · Sergipe, página inicial">
            <StateMark className="h-[34px] w-[30px] text-brand-100" />
            <span className="text-base font-semibold tracking-tight whitespace-nowrap">
              Contas públicas <span className="font-medium text-brand-300">· Sergipe</span>
            </span>
          </Link>
          <MainNav />
        </div>
      </div>
    </header>
  );
}
