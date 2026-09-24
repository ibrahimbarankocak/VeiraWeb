"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const KEY = "veira-theme";

/** Sun/moon button. Follows the OS setting until the visitor picks a theme, then remembers the choice. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const explicit = document.documentElement.dataset.theme;
    setTheme(
      explicit === "light" || explicit === "dark"
        ? explicit
        : window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark"
    );
  }, []);

  const flip = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* private mode: the choice just won't persist */
    }
    setTheme(next);
  };

  return (
    <button
      onClick={flip}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      title={theme === "light" ? "Dark mode" : "Light mode"}
      className={`grid h-10 w-10 place-items-center rounded-full border border-fg/10 text-fg/70 transition hover:border-mint-bright/50 hover:text-fg ${className}`}
    >
      {/* Render nothing until the theme is known, so server and client markup match. */}
      {theme === "dark" && (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
      {theme === "light" && (
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
}
