import { ImageResponse } from "next/og";
import { LATEST_YEAR } from "@/features/budget/data";
import { getComparisons, getMunicipalityRows, ratio } from "@/features/budget/metrics";
import { getInsights } from "@/features/insights/rules";
import { MAP_HEIGHT, MAP_WIDTH } from "@/features/map/constants";
import { getMunicipalityShapes } from "@/features/map/geo";
import { getMunicipalityBySlug } from "@/features/municipalities/registry";
import { formatBRL, formatBRLShort, formatInteger, formatPercent } from "@/lib/format";

export const alt = "Resumo das contas públicas do município";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0f172a";
const INK_700 = "#334155";
const BRAND_600 = "#683c94";
const BRAND_700 = "#55307a";
const BRAND_900 = "#321c4a";
const PAPER_200 = "#e6e9ef";
const ALERT_700 = "#92400e";

/** Share card for WhatsApp and social networks: key numbers of the latest year and the municipality on the map. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const municipality = getMunicipalityBySlug(slug);
  const row = getMunicipalityRows(LATEST_YEAR).find((r) => r.code === municipality?.code);
  const insights = municipality ? getInsights(municipality.code, LATEST_YEAR) : [];
  const sizeMedian = municipality
    ? (getComparisons(municipality.code, LATEST_YEAR, null).find((c) => c.label === "Mediana do mesmo porte")?.value ?? null)
    : null;
  const r = ratio(row?.paidPerCapita, sizeMedian);
  const shapes = getMunicipalityShapes();

  const stats = [
    { label: "Gasto pago", value: formatBRLShort(row?.paid), note: `${formatPercent(row?.execution)} do orçamento`, alert: false },
    {
      label: "Por habitante",
      value: formatBRL(row?.paidPerCapita),
      note: r == null ? "" : `${Math.round(Math.abs(r - 1) * 100)}% ${r >= 1 ? "acima" : "abaixo"} do porte`,
      alert: false,
    },
    {
      label: "Pontos de atenção",
      value: row?.paid == null ? "—" : String(insights.length),
      note: insights.length ? "▲ ver no raio-x" : "nenhum",
      alert: insights.length > 0,
    },
  ];

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "white", borderTop: `10px solid ${BRAND_900}`, color: INK }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "52px 0 48px 64px" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 24, fontWeight: 600 }}>
            Contas públicas
            <span style={{ color: BRAND_600, marginLeft: 8, fontWeight: 500 }}>· Sergipe</span>
          </div>
          <div style={{ display: "flex", marginTop: 52, fontSize: 20, fontWeight: 600, letterSpacing: 2, color: BRAND_600 }}>
            RAIO-X DO MUNICÍPIO · {LATEST_YEAR}
          </div>
          <div style={{ display: "flex", marginTop: 10, fontSize: municipality && municipality.name.length > 18 ? 64 : 80, fontWeight: 700, letterSpacing: -2, lineHeight: 1.02, maxWidth: 680 }}>
            {municipality?.name ?? "Município"}
          </div>
          <div style={{ display: "flex", marginTop: 14, fontSize: 24, color: INK_700 }}>
            {municipality?.territory ?? ""} · {formatInteger(row?.population)} habitantes
          </div>
          <div style={{ display: "flex", gap: 44, marginTop: "auto" }}>
            {stats.map((s) => (
              <div key={s.label} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 19, fontWeight: 600, color: INK_700 }}>{s.label}</div>
                <div style={{ display: "flex", fontSize: 46, fontWeight: 700, marginTop: 6 }}>{s.value}</div>
                <div style={{ display: "flex", fontSize: 18, marginTop: 4, color: s.alert ? ALERT_700 : INK_700, fontWeight: s.alert ? 600 : 400 }}>{s.note}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: 420, alignItems: "center", justifyContent: "center", position: "relative" }}>
          <svg width="340" height={Math.round((340 * MAP_HEIGHT) / MAP_WIDTH)} viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}>
            {shapes.map((s) => (
              <path key={s.code} d={s.d} fill={s.code === municipality?.code ? BRAND_700 : PAPER_200} stroke="white" strokeWidth={1.4} />
            ))}
          </svg>
          <div style={{ display: "flex", position: "absolute", right: 48, bottom: 40, fontSize: 15, color: INK_700 }}>
            Fonte: SICONFI/Tesouro Nacional e IBGE
          </div>
        </div>
      </div>
    ),
    size,
  );
}
