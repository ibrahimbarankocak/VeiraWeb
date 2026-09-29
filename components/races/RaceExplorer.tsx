"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DistanceBucket, Race, RaceType } from "../../lib/races";
import { useI18n } from "../../lib/i18n/context";
import { MONTHS_LONG, MONTHS_SHORT } from "../../lib/i18n/translations";

const BUCKETS: DistanceBucket[] = ["5K", "10K", "21K", "42K", "Ultra"];
const TYPES: RaceType[] = ["Road", "Trail", "Ultra", "Triathlon", "Cycling", "Walk"];
const TYPE_KEY: Record<RaceType, string> = {
  Road: "typeRoad",
  Trail: "typeTrail",
  Ultra: "typeUltra",
  Triathlon: "typeTriathlon",
  Cycling: "typeCycling",
  Walk: "typeWalk",
  Other: "typeOther",
};
const SORTS = ["soonest", "latest", "longest", "shortest", "name", "added"] as const;
type Sort = (typeof SORTS)[number];

const PAGE = 24;

const chip = (on: boolean) =>
  `rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
    on ? "bg-mint-bright text-onbright" : "bg-fg/[0.06] text-fg/60 hover:bg-fg/10 hover:text-fg"
  }`;

const field =
  "h-11 rounded-xl border border-fg/10 bg-fg/[0.04] px-3 text-sm font-semibold text-fg outline-none focus:border-mint-bright [&>option]:bg-panel";

function fmtKm(km: number) {
  return `${Number.isInteger(km) ? km : km.toFixed(1)}K`;
}

