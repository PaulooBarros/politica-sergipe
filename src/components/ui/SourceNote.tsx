import type { ReactNode } from "react";

export default function SourceNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 text-xs leading-relaxed text-ink-500">
      <span className="font-semibold">Fonte: </span>
      {children}
    </p>
  );
}
