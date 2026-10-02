"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { range, smooth, useMap } from "./hooks";
import { useI18n } from "../../lib/i18n/context";
import { MONTHS_SHORT } from "../../lib/i18n/translations";
import { IpadFrame } from "../ui/ipad";

export type CollageRace = { id: string; name: string; date: string; country: string; image: string | null };

// [x vw, y vh] — where each card starts (off past either edge of the screen) and where it lands,
// arranged as a tidy 3x2 grid lined up inside the iPad's screen instead of a scattered pile.
const START: [number, number][] = [[-62, -10], [62, -10], [-66, 4], [66, 4], [-60, 18], [60, 18]];
const END: [number, number][] = [[-12, -7], [0, -7], [12, -7], [-12, 7], [0, 7], [12, 7]];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function RaceCollage({ races, total }: { races: CollageRace[]; total: number }) {
  const { t, lang } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const real = useTransform(p, (v) => smooth(range(v, 0.05, 0.55)));
  const fixed = useMotionValue(1);
  const e = reduce ? fixed : real;
  const zoom = useMap(p, 0.6, 1, 1, 1.06);
  const label = useMap(p, 0.5, 0.68, 0, 1);
  const labelY = useMap(p, 0.5, 0.68, 30, 0);

  return (
    <section ref={ref} className={reduce ? "relative min-h-screen" : "relative h-[260vh]"}>
      <div className={`${reduce ? "" : "sticky top-0"} h-screen overflow-hidden`}>
        <motion.div
          style={reduce ? undefined : { opacity: label, y: labelY }}
          className="absolute inset-x-0 top-[9%] z-30 px-5 text-center"
        >
          <p className="eyebrow mb-3">{t("collage.eyebrow")}</p>
          <h2 className="headline text-[clamp(2.2rem,5vw,4.6rem)]">
            {t("collage.headline", { n: total.toLocaleString(lang === "tr" ? "tr-TR" : lang === "es" ? "es-ES" : "en-US") })}
            <br />
            <span className="grad-text">{t("collage.headlineGrad")}</span>
          </h2>
        </motion.div>

        <motion.div style={{ scale: reduce ? 1 : zoom }} className="absolute inset-0 grid place-items-center">
          <IpadFrame className="w-[78vw] max-w-[760px]" />
          <div className="pointer-events-none absolute inset-0">
            {races.slice(0, 6).map((r, i) => (
              <PileCard key={r.id} i={i} race={r} e={e} lang={lang} />
            ))}
          </div>
        </motion.div>

        <motion.div
          style={reduce ? undefined : { opacity: label, y: labelY }}
          className="absolute inset-x-0 bottom-[9%] z-30 text-center"
        >
          <Link href="/races" className="btn-mint">
            {t("collage.cta")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function PileCard({ i, race, e, lang }: { i: number; race: CollageRace; e: MotionValue<number>; lang: keyof typeof MONTHS_SHORT }) {
  const [sx, sy] = START[i % START.length];
  const [ex, ey] = END[i % END.length];
  const x = useTransform(e, (v) => `${lerp(sx, ex, v)}vw`);
  const y = useTransform(e, (v) => `${lerp(sy, ey, v)}vh`);
  const rotate = useTransform(e, (v) => lerp(i % 2 ? 10 : -10, 0, v));
  const [, m, d] = race.date.split("-").map(Number);
  return (
    <motion.figure
      style={{ x, y, rotate, zIndex: 10 + i, width: "var(--cw, clamp(74px, 7.2vw, 112px))", aspectRatio: "4 / 5" }}
      className="absolute left-1/2 top-1/2 -ml-[calc(var(--cw,clamp(74px,7.2vw,112px))/2)] -mt-[calc(var(--cw,clamp(74px,7.2vw,112px))*0.625)] overflow-hidden rounded-lg border border-white/15 bg-gradient-to-br from-mint via-[#0d3a26] to-ink shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8)]"
    >
      {race.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={race.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/95 via-ink/60 to-transparent p-1.5 pt-6">
        <p className="text-[7px] font-bold uppercase tracking-widest text-mint-bright">
          {d} {MONTHS_SHORT[lang][m - 1]} · {race.country}
        </p>
        <p className="line-clamp-2 font-display text-[10px] font-bold uppercase leading-tight text-white">{race.name}</p>
      </div>
    </motion.figure>
  );
}
