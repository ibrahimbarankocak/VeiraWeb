"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { range, smooth, useMap } from "./hooks";

export type CollageRace = { id: string; name: string; date: string; country: string; image: string | null };

// [x vw, y vh, rotation deg] — where each card starts (scattered) and where it lands (a loose pile).
const START: [number, number, number][] = [[-58, -48, -28], [58, -52, 24], [-62, 46, -18], [60, 50, 26], [-10, -80, 10], [12, 80, -12]];
const END: [number, number, number][] = [[-9, -6, -9], [8, -9, 7], [-6, 7, 5], [7, 6, -6], [-1, -1, -2], [2, 1, 3]];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = (iso: string) => {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH[m - 1]}`;
};

export function RaceCollage({ races, total }: { races: CollageRace[]; total: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const real = useTransform(p, (v) => smooth(range(v, 0.05, 0.55)));
  const fixed = useMotionValue(1);
  const e = reduce ? fixed : real;
  const zoom = useMap(p, 0.6, 1, 1, 1.12);
  const label = useMap(p, 0.5, 0.68, 0, 1);
  const labelY = useMap(p, 0.5, 0.68, 30, 0);

  return (
    <section ref={ref} className={reduce ? "relative min-h-screen" : "relative h-[260vh]"}>
      <div
        className={`${reduce ? "" : "sticky top-0"} h-screen overflow-hidden`}
        style={{ "--cw": "clamp(140px, 15vw, 240px)" } as React.CSSProperties}
      >
        <motion.div
          style={reduce ? undefined : { opacity: label, y: labelY }}
          className="absolute inset-x-0 top-[11%] z-30 px-5 text-center"
        >
          <p className="eyebrow mb-3">Race calendar</p>
          <h2 className="headline text-[clamp(2.2rem,5vw,4.6rem)]">
            {total.toLocaleString("en-US")} upcoming races.
            <br />
            <span className="grad-text">One calendar.</span>
          </h2>
        </motion.div>

        <motion.div style={{ scale: reduce ? 1 : zoom }} className="absolute inset-x-0 bottom-0 top-[12vh]">
          {races.slice(0, 6).map((r, i) => (
            <PileCard key={r.id} i={i} race={r} e={e} />
          ))}
        </motion.div>

        <motion.div
          style={reduce ? undefined : { opacity: label, y: labelY }}
          className="absolute inset-x-0 bottom-[9%] z-30 text-center"
        >
          <Link href="/races" className="btn-mint">
            Browse all races
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function PileCard({ i, race, e }: { i: number; race: CollageRace; e: MotionValue<number> }) {
  const [sx, sy, sr] = START[i % START.length];
  const [ex, ey, er] = END[i % END.length];
  const x = useTransform(e, (v) => `${lerp(sx, ex, v)}vw`);
  const y = useTransform(e, (v) => `${lerp(sy, ey, v)}vh`);
  const rotate = useTransform(e, (v) => lerp(sr, er, v));
  return (
    <motion.figure
      style={{ x, y, rotate, zIndex: i, width: "var(--cw)", aspectRatio: "4 / 5" }}
      className="absolute left-1/2 top-1/2 -ml-[calc(var(--cw)/2)] -mt-[calc(var(--cw)*0.625)] overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-mint via-[#0d3a26] to-ink shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
    >
      {race.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={race.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/95 via-ink/60 to-transparent p-3 pt-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-mint-bright">
          {fmt(race.date)} · {race.country}
        </p>
        <p className="mt-0.5 line-clamp-2 font-display text-lg font-bold uppercase leading-tight">{race.name}</p>
      </div>
    </motion.figure>
  );
}
