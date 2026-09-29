import { geoArea, geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, Position } from "geojson";
import mapData from "../../../data/sergipe-municipios.json";
import { slugify } from "@/lib/slug";
import type { MapShape } from "./MapExplorer";
import { MAP_HEIGHT, MAP_WIDTH } from "./constants";

type MunicipalityProps = { code: string; name: string };
type MapData = FeatureCollection<Geometry, MunicipalityProps> & {
  metadata: { source: string; meshPeriod: string };
};

const data = mapData as unknown as MapData;

export const mapSource = {
  label: data.metadata.source,
  period: data.metadata.meshPeriod,
};

// d3-geo expects clockwise exterior rings, while IBGE follows RFC 7946
// (counter-clockwise). A reversed ring covers almost the whole globe, so we
// reverse any feature whose spherical area exceeds a hemisphere.
function rewind(feature: Feature<Geometry, MunicipalityProps>) {
  if (geoArea(feature as GeoPermissibleObjects) <= 2 * Math.PI) return feature;
  const reverseRings = (rings: Position[][]) => rings.map((r) => [...r].reverse());
  const g = feature.geometry;
  const geometry =
    g.type === "Polygon"
      ? { ...g, coordinates: reverseRings(g.coordinates) }
      : g.type === "MultiPolygon"
        ? { ...g, coordinates: g.coordinates.map(reverseRings) }
        : g;
  return { ...feature, geometry };
}

export function getMunicipalityShapes(): MapShape[] {
  const features = data.features.map(rewind);
  const collection = { type: "FeatureCollection", features } as GeoPermissibleObjects;
  const projection = geoMercator().fitSize([MAP_WIDTH, MAP_HEIGHT], collection);
  const toPath = geoPath(projection);

  return features.map((f) => ({
    code: f.properties.code,
    name: f.properties.name,
    slug: slugify(f.properties.name),
    d: toPath(f as GeoPermissibleObjects) ?? "",
  }));
}
