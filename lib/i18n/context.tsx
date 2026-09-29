"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dictionaries, type Lang } from "./translations";

const STORAGE_KEY = "veira-lang";

type Vars = Record<string, string | number>;
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (path: string, vars?: Vars) => string };

const I18nContext = createContext<Ctx | null>(null);

function get(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

function interpolate(s: string, vars?: Vars): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/**
 * Turkish is the site's main language. State lives entirely on the client and always starts
 * as "tr" — matching what the server renders — switching only after mount (to a saved choice)
 * so there is never a hydration mismatch. Visitors who have explicitly picked English or
 * Spanish before get that back; everyone else sees Turkish, with no browser-language guessing
 * overriding it.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("tr");

  useEffect(() => {
    let saved: Lang | null = null;
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "en" || v === "tr" || v === "es") saved = v;
    } catch {
      /* private mode: nothing saved, Turkish stays the default */
    }
    if (saved && saved !== "tr") setLangState(saved);
    document.documentElement.lang = saved ?? "tr";
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    document.documentElement.lang = l;
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* private mode: the choice just won't persist */
    }
  };

  const t = useMemo(() => {
    const dict = dictionaries[lang];
    const fallback = dictionaries.en;
    return (path: string, vars?: Vars) => {
      const v = get(dict, path) ?? get(fallback, path);
      return typeof v === "string" ? interpolate(v, vars) : path;
    };
  }, [lang]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within a LanguageProvider");
  return ctx;
}
