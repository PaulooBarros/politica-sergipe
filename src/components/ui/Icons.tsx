type Props = { className?: string };

export function DownloadIcon({ className = "h-3.5 w-3.5" }: Props) {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden>
      <path d="M7 1v8M3.5 5.5L7 9l3.5-3.5M1.5 12.5h11" />
    </svg>
  );
}

export function SearchIcon({ className = "h-4 w-4" }: Props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <circle cx="7" cy="7" r="5" />
      <path d="M11 11l3.5 3.5" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "h-2 w-3" }: Props) {
  return (
    <svg viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M1 1.5l5 5 5-5" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "h-[18px] w-[18px]" }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={`fill-current ${className}`} aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}
