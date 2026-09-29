import Link from "next/link";
import MainNav from "./MainNav";
import StateMark from "./StateMark";

export default function SiteHeader() {
  return (
    <header className="bg-brand-900 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 py-3" aria-label="Página inicial">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-white/10">
            <StateMark className="h-7 w-7 text-white" />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-semibold tracking-tight">Contas públicas</span>
            <span className="block text-xs text-brand-200">Sergipe · dados oficiais</span>
          </span>
        </Link>
        <MainNav />
      </div>
    </header>
  );
}
