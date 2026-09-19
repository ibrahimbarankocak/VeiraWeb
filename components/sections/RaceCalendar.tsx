"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Reveal } from "../ui/Reveal";
import { PhoneFrame } from "../ui/PhoneFrame";

type Race = {
  name: string;
  city: string;
  country: "TR" | "GR" | "IT";
  day: number;
  month: "SEP" | "OCT" | "NOV";
  order: number;
  dist: string[];
  tint: string;
};

const races: Race[] = [
  { name: "Bosphorus Cross-Continental", city: "İstanbul", country: "TR", day: 21, month: "SEP", order: 1, dist: ["10K", "21K", "42K"], tint: "bg-emerald-800/70 text-emerald-100" },
  { name: "Cappadocia Ultra-Trail", city: "Ürgüp", country: "TR", day: 5, month: "OCT", order: 2, dist: ["12K", "38K", "63K"], tint: "bg-fuchsia-900/60 text-fuchsia-100" },
  { name: "Izmir Half Marathon", city: "İzmir", country: "TR", day: 19, month: "OCT", order: 3, dist: ["10K", "21K"], tint: "bg-green-900/70 text-green-100" },
  { name: "Athens Authentic Marathon", city: "Athens", country: "GR", day: 8, month: "NOV", order: 4, dist: ["10K", "42K"], tint: "bg-sky-900/60 text-sky-100" },
  { name: "Venice Marathon", city: "Venice", country: "IT", day: 25, month: "OCT", order: 5, dist: ["10K", "42K"], tint: "bg-amber-900/60 text-amber-100" },
];

const week = [
  ["MON", 14], ["TUE", 15], ["WED", 16], ["THU", 17], ["FRI", 18], ["SAT", 19], ["SUN", 20], ["MON", 21],
] as const;

const filters = ["All", "5K", "10K", "21K", "42K"];

export function RaceCalendar() {
  const [selected, setSelected] = useState(21);
  const [filter, setFilter] = useState("All");
  const [abroad, setAbroad] = useState(false);
  const [pinned, setPinned] = useState<Set<string>>(new Set());

  const visible = useMemo(
    () =>
      races
        .filter((r) => abroad || r.country === "TR")
        .filter((r) => filter === "All" || r.dist.includes(filter))
        .sort((a, b) => a.order - b.order),
    [abroad, filter]
  );

  const togglePin = (name: string) =>
    setPinned((p) => {
      const n = new Set(p);
      n.has(name) ? n.delete(name) : n.add(name);
      return n;
    });

  return (
    <section id="calendar" className="relative px-5 py-28 md:px-8 md:py-40">
      <div className="blob left-0 top-1/3 h-[32rem] w-[32rem] bg-mint/40" />
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1fr_auto]">
        <Reveal>
          <p className="eyebrow mb-4">Race calendar</p>
          <h2 className="headline text-[clamp(3.2rem,8vw,7.5rem)]">
            Every start line,
            <br />
            <span className="grad-text">one calendar</span>
          </h2>
          <p className="mt-6 max-w-lg text-lg text-white/60">
            Curated and full upcoming-race lists, fed by official federations and race platforms in Turkey and
            abroad. Filter by distance, sort by soonest, closest or popular, and pin the ones you&apos;re chasing.
            Try it — this is the real layout.
          </p>
          <ul className="mt-8 grid max-w-lg grid-cols-2 gap-3 text-sm font-semibold text-white/80">
            {["Country-first filtering", "Also show races abroad", "GPS “closest” sort", "Registration links"].map((t) => (
              <li key={t} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                {t}
              </li>
            ))}
          </ul>
          <Link href="/races" className="btn-mint mt-8">
            Browse all races
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <PhoneFrame active="Races" tint="rgba(30,110,80,0.5)" className="max-w-[360px]">
            <div className="flex h-full flex-col overflow-y-auto pb-2 [scrollbar-width:none]">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/45">Discover your next</p>
              <h3 className="headline text-[2.6rem] normal-case leading-none">Race calendar</h3>

              <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div className="flex items-center justify-between px-1 text-mint-bright">
                  <span aria-hidden>‹</span>
                  <span className="text-sm font-semibold text-white">
                    September <span className="text-white/45">2026</span>
                  </span>
                  <span aria-hidden>›</span>
                </div>
                <div className="mt-3 grid grid-cols-8 gap-0.5 text-center">
                  {week.map(([d, n], i) => (
                    <button
                      key={i}
                      onClick={() => setSelected(n)}
                      className={`rounded-lg py-1.5 ${
                        selected === n && i === 7
                          ? "border border-mint-bright/50 bg-mint/50"
                          : selected === n
                          ? "bg-mint/40"
                          : ""
                      }`}
                    >
                      <span className="block text-[7px] font-bold text-white/45">{d}</span>
                      <span className="block text-[11px] font-bold">{n}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/45">Curated for you</p>
                  <p className="headline text-2xl normal-case">Upcoming starts</p>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      filter === f ? "bg-mint text-mint-light" : "bg-white/5 text-white/50"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <label className="mt-2 flex cursor-pointer items-center gap-2 text-[10px] font-semibold text-white/60">
                <input type="checkbox" checked={abroad} onChange={(e) => setAbroad(e.target.checked)} className="accent-[#3ddc97]" />
                Also show races abroad
              </label>

              <ul className="mt-3 space-y-2">
                {visible.map((r) => (
                  <li key={r.name} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-2.5">
                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${r.tint}`}>
                      <div className="text-center leading-none">
                        <p className="headline text-xl">{r.day}</p>
                        <p className="text-[8px] font-bold">{r.month}</p>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold">{r.name}</p>
                      <p className="text-[10px] text-white/45">
                        {r.city}, {r.country}
                      </p>
                      <p className="mt-1 flex gap-1.5 text-[8px] font-bold text-white/70">
                        {r.dist.map((d) => (
                          <span key={d}>{d}</span>
                        ))}
                      </p>
                    </div>
                    <button
                      onClick={() => togglePin(r.name)}
                      aria-label={pinned.has(r.name) ? "Unpin race" : "Pin race"}
                      className={`text-lg ${pinned.has(r.name) ? "text-mint-bright" : "text-white/30"}`}
                    >
                      {pinned.has(r.name) ? "◉" : "⊕"}
                    </button>
                  </li>
                ))}
                {visible.length === 0 && <li className="py-4 text-center text-xs text-white/40">No races match.</li>}
              </ul>

              <div className="mt-3 flex items-center justify-between rounded-2xl border border-mint-bright/20 bg-mint/25 p-3 text-xs font-bold">
                <span>+ Add your race</span>
                <span className="text-[8px] text-white/50">Admin review required</span>
              </div>
            </div>
          </PhoneFrame>
        </Reveal>
      </div>
    </section>
  );
}
