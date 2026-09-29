import { ImageResponse } from "next/og";
import { getEntityYear, LATEST_YEAR } from "@/features/budget/data";
import { getMunicipalityRows } from "@/features/budget/metrics";
import { getInsights } from "@/features/insights/rules";
import { getMunicipalityBySlug } from "@/features/municipalities/registry";
import { formatBRL, formatBRLShort, formatPercent } from "@/lib/format";

export const alt = "Resumo das contas públicas do município";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card for WhatsApp and social networks: the three key numbers of the latest year. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const municipality = getMunicipalityBySlug(slug);
  const row = getMunicipalityRows(LATEST_YEAR).find((r) => r.code === municipality?.code);
  const entity = municipality ? getEntityYear(municipality.code, LATEST_YEAR) : null;
  const insights = municipality ? getInsights(municipality.code, LATEST_YEAR).length : 0;

  const stats = [
    { label: "arrecadou", value: formatBRLShort(entity?.revenue?.total) },
    { label: "gasto por habitante", value: formatBRL(row?.paidPerCapita) },
    { label: "do orçamento executado", value: formatPercent(row?.execution) },
  ];

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#321c4a", color: "white", padding: 64 }}>
        <div style={{ display: "flex", fontSize: 28, color: "#dac9ec" }}>Contas públicas · Sergipe · {LATEST_YEAR}</div>
        <div style={{ display: "flex", fontSize: 88, fontWeight: 700, marginTop: 24, letterSpacing: -2 }}>
          {municipality?.name ?? "Município"}
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#dac9ec", marginTop: 4 }}>{municipality?.territory ?? ""}</div>
        <div style={{ display: "flex", gap: 32, marginTop: "auto" }}>
          {stats.map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: 28 }}>
              <div style={{ display: "flex", fontSize: 42, fontWeight: 700 }}>{s.value}</div>
              <div style={{ display: "flex", fontSize: 26, color: "#dac9ec", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 32, fontSize: 30 }}>
          <div style={{ display: "flex", width: 36, height: 36, borderRadius: 18, background: insights ? "#d97706" : "#7c4dab", marginRight: 16, alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            {insights ? "▲" : "✓"}
          </div>
          {insights
            ? `${insights} ${insights === 1 ? "ponto de atenção" : "pontos de atenção"} nos dados oficiais`
            : "Nenhum ponto de atenção nos dados oficiais"}
        </div>
      </div>
    ),
    size,
  );
}
