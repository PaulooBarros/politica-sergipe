"use client";

import { useState } from "react";

/** WhatsApp share and copy-link buttons. `path` is the page path; the site origin is added on click. */
export default function ShareButtons({ text, path }: { text: string; path: string }) {
  const [copied, setCopied] = useState(false);
  const fullUrl = () => `${window.location.origin}${path}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${fullUrl()}`)}`, "_blank", "noopener")}
        className="inline-flex items-center gap-2 rounded-md bg-ink-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-700"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
        </svg>
        Compartilhar no WhatsApp
      </button>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(fullUrl());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // Clipboard blocked; nothing else to do.
          }
        }}
        className="rounded-md border border-paper-300 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-brand-400 hover:text-brand-800"
      >
        {copied ? "Link copiado ✓" : "Copiar link"}
      </button>
    </div>
  );
}
