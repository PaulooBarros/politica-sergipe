type Cell = string | number | null | undefined;

const format = (v: Cell) => {
  if (v == null) return "";
  // Brazilian spreadsheets: decimal comma, no thousands separator.
  const s = typeof v === "number" ? String(Math.round(v * 100) / 100).replace(".", ",") : v;
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV with ";" separator and UTF-8 BOM, so Excel in Portuguese opens it correctly. */
export function csvResponse(filename: string, headers: string[], rows: Cell[][]) {
  const body = [headers, ...rows].map((r) => r.map(format).join(";")).join("\r\n");
  return new Response(`﻿${body}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
