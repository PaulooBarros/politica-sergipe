import type { ReactNode } from "react";

/** Shared look for data tables: light header band, thin row rules. */
export function DataTable({ children, minWidth = 720, testId }: { children: ReactNode; minWidth?: number; testId?: string }) {
  return (
    <div className="overflow-x-auto rounded-md border border-paper-200">
      <table className="w-full text-sm" style={{ minWidth }} data-testid={testId}>
        {children}
      </table>
    </div>
  );
}

export function Th({ children, align = "left", className = "" }: { children?: ReactNode; align?: "left" | "right"; className?: string }) {
  return (
    <th
      className={`border-b border-paper-200 bg-paper-100 px-4 py-2.5 text-xs font-semibold text-ink-500 ${
        align === "right" ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, align = "left", className = "" }: { children?: ReactNode; align?: "left" | "right"; className?: string }) {
  return (
    <td
      className={`border-b border-paper-200 px-4 py-3 align-middle ${align === "right" ? "text-right tabular-nums" : ""} ${className}`}
    >
      {children}
    </td>
  );
}
