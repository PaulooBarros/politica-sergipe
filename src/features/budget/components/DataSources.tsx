import Link from "next/link";
import { CHANGELOG, DOWNLOADED_AT } from "../data";
import { getSourceLinks } from "../sources";

type Props = {
  code: string;
  name: string;
  year: number;
  csvHref: string;
};

const date = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR");

/** "De onde veio cada número": raw API links, CSV download and update status. */
export default function DataSources({ code, name, year, csvHref }: Props) {
  const changes = CHANGELOG.flatMap((entry) =>
    entry.changes.filter((c) => c.code === code).map((c) => ({ ...c, date: entry.date })),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2" data-testid="data-sources">
      <div>
        <h3 className="font-semibold text-ink-900">Consulte a fonte original</h3>
        <p className="mt-1 text-sm text-ink-700">
          Cada número desta página vem destas consultas à API de dados abertos do Tesouro Nacional (formato JSON), para{" "}
          {name} em {year}:
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {getSourceLinks(code, year).map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline">
                {s.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-5">
        <div>
          <h3 className="font-semibold text-ink-900">Baixe os dados</h3>
          <p className="mt-1 text-sm text-ink-700">Planilha com todos os anos e todas as áreas, pronta para Excel ou LibreOffice.</p>
          <a
            href={csvHref}
            className="mt-3 inline-flex items-center gap-2 rounded-md border border-paper-300 bg-white px-3 py-2 text-sm font-medium text-ink-900 hover:border-brand-400"
          >
            ⬇ Baixar CSV de {name}
          </a>
        </div>
        <div>
          <h3 className="font-semibold text-ink-900">Atualização</h3>
          <p className="mt-1 text-sm text-ink-700">
            Dados consultados em {date(DOWNLOADED_AT)}. Os municípios podem corrigir (retificar) suas declarações; quando
            isso acontece, a mudança aparece aqui.
          </p>
          {changes.length === 0 ? (
            <p className="mt-2 text-sm text-ink-500">Nenhuma retificação registrada até agora.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-ink-700">
              {changes.slice(0, 5).map((c, i) => (
                <li key={i}>
                  {date(c.date)}: {c.field} de {c.year} alterado.
                </li>
              ))}
            </ul>
          )}
          <Link href="/sobre#atualizacoes" className="mt-2 inline-block text-sm text-brand-700 hover:underline">
            Histórico de atualizações
          </Link>
        </div>
      </div>
    </div>
  );
}
