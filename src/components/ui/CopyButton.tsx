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
      className={`rounded-md border border-paper-300 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-brand-400 hover:text-brand-800 ${className}`}
    >
      {copied ? "Copiado ✓" : label}
    </button>
  );
}
