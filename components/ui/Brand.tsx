import Link from "next/link";

export function Bolt({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M13.5 2 4 13.5h6.2L9 22l10-12.2h-6.4L13.5 2Z" />
    </svg>
  );
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Veira home">
      <span
        className={`grid h-9 w-9 place-items-center rounded-xl ${
          dark ? "bg-mint text-mint-light" : "bg-mint/40 text-mint-bright ring-1 ring-mint-bright/30"
        }`}
      >
        <Bolt />
      </span>
      <span
        className={`font-display text-3xl font-bold lowercase leading-none tracking-tight ${
          dark ? "text-onmint" : "text-fg"
        }`}
      >
        veira
      </span>
    </Link>
  );
}
