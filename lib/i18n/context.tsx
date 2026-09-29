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
 * Language state lives entirely on the client. It always starts as "en" — matching what the
 * server renders — and only switches (to a saved choice, or a guess from the browser) after
 * mount, so there is never a hydration mismatch. Returning non-English visitors see a brief
 * flash of English before their language kicks in.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    let initial: Lang | null = null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "tr" || saved === "es") initial = saved;
    } catch {
      /* private mode: fall through to the browser-language guess */
    }
    if (!initial) {
      const nav = navigator.language.toLowerCase();
      if (nav.startsWith("tr")) initial = "tr";
      else if (nav.startsWith("es")) initial = "es";
    }
    if (initial && initial !== "en") setLangState(initial);
    document.documentElement.lang = initial ?? "en";
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
