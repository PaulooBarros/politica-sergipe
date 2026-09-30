import Link from "next/link";
import { DownloadIcon } from "@/components/ui/Icons";
import { formatDate } from "@/lib/format";
import { CHANGELOG, DOWNLOADED_AT } from "../data";
import { getSourceLinks } from "../sources";

type Props = {
  code: string;
  /** Title used in the citation, e.g. "Raio-x de Itabaiana". */
  title: string;
  name: string;
  year: number;
  csvHref: string;
};

/** "Dados e fontes": CSV download, the exact SICONFI queries, update status and how to cite. */
export default function DataSources({ code, title, name, year, csvHref }: Props) {
  const changes = CHANGELOG.flatMap((entry) =>
    entry.changes.filter((c) => c.code === code).map((c) => ({ ...c, date: entry.date })),
  );

  return (
    <div className="flex flex-col gap-6" data-testid="data-sources">
      <ul className="border-t border-paper-200">
        <li className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5 border-b border-paper-200 py-3.5">
          <div className="min-w-0 flex-[1_1_20rem]">
            <p className="text-base font-semibold text-ink-900">Planilha completa de {name}</p>
            <p className="text-sm text-ink-500">Todos os anos e todas as áreas, com separador “;” e vírgula decimal (abre direto no Excel).</p>
          </div>
          <a href={csvHref} className="btn btn-secondary min-h-10 text-sm">
            <DownloadIcon /> CSV
          </a>
        </li>
        {getSourceLinks(code, year).map((s) => (
          <li key={s.url} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5 border-b border-paper-200 py-3.5">
            <div className="min-w-0 flex-[1_1_20rem]">
              <p className="text-base font-semibold text-ink-900">{s.label}</p>
              <p className="text-sm text-ink-500">Consulta à API de dados abertos do Tesouro Nacional (JSON), {year}.</p>
            </div>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center px-3 text-sm font-medium text-brand-700 hover:underline">
              No SICONFI ↗
            </a>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-base font-semibold text-ink-900">Atualização</h3>
          <p className="mt-1 text-[15px] leading-relaxed text-ink-700">
            Dados consultados em {formatDate(DOWNLOADED_AT)}. Os entes podem corrigir (retificar) suas declarações; quando
            isso acontece, a mudança aparece aqui.
          </p>
          {changes.length === 0 ? (
            <p className="mt-2 text-sm text-ink-500">Nenhuma retificação registrada até agora.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-ink-700">
              {changes.slice(0, 5).map((c, i) => (
                <li key={i}>
                  {formatDate(c.date)}: {c.field} de {c.year} alterado.
                </li>
              ))}
            </ul>
          )}
          <Link href="/sobre#atualizacoes" className="link mt-2 inline-block text-sm">
            Histórico de atualizações
          </Link>
        </div>
        <div className="rounded-md bg-paper-100 p-4 text-sm leading-[22px] text-ink-700">
          <strong className="font-semibold text-ink-900">Como citar:</strong> Contas públicas · Sergipe, com dados do
          SICONFI/Tesouro Nacional e do IBGE. &ldquo;{title}, {year}&rdquo;. Dados consultados em {formatDate(DOWNLOADED_AT)}.
        </div>
      </div>
    </div>
  );
}
