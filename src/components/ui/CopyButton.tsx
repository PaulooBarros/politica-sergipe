"use client";

import { useState } from "react";

export default function CopyButton({ text, label = "Copiar", className = "" }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard blocked: the text stays visible for manual copy.
        }
      }}
      className={`btn btn-secondary ${className}`}
    >
      <span aria-live="polite">{copied ? "✓ Copiado" : label}</span>
    </button>
  );
}
