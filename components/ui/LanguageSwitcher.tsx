"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "../../lib/i18n/context";
import { LANGS } from "../../lib/i18n/translations";

/** EN / TR / ES dropdown. Styled to match ThemeToggle. */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Language"
        className={`grid h-10 min-w-10 place-items-center rounded-full border border-fg/10 px-2.5 text-xs font-bold text-fg/70 transition hover:border-mint-bright/50 hover:text-fg ${className}`}
      >
        {current.short}
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-xl border border-fg/10 bg-panel py-1.5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)]"
        >
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                role="option"
                aria-selected={l.code === lang}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-sm font-semibold transition hover:bg-fg/5 ${
                  l.code === lang ? "text-mint-bright" : "text-fg/80"
                }`}
              >
                {l.label}
                {l.code === lang && <span aria-hidden>✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
