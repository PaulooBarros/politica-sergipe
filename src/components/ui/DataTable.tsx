import type { ReactNode } from "react";

/** Shared look for data tables: grey header band, thin row rules, numbers right-aligned. */
export function DataTable({
  children,
  minWidth = 720,
  testId,
  caption,
}: {
  children: ReactNode;
  minWidth?: number;
  testId?: string;
  caption?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-paper-200 bg-white">
      <table
        className="w-full border-collapse text-[15px] tabular-nums [&_tbody_tr]:border-t [&_tbody_tr]:border-paper-200 [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-brand-50"
        style={{ minWidth }}
        data-testid={testId}
      >
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  align = "left",
  className = "",
  sort,
}: {
  children?: ReactNode;
  align?: "left" | "right";
  className?: string;
  sort?: "ascending" | "descending" | "none";
}) {
  return (
    <th
      scope="col"
      aria-sort={sort}
      className={`border-b border-paper-300 bg-paper-100 px-4 py-3 text-[13px] font-semibold whitespace-nowrap text-ink-700 ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  className = "",
  colSpan,
}: {
  children?: ReactNode;
  align?: "left" | "right";
  className?: string;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={`px-4 py-2.5 align-middle ${align === "right" ? "text-right whitespace-nowrap" : ""} ${className}`}
    >
      {children}
    </td>
  );
}
