"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";
import { MAP_HEIGHT, MAP_WIDTH } from "./constants";
import type { MunicipalityCard } from "./explorerData";

export type MapShape = { code: string; name: string; slug: string; d: string; cx: number; cy: number };
export type MapValue = { value: number | null; label: string; bucket: number | null };

type Props = {
  shapes: MapShape[];
  values: Record<string, MapValue>;
  legend: string[];
  cards: Record<string, MunicipalityCard>;
  indicatorLabel: string;
  year: number;
  /** Sentence stating what the map shows (range of the indicator). */
  title: string;
  subtitle: string;
  /** Server-rendered controls (indicator select, year links). */
  controls: ReactNode;
  /** Side panel content when nothing is selected (state summary). */
  overview: ReactNode;
  source: ReactNode;
};

// Sequential ramp, light to dark; one class per legend entry.
const FILLS = ["fill-map-1", "fill-map-2", "fill-map-3", "fill-map-4", "fill-map-5"];
const SWATCHES = ["bg-map-1", "bg-map-2", "bg-map-3", "bg-map-4", "bg-map-5"];

export default function MapExplorer({ shapes, values, legend, cards, indicatorLabel, year, title, subtitle, controls, overview, source }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [tab, setTab] = useState<"map" | "table">("map");
  const activeCode = hovered ?? selected;
  const card = activeCode ? cards[activeCode] : null;
  const activeShape = activeCode ? shapes.find((s) => s.code === activeCode) : null;
  const missing = Object.values(values).filter((v) => v.bucket == null).length;

  const select = (code: string) => {
    setSelected((current) => (current === code ? null : code));
    setHovered(null);
  };

  const tableRows = shapes
    .map((s) => ({ ...s, ...values[s.code] }))
    .sort((a, b) => (b.value ?? -Infinity) - (a.value ?? -Infinity));
  const maxValue = Math.max(...tableRows.map((r) => r.value ?? 0), 1);

  return (
    <section aria-labelledby="mapa-titulo" className="card overflow-hidden">
      <div className="flex flex-col gap-4 px-4 pt-5 sm:px-7 sm:pt-7">
        <div className="flex flex-col gap-1.5">
          <p className="eyebrow">Mapa dos 75 municípios</p>
          <h2 id="mapa-titulo" className="max-w-[48rem] font-serif text-[1.375rem] leading-[1.2] font-semibold tracking-[-0.01em] text-balance text-ink-900 sm:text-[1.875rem]">
            {title}
          </h2>
          <p className="text-[15px] text-ink-500">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
          {controls}
          <div role="tablist" aria-label="Visualização" className="ml-auto flex gap-1 border-b border-paper-200">
            {(
              [
                ["map", "Mapa"],
                ["table", "Tabela"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`h-11 px-3.5 text-[15px] ${tab === key ? "font-semibold text-brand-900 shadow-[inset_0_-3px_0_var(--color-brand-600)]" : "font-medium text-ink-500 hover:text-ink-900"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 px-2 pt-2 sm:px-5">
          {tab === "map" ? (
            <figure className="relative mx-auto my-0 max-w-[560px]">
              <svg
                viewBox={`-10 -10 ${MAP_WIDTH + 20} ${MAP_HEIGHT + 20}`}
                className="block h-auto max-h-[70vh] w-full"
                role="group"
                aria-label={`Mapa de Sergipe: ${indicatorLabel}, ${year}`}
                data-testid="map"
                onMouseLeave={() => setHovered(null)}
              >
                <defs>
                  <pattern id="nd-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="6" height="6" className="fill-paper-100" />
                    <line x1="0" y1="0" x2="0" y2="6" strokeWidth="1.6" className="stroke-paper-400" />
                  </pattern>
                </defs>
                {shapes.map((s) => {
                  const bucket = values[s.code]?.bucket;
                  return (
                    <path
                      key={s.code}
                      d={s.d}
                      role="button"
                      tabIndex={0}
                      aria-pressed={s.code === selected}
                      aria-label={`${s.name}: ${values[s.code]?.label ?? "não declarado"}`}
                      data-code={s.code}
                      fill={bucket == null ? "url(#nd-hatch)" : undefined}
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
                      className={`${bucket == null ? "" : FILLS[bucket]} cursor-pointer stroke-white stroke-[0.9] outline-none [stroke-linejoin:round]`}
                    />
                  );
                })}
                {/* Outline on top so neighbours do not cover it */}
                {activeShape && (
                  <path d={activeShape.d} className={`pointer-events-none fill-none stroke-ink-900 ${activeCode === selected ? "stroke-[2.4]" : "stroke-[1.6]"}`} />
                )}
              </svg>
              {activeShape && (
                <span
                  className="pointer-events-none absolute -translate-x-1/2 rounded bg-ink-900 px-2 py-1 text-[13px] font-semibold whitespace-nowrap text-white shadow-[0_2px_6px_rgb(15_23_42/0.25)]"
                  style={{
                    left: `${Math.min(86, Math.max(14, ((activeShape.cx + 10) / (MAP_WIDTH + 20)) * 100))}%`,
                    top: `calc(${((activeShape.cy + 10) / (MAP_HEIGHT + 20)) * 100}% - 38px)`,
                  }}
                  aria-hidden
                >
                  {activeShape.name}
                </span>
              )}
            </figure>
          ) : (
            <div className="my-2 max-h-[600px] overflow-auto rounded-md border border-paper-200">
              <table className="w-full border-collapse text-sm tabular-nums">
                <caption className="sr-only">
                  {indicatorLabel}, {year}, do maior para o menor valor
                </caption>
                <thead>
                  <tr className="sticky top-0 bg-paper-100">
                    <th scope="col" className="border-b border-paper-300 px-3 py-2.5 text-left text-[13px] font-semibold text-ink-700">
                      Município
                    </th>
                    <th scope="col" className="border-b border-paper-300 px-3 py-2.5 text-right text-[13px] font-semibold text-ink-700">
                      {indicatorLabel}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((r) => (
                    <tr key={r.code} className="border-b border-paper-200 hover:bg-brand-50">
                      <td className="px-3 py-2">
                        <Link href={`/municipios/${r.slug}?ano=${year}`} className="font-medium text-brand-700 hover:underline">
                          {r.name}
                        </Link>
                        <span className="block text-xs text-ink-500">{cards[r.code]?.territory}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-2.5">
                          <span className={r.value == null ? "text-ink-500 italic" : "font-medium text-ink-900"}>{r.label}</span>
                          <span className="block h-2 w-20 rounded-[2px] bg-paper-100" aria-hidden>
                            <span className="block h-2 rounded-[2px] bg-brand-500" style={{ width: `${((r.value ?? 0) / maxValue) * 100}%` }} />
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* On phones a pinned card becomes a bottom sheet over the page. */}
        <aside
          aria-live="polite"
          data-testid="map-card"
          className={`flex flex-col border-t border-paper-200 bg-white p-5 lg:my-2 lg:border-t-0 lg:border-l lg:py-3 lg:pr-6 lg:pl-6 ${
            selected
              ? "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-50 max-lg:max-h-[80vh] max-lg:overflow-y-auto max-lg:rounded-t-[14px] max-lg:border-0 max-lg:pb-[max(1.25rem,env(safe-area-inset-bottom))] max-lg:shadow-sheet"
              : ""
          }`}
        >
          {selected && <span className="mx-auto -mt-2 mb-3 block h-1 w-10 rounded-full bg-paper-300 lg:hidden" aria-hidden />}
          {card ? (
            <div className="flex flex-1 flex-col gap-3.5">
              <div className="flex min-h-6 items-center justify-between gap-2">
                <p className="text-xs font-semibold tracking-[0.08em] text-ink-500 uppercase">Território {card.territory}</p>
                {selected === card.code && (
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[13px] font-medium text-brand-700"
                  >
                    Fixado · soltar ✕
                  </button>
                )}
              </div>
              <div>
                <h3 className="font-serif text-[1.625rem] leading-[1.15] font-semibold tracking-[-0.01em] text-ink-900">{card.name}</h3>
                <p className="mt-1 text-sm text-ink-500">
                  {card.population} habitantes · porte {card.size.toLowerCase()}
                </p>
              </div>
              <div className="flex flex-col gap-1 border-y border-paper-200 py-3.5">
                <p className="text-[13px] font-semibold text-ink-700">
                  {indicatorLabel}, {year}
                </p>
                {card.indicator == null ? (
                  <p className="text-lg font-medium text-ink-500 italic">não declarado</p>
                ) : (
                  <p className="font-serif text-[2.5rem] leading-[1.1] font-semibold tracking-[-0.01em] text-ink-900 tabular-nums">{card.indicator}</p>
                )}
                <p className="text-sm leading-5 text-pretty text-ink-700">{card.comparison}</p>
              </div>
              <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-sm tabular-nums">
                {card.facts.map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="text-ink-500">{label}</dt>
                    <dd className={`text-right font-medium ${value === "não declarado" ? "text-ink-500 italic" : "text-ink-900"}`}>{value}</dd>
                  </div>
                ))}
              </dl>
              {card.insights.length > 0 && (
                <div className="flex items-start gap-2 rounded-md border border-alert-200 bg-alert-50 px-3 py-2.5 text-sm leading-5 text-alert-800">
                  <span aria-hidden className="text-xs leading-5 text-alert-500">
                    ▲
                  </span>
                  <span>
                    {card.insights.length === 1 ? "1 ponto de atenção" : `${card.insights.length} pontos de atenção`} neste ano:{" "}
                    {card.insights.slice(0, 2).join("; ").toLowerCase()}
                    {card.insights.length > 2 ? "…" : "."}
                  </span>
                </div>
              )}
              <Link href={`/municipios/${card.slug}?ano=${year}`} className="btn btn-primary mt-auto w-full">
                Ver raio-x completo →
              </Link>
              {!selected && <p className="-mt-1.5 text-center text-xs text-ink-500">Clique no mapa para fixar esta ficha.</p>}
            </div>
          ) : (
            overview
          )}
        </aside>
      </div>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-t border-paper-200 px-4 pt-3 pb-5 sm:px-7">
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-ink-700">
            {indicatorLabel} · 5 grupos de 15 municípios
          </p>
          <ul aria-label="Legenda" className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-[13px] text-ink-700 tabular-nums">
            {legend.map((label, i) => (
              <li key={label} className="flex items-center gap-1.5">
                <span className={`inline-block h-3 w-[18px] rounded-[2px] shadow-[inset_0_0_0_1px_rgb(15_23_42/0.08)] ${SWATCHES[i]}`} aria-hidden />
                {label}
              </li>
            ))}
            {missing > 0 && (
              <li className="flex items-center gap-1.5 text-ink-500 italic">
                <span className="bg-nd inline-block h-3 w-[18px] rounded-[2px] shadow-[inset_0_0_0_1px_var(--color-paper-300)]" aria-hidden />
                não declarado ({missing})
              </li>
            )}
          </ul>
        </div>
        <div className="max-w-[30rem] text-[13px] leading-[19px] text-ink-500">{source}</div>
      </div>
    </section>
  );
}
