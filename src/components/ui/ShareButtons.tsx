"use client";

import { useState } from "react";
import { WhatsAppIcon } from "./Icons";

/** WhatsApp share and copy-link buttons. `path` is the page path; the site origin is added on click. */
export default function ShareButtons({ text, path }: { text: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const fullUrl = () => `${window.location.origin}${path}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${fullUrl()}`)}`, "_blank", "noopener")}
        className="btn btn-primary"
      >
        <WhatsAppIcon />
        Enviar no WhatsApp
      </button>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(fullUrl());
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
          } catch {
            // Clipboard blocked; nothing else to do.
          }
        }}
        className="btn btn-secondary"
      >
        <span aria-live="polite">{copied ? "✓ Link copiado" : "Copiar link"}</span>
      </button>
    </div>
  );
}
