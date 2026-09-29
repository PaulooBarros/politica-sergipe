import { getMunicipalityShapes } from "@/features/map/geo";
import { MAP_HEIGHT, MAP_WIDTH } from "@/features/map/constants";

/** Sergipe silhouette used as the site mark while the project has no name. */
export default function StateMark({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className={className} aria-hidden>
      {getMunicipalityShapes().map((s) => (
        <path key={s.code} d={s.d} className="fill-current" stroke="currentColor" strokeWidth={4} />
      ))}
    </svg>
  );
}
