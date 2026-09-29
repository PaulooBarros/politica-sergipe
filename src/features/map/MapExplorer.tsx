"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";
import { MAP_HEIGHT, MAP_WIDTH } from "./constants";
import type { MunicipalityCard } from "./explorerData";

export type MapShape = { code: string; name: string; slug: string; d: string };
export type MapValue = { label: string; bucket: number | null };

type Props = {
  shapes: MapShape[];
  values: Record<string, MapValue>;
  legend: string[];
  cards: Record<string, MunicipalityCard>;
  indicatorLabel: string;
  year: number;
  /** Filters rendered by the server (indicator, year). */
  toolbar: ReactNode;
  /** What the card shows when nothing is selected (state summary). */
  overview: ReactNode;
};

// Sequential brand ramp, light to dark; one class per legend entry.
const BUCKET_FILLS = ["fill-brand-100", "fill-brand-200", "fill-brand-400", "fill-brand-600", "fill-brand-800"];
const BUCKET_BG = ["bg-brand-100", "bg-brand-200", "bg-brand-400", "bg-brand-600", "bg-brand-800"];

export default function MapExplorer({ shapes, values, legend, cards, indicatorLabel, year, toolbar, overview }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const activeCode = hovered ?? selected;
  const card = activeCode ? cards[activeCode] : null;

  const select = (code: string) => setSelected((current) => (current === code ? null : code));

  return (
    <div className="grid overflow-hidden rounded-lg border border-paper-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex flex-col border-b border-paper-200 lg:border-r lg:border-b-0">
        <div className="flex flex-wrap items-end gap-4 border-b border-paper-200 px-5 py-4">{toolbar}</div>

        <figure className="relative flex flex-1 flex-col px-4 pt-4 pb-5">
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="mx-auto h-auto max-h-[70vh] w-full"
            role="group"
            aria-label={`Mapa de Sergipe: ${indicatorLabel}, ${year}`}
            data-testid="map"
            onMouseLeave={() => setHovered(null)}
          >
            {shapes.map((s) => {
              const bucket = values[s.code]?.bucket;
              const fill = bucket == null ? "fill-paper-300" : BUCKET_FILLS[bucket];
              const isSelected = s.code === selected;
              return (
                <path
                  key={s.code}
                  d={s.d}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`${s.name}: ${values[s.code]?.label ?? "não declarado"}`}
                  data-code={s.code}
                  onClick={() => select(s.code)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      select(s.code);
                    }
                  }}
                  onMouseEnter={() => setHovered(s.code)}
                  onFocus={() => setHovered(s.code)}
                  onBlur={() => setHovered(null)}
                  className={`${fill} cursor-pointer outline-none transition-[fill,stroke-width] ${
                    isSelected ? "stroke-ink-900 stroke-[2.5]" : "stroke-white stroke-[0.9] hover:stroke-ink-900 hover:stroke-2 focus-visible:stroke-ink-900 focus-visible:stroke-2"
                  }`}
                />
              );
            })}
            {/* Draw the selected outline on top so its stroke is not covered by neighbours */}
            {selected && (
              <path d={shapes.find((s) => s.code === selected)?.d} className="pointer-events-none fill-none stroke-ink-900 stroke-[2.5]" />
            )}
          </svg>

          <figcaption className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-700">
            <span className="font-semibold text-ink-900">{indicatorLabel}</span>
            <ul className="flex flex-wrap gap-x-3 gap-y-1" aria-label="Legenda">
              {legend.map((label, i) => (
                <li key={label} className="flex items-center gap-1.5">
                  <span className={`inline-block h-3 w-5 rounded-sm ${BUCKET_BG[i]}`} aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </figcaption>
        </figure>
      </div>

      <aside className="flex flex-col bg-paper-100/60" aria-live="polite" data-testid="map-card">
        {card ? (
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-ink-500">{card.territory}</p>
                <h2 className="text-2xl font-bold tracking-tight text-ink-900">{card.name}</h2>
                <p className="text-sm text-ink-500">
                  {card.population} habitantes · {card.size.toLowerCase()}
                </p>
              </div>
              {selected === card.code && (
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-md px-2 py-1 text-xs font-medium text-ink-500 hover:bg-paper-200 hover:text-ink-900"
                >
                  Fechar ✕
                </button>
              )}
            </div>

            <div className="mt-4 rounded-md bg-brand-900 px-4 py-3 text-white">
              <p className="text-xs text-brand-200">{indicatorLabel} · {year}</p>
              <p className="text-2xl font-bold tabular-nums">{card.indicator}</p>
              {card.rank && <p className="text-xs text-brand-200">{card.rank}º maior entre os 75 municípios</p>}
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                ["Receita/hab.", card.revenuePerCapita],
                ["Gasto/hab.", card.paidPerCapita],
                ["Executado", card.execution],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-paper-200 bg-white px-2 py-2">
                  <dt className="text-[11px] text-ink-500">{label}</dt>
                  <dd className="text-sm font-bold tabular-nums text-ink-900">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4">
              <p className="text-sm font-semibold text-ink-900">
                {card.insights.length === 0
                  ? "Nenhum ponto de atenção"
                  : `${card.insights.length} ${card.insights.length === 1 ? "ponto de atenção" : "pontos de atenção"}`}
              </p>
              {card.insights.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {card.insights.map((title) => (
                    <li key={title} className="flex gap-2 text-sm text-ink-700">
                      <span className="text-alert-500" aria-hidden>▲</span>
                      {title}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Link
              href={`/municipios/${card.slug}?ano=${year}`}
              className="mt-auto block rounded-md bg-brand-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-800"
            >
              Ver raio-x completo →
            </Link>
            {!selected && <p className="mt-2 text-center text-xs text-ink-500">Clique no mapa para fixar esta ficha.</p>}
          </div>
        ) : (
          overview
        )}
      </aside>
    </div>
  );
}
