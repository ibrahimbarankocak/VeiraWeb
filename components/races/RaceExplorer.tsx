"use client";

import { useMemo, useState } from "react";
import type { DistanceBucket, Race, RaceType } from "../../lib/races";

const BUCKETS: DistanceBucket[] = ["5K", "10K", "21K", "42K", "Ultra"];
const TYPES: RaceType[] = ["Road", "Trail", "Ultra", "Triathlon", "Cycling", "Walk"];
const SORTS = [
  { v: "soonest", label: "Soonest" },
  { v: "latest", label: "Latest" },
  { v: "longest", label: "Longest distance" },
  { v: "shortest", label: "Shortest distance" },
  { v: "name", label: "Name A–Z" },
  { v: "added", label: "Newly added" },
] as const;
type Sort = (typeof SORTS)[number]["v"];

const PAGE = 24;
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const chip = (on: boolean) =>
  `rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
    on ? "bg-mint-bright text-ink" : "bg-white/[0.06] text-white/60 hover:bg-white/10 hover:text-white"
  }`;

const field =
  "h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-white outline-none focus:border-mint-bright [&>option]:bg-panel";

function fmtKm(km: number) {
  return `${Number.isInteger(km) ? km : km.toFixed(1)}K`;
}

function RaceCard({ r }: { r: Race }) {
  const [y, m, d] = r.date.split("-").map(Number);
  const [imgOk, setImgOk] = useState(true);
  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel/70 transition hover:border-mint-bright/40">
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
          <p className="text-[10px] font-bold uppercase text-mint-bright">{MONTH[m - 1]} {y}</p>
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/80 backdrop-blur">
          {r.type}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-2xl font-bold uppercase leading-tight">{r.name}</h3>
        <p className="mt-1 text-sm text-white/55">
          {r.location || "Location TBA"}
          {r.location && !r.location.toLowerCase().includes(r.country.toLowerCase()) ? ` · ${r.country}` : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {r.distances.length ? (
            r.distances.slice(0, 6).map((k) => (
              <span key={k} className="rounded-md bg-mint/40 px-2 py-0.5 text-[11px] font-bold text-mint-light">
                {fmtKm(k)}
              </span>
            ))
          ) : (
            <span className="text-[11px] font-semibold text-white/35">Distance TBA</span>
          )}
          {r.distances.length > 6 && <span className="text-[11px] text-white/40">+{r.distances.length - 6}</span>}
        </div>
        <div className="mt-auto pt-4">
          {r.url ? (
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-mint-bright hover:underline"
            >
              Registration & details <span aria-hidden>↗</span>
            </a>
          ) : (
            <span className="text-xs font-semibold text-white/30">No registration link yet</span>
          )}
        </div>
      </div>
    </li>
  );
}

export function RaceExplorer({ races }: { races: Race[] }) {
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
    const needle = q.trim().toLocaleLowerCase("tr");
    const out = races.filter((r) => {
      if (country !== "all" && r.country !== country) return false;
      if (month !== "all" && !r.date.startsWith(month)) return false;
      if (buckets.size && !r.buckets.some((b) => buckets.has(b))) return false;
      if (types.size && !types.has(r.type)) return false;
      if (needle) {
        const hay = `${r.name} ${r.nameLocal} ${r.location} ${r.country}`.toLocaleLowerCase("tr");
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
  }, [races, q, country, month, buckets, types, sort]);

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
      <div className="z-30 -mx-5 lg:sticky lg:top-16 border-b border-white/10 bg-ink/85 px-5 py-4 backdrop-blur-xl md:-mx-8 md:px-8">
        <div className="mx-auto max-w-7xl space-y-3">
          <div className="flex flex-wrap gap-3">
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setShown(PAGE); }}
              placeholder="Search race, city or country…"
              aria-label="Search races"
              className={`${field} min-w-[14rem] flex-1 placeholder:text-white/35`}
            />
            <select value={country} onChange={(e) => { setCountry(e.target.value); setShown(PAGE); }} aria-label="Country" className={field}>
              <option value="all">All countries</option>
              {countries.map(([c, n]) => (
                <option key={c} value={c}>{c} ({n})</option>
              ))}
            </select>
            <select value={month} onChange={(e) => { setMonth(e.target.value); setShown(PAGE); }} aria-label="Month" className={field}>
              <option value="all">Any month</option>
              {months.map((m) => (
                <option key={m} value={m}>{MONTH_LONG[+m.slice(5) - 1]} {m.slice(0, 4)}</option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort by" className={field}>
              {SORTS.map((s) => (
                <option key={s.v} value={s.v}>Sort: {s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {BUCKETS.map((b) => (
              <button key={b} onClick={() => toggle(buckets, b, setBuckets)} aria-pressed={buckets.has(b)} className={chip(buckets.has(b))}>
                {b}
              </button>
            ))}
            <span className="mx-1 h-5 w-px bg-white/15" />
            {TYPES.map((t) => (
              <button key={t} onClick={() => toggle(types, t, setTypes)} aria-pressed={types.has(t)} className={chip(types.has(t))}>
                {t}
              </button>
            ))}
            {active ? (
              <button onClick={reset} className="ml-auto text-xs font-bold text-mint-bright hover:underline">
                Clear filters
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl pt-8">
        <p className="mb-6 text-sm font-semibold text-white/50" aria-live="polite">
          {list.length.toLocaleString("en-US")} race{list.length === 1 ? "" : "s"}
        </p>
        {list.length === 0 ? (
          <div className="rounded-2xl border border-white/10 py-24 text-center">
            <p className="headline text-4xl">No races match</p>
            <button onClick={reset} className="btn-mint mt-6">Clear filters</button>
          </div>
        ) : (
          <>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.slice(0, shown).map((r) => (
                <RaceCard key={r.id} r={r} />
              ))}
            </ul>
            {shown < list.length && (
              <div className="mt-12 text-center">
                <button onClick={() => setShown((s) => s + PAGE)} className="btn-mint">
                  Show more ({list.length - shown} left)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
