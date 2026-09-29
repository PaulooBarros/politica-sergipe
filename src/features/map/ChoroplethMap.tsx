"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MAP_HEIGHT, MAP_WIDTH } from "./constants";

export type MapShape = { code: string; name: string; slug: string; d: string };
export type MapValue = { label: string; bucket: number | null };

type Props = {
  shapes: MapShape[];
  values: Record<string, MapValue>;
  legend: string[];
  /** Query string appended to municipality links, e.g. "?ano=2025". */
  linkQuery: string;
  title: string;
};

// Sequential rio ramp, light to dark; one class per legend entry.
const BUCKET_FILLS = ["fill-brand-100", "fill-brand-200", "fill-brand-400", "fill-brand-600", "fill-brand-800"];
const BUCKET_BG = ["bg-brand-100", "bg-brand-200", "bg-brand-400", "bg-brand-600", "bg-brand-800"];

export default function ChoroplethMap({ shapes, values, legend, linkQuery, title }: Props) {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const hoveredShape = shapes.find((s) => s.code === hovered);

  const open = (slug: string) => router.push(`/municipios/${slug}${linkQuery}`);

  return (
    <figure className="relative">
      <div className="pointer-events-none absolute left-0 top-0 z-10 min-h-14 rounded-md bg-paper-50/95 px-3 py-2 text-sm shadow-sm ring-1 ring-paper-200" aria-live="polite">
        {hoveredShape ? (
          <>
            <p className="font-semibold text-ink-900">{hoveredShape.name}</p>
            <p className="tabular-nums text-ink-700">{values[hoveredShape.code]?.label ?? "não declarado"}</p>
          </>
        ) : (
          <p className="text-ink-500">Passe o mouse ou clique em um município</p>
        )}
      </div>

      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="mx-auto h-auto w-full max-w-[560px]"
        role="group"
        aria-label={title}
        data-testid="map"
      >
        {shapes.map((s) => {
          const bucket = values[s.code]?.bucket;
          const fill = bucket == null ? "fill-paper-300" : BUCKET_FILLS[bucket];
          return (
            <path
              key={s.code}
              d={s.d}
              role="link"
              tabIndex={0}
              aria-label={`${s.name}: ${values[s.code]?.label ?? "não declarado"}`}
              data-code={s.code}
              onClick={() => open(s.slug)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  open(s.slug);
                }
              }}
              onMouseEnter={() => setHovered(s.code)}
              onMouseLeave={() => setHovered((h) => (h === s.code ? null : h))}
              onFocus={() => setHovered(s.code)}
              className={`${fill} cursor-pointer stroke-paper-50 stroke-[0.8] outline-none transition-[fill,stroke] hover:stroke-alert-500 hover:stroke-2 focus-visible:stroke-alert-500 focus-visible:stroke-2`}
            >
              <title>{`${s.name}: ${values[s.code]?.label ?? "não declarado"}`}</title>
            </path>
          );
        })}
      </svg>

      <figcaption className="mt-3">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-700" aria-label="Legenda">
          {legend.map((label, i) => (
            <li key={label} className="flex items-center gap-1.5">
              <span className={`inline-block h-3 w-5 rounded-sm ${BUCKET_BG[i]}`} aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
