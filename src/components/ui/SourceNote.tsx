import type { ReactNode } from "react";

/** Source line under a chart or table: small, but always visible. */
export default function SourceNote({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-xs leading-[17px] text-ink-500 ${className}`}>
      <span className="font-semibold">Fonte: </span>
      {children}
    </p>
  );
}