function RaceCard({ r, lang, t }: { r: Race; lang: "en" | "tr" | "es"; t: (path: string, vars?: Record<string, string | number>) => string }) {
  const [y, m, d] = r.date.split("-").map(Number);
  const [imgOk, setImgOk] = useState(true);
  return (
    <li>
      <Link
        href={`/races/${r.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-fg/10 bg-panel/70 transition hover:border-mint-bright/40"
      >
        <div className="relative h-36 bg-gradient-to-br from-mint/60 via-[#0d3a26] to-ink">
          {r.image && imgOk && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={r.image}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgOk(false)}
              className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100"
            />
          )}
          <div className="absolute left-3 top-3 rounded-xl bg-ink/80 px-3 py-1.5 text-center leading-none backdrop-blur">
            <p className="headline text-2xl">{d}</p>
            <p className="text-[10px] font-bold uppercase text-mint-bright">
              {MONTHS_SHORT[lang][m - 1]} {y}
            </p>
          </div>
          <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-fg/80 backdrop-blur">
            {t(`raceExplorer.${TYPE_KEY[r.type]}`)}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-display text-2xl font-bold uppercase leading-tight">{r.name}</h3>
          <p className="mt-1 text-sm text-fg/55">
            {r.location || t("raceExplorer.locationTba")}
            {r.location && !r.location.toLowerCase().includes(r.country.toLowerCase()) ? ` · ${r.country}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {r.distances.length ? (
              r.distances.slice(0, 6).map((k) => (
                <span key={k} className="rounded-md bg-mint-bright/15 px-2 py-0.5 text-[11px] font-bold text-mint-bright">
                  {fmtKm(k)}
                </span>
              ))
            ) : (
              <span className="text-[11px] font-semibold text-fg/35">{t("raceExplorer.distanceTba")}</span>
            )}
            {r.distances.length > 6 && <span className="text-[11px] text-fg/40">+{r.distances.length - 6}</span>}
          </div>
          <div className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-bold text-mint-bright">
            {t("raceExplorer.registrationDetails")}
            <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
          </div>
        </div>
      </Link>
    </li>
  );
}

export function RaceExplorer({ races }: { races: Race[] }) {
  const { t, lang } = useI18n();
  const locale = lang === "tr" ? "tr" : lang === "es" ? "es" : "en";
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("all");
  const [buckets, setBuckets] = useState<Set<DistanceBucket>>(new Set());
  const [types, setTypes] = useState<Set<RaceType>>(new Set());
  const [month, setMonth] = useState("all");
  const [sort, setSort] = useState<Sort>("soonest");
  const [shown, setShown] = useState(PAGE);

  const countries = useMemo(() => {
    const m = new Map<string, number>();
    races.forEach((r) => m.set(r.country, (m.get(r.country) ?? 0) + 1));
    return [...m.entries()].sort((a, b) =>
      a[0] === "Türkiye" ? -1 : b[0] === "Türkiye" ? 1 : b[1] - a[1] || a[0].localeCompare(b[0])
    );
  }, [races]);

  const months = useMemo(
    () => [...new Set(races.map((r) => r.date.slice(0, 7)))].sort(),
    [races]
  );

  const list = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase(locale);
    const out = races.filter((r) => {
      if (country !== "all" && r.country !== country) return false;
      if (month !== "all" && !r.date.startsWith(month)) return false;
      if (buckets.size && !r.buckets.some((b) => buckets.has(b))) return false;
      if (types.size && !types.has(r.type)) return false;
      if (needle) {
        const hay = `${r.name} ${r.nameLocal} ${r.location} ${r.country}`.toLocaleLowerCase(locale);
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    const maxKm = (r: Race) => (r.distances.length ? r.distances[r.distances.length - 1] : -1);
    const minKm = (r: Race) => (r.distances.length ? r.distances[0] : Infinity);
    out.sort((a, b) => {
      switch (sort) {
        case "latest": return b.date.localeCompare(a.date);
        case "longest": return maxKm(b) - maxKm(a) || a.date.localeCompare(b.date);
        case "shortest": return minKm(a) - minKm(b) || a.date.localeCompare(b.date);
        case "name": return a.name.localeCompare(b.name);
        case "added": return b.added.localeCompare(a.added);
        default: return a.date.localeCompare(b.date) || a.name.localeCompare(b.name);
      }
    });
    return out;
  }, [races, q, country, month, buckets, types, sort, locale]);

  const toggle = <T,>(set: Set<T>, v: T, setter: (s: Set<T>) => void) => {
    const n = new Set(set);
    n.has(v) ? n.delete(v) : n.add(v);
    setter(n);
    setShown(PAGE);
  };

  const active = q || country !== "all" || month !== "all" || buckets.size || types.size;
  const reset = () => {
    setQ(""); setCountry("all"); setMonth("all"); setBuckets(new Set()); setTypes(new Set()); setShown(PAGE);
  };

  return (
    <div>
      <div className="z-30 -mx-5 lg:sticky lg:top-16 lg:transition-transform lg:duration-300 lg:[html[data-nav=hidden]_&]:translate-y-[calc(-100%-4rem)] border-b border-fg/10 bg-ink/85 px-5 py-4 backdrop-blur-xl md:-mx-8 md:px-8">
        <div className="mx-auto max-w-7xl space-y-3">
          <div className="flex flex-wrap gap-3">
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setShown(PAGE); }}
              placeholder={t("raceExplorer.searchPlaceholder")}
              aria-label={t("raceExplorer.searchLabel")}
              className={`${field} min-w-[14rem] flex-1 placeholder:text-fg/35`}
            />
            <select value={country} onChange={(e) => { setCountry(e.target.value); setShown(PAGE); }} aria-label={t("raceExplorer.countryLabel")} className={field}>
              <option value="all">{t("raceExplorer.allCountries")}</option>
              {countries.map(([c, n]) => (
                <option key={c} value={c}>{c} ({n})</option>
              ))}
            </select>
            <select value={month} onChange={(e) => { setMonth(e.target.value); setShown(PAGE); }} aria-label={t("raceExplorer.monthLabel")} className={field}>
              <option value="all">{t("raceExplorer.anyMonth")}</option>
              {months.map((m) => (
                <option key={m} value={m}>{MONTHS_LONG[lang][+m.slice(5) - 1]} {m.slice(0, 4)}</option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label={t("raceExplorer.sortLabel")} className={field}>
              {SORTS.map((s) => (
                <option key={s} value={s}>{t(`raceExplorer.sort${s[0].toUpperCase()}${s.slice(1)}`)}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {BUCKETS.map((b) => (
              <button key={b} onClick={() => toggle(buckets, b, setBuckets)} aria-pressed={buckets.has(b)} className={chip(buckets.has(b))}>
                {b}
              </button>
            ))}
            <span className="mx-1 h-5 w-px bg-fg/15" />
            {TYPES.map((ty) => (
              <button key={ty} onClick={() => toggle(types, ty, setTypes)} aria-pressed={types.has(ty)} className={chip(types.has(ty))}>
                {t(`raceExplorer.${TYPE_KEY[ty]}`)}
              </button>
            ))}
            {active ? (
              <button onClick={reset} className="ml-auto text-xs font-bold text-mint-bright hover:underline">
                {t("raceExplorer.clearFilters")}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl pt-8">
        <p className="mb-6 text-sm font-semibold text-fg/50" aria-live="polite">
          {t(list.length === 1 ? "raceExplorer.countOne" : "raceExplorer.countOther", { n: list.length.toLocaleString(locale === "tr" ? "tr-TR" : locale === "es" ? "es-ES" : "en-US") })}
        </p>
        {list.length === 0 ? (
          <div className="rounded-2xl border border-fg/10 py-24 text-center">
            <p className="headline text-4xl">{t("raceExplorer.noMatch")}</p>
            <button onClick={reset} className="btn-mint mt-6">{t("raceExplorer.clearFilters")}</button>
          </div>
        ) : (
          <>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.slice(0, shown).map((r) => (
                <RaceCard key={r.id} r={r} lang={lang} t={t} />
              ))}
            </ul>
            {shown < list.length && (
              <div className="mt-12 text-center">
                <button onClick={() => setShown((s) => s + PAGE)} className="btn-mint">
                  {t("raceExplorer.showMore", { n: list.length - shown })}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
