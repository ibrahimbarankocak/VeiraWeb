"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { range, smooth, useMap, useMinWidth, usePointerFine } from "./hooks";
import { Reveal } from "../ui/Reveal";
import { useI18n } from "../../lib/i18n/context";
import { MONTHS_SHORT } from "../../lib/i18n/translations";
import { IpadFrame } from "../ui/ipad";

export type CollageRace = { id: string; name: string; date: string; country: string; image: string | null };

// [x%, y%] offsets from the iPad frame's own center — percent of the frame itself, not the
// viewport, so cards stay aligned with the screen no matter how big the frame renders.
// START keeps cards well past the frame's edges (frame width is capped, viewport isn't, so this
// has generous margin); END lines them up in a 3x2 grid inside the screen cutout.
const START: [number, number][] = [[-220, -40], [220, -40], [-230, 10], [230, 10], [-215, 60], [215, 60]];
const END: [number, number][] = [[-29.31, -18.88], [0, -18.88], [29.31, -18.88], [-29.31, 18.88], [0, 18.88], [29.31, 18.88]];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function RaceThumb({ race, lang }: { race: CollageRace; lang: keyof typeof MONTHS_SHORT }) {
  const [, m, d] = race.date.split("-").map(Number);
  return (
    <figure className="relative aspect-[4/5] overflow-hidden rounded-xl border border-white/15 bg-gradient-to-br from-mint via-[#0d3a26] to-ink shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8)]">
      {race.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={race.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/95 via-ink/60 to-transparent p-2 pt-8">
        <p className="text-[9px] font-bold uppercase tracking-widest text-mint-bright">
          {d} {MONTHS_SHORT[lang][m - 1]} · {race.country}
        </p>
        <p className="line-clamp-2 font-display text-xs font-bold uppercase leading-tight text-white">{race.name}</p>
      </div>
    </figure>
  );
}

/** Mobile/tablet and reduced-motion: a plain grid, no scroll-jacking or iPad mockup to get wrong at small widths. */
function RaceCollageStatic({ races, total }: { races: CollageRace[]; total: number }) {
  const { t, lang } = useI18n();
  return (
    <Reveal>
      <div className="text-center">
        <p className="eyebrow mb-3">{t("collage.eyebrow")}</p>
        <h2 className="headline text-[clamp(2.2rem,8vw,4.6rem)]">
          {t("collage.headline", { n: total.toLocaleString(lang === "tr" ? "tr-TR" : lang === "es" ? "es-ES" : "en-US") })}
          <br />
          <span className="grad-text">{t("collage.headlineGrad")}</span>
        </h2>
      </div>
      <div className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-3">
        {races.slice(0, 6).map((r) => (
          <RaceThumb key={r.id} race={r} lang={lang} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link href="/races" className="btn-mint">
          {t("collage.cta")}
        </Link>
      </div>
    </Reveal>
  );
}

export function RaceCollage({ races, total }: { races: CollageRace[]; total: number }) {
  const { t, lang } = useI18n();
  // Always mounted (even while pin is still false on first paint) so useScroll binds to a real node
  // from the start — conditionally swapping this element out for a different tree left the scroll
  // listener permanently attached to a null target and froze the card animation forever.
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const desktop = useMinWidth(1024);
  const finePointer = usePointerFine();
  const pin = desktop && finePointer && !reduce;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const e = useTransform(p, (v) => smooth(range(v, 0.05, 0.55)));
  const zoom = useMap(p, 0.6, 1, 1, 1.06);
  const label = useMap(p, 0.5, 0.68, 0, 1);
  const labelY = useMap(p, 0.5, 0.68, 30, 0);

  return (
    <section ref={ref} className={pin ? "relative h-[260vh]" : "relative px-5 py-24 md:px-8"}>
      {!pin && <RaceCollageStatic races={races} total={total} />}
      {pin && (
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.div style={{ opacity: label, y: labelY }} className="absolute inset-x-0 top-[5%] z-30 px-5 text-center">
            <p className="eyebrow mb-3">{t("collage.eyebrow")}</p>
            <h2 className="headline text-[clamp(1.8rem,min(4vw,6vh),4.2rem)]">
              {t("collage.headline", { n: total.toLocaleString(lang === "tr" ? "tr-TR" : lang === "es" ? "es-ES" : "en-US") })}
              <br />
              <span className="grad-text">{t("collage.headlineGrad")}</span>
            </h2>
          </motion.div>

          <motion.div style={{ scale: zoom }} className="absolute inset-0 grid place-items-center">
            {/* Capped by width (vw/px) AND height (vh) together — a short browser window must shrink the
                iPad instead of letting it grow tall enough to crash into the headline/CTA above and below. */}
            <div className="relative mx-auto" style={{ width: "min(78vw, 760px, 70vh)" }}>
              <IpadFrame className="w-full" />
              <div className="pointer-events-none absolute inset-0">
                {races.slice(0, 6).map((r, i) => (
                  <PileCard key={r.id} i={i} race={r} e={e} lang={lang} />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div style={{ opacity: label, y: labelY }} className="absolute inset-x-0 bottom-[5%] z-30 text-center">
            <Link href="/races" className="btn-mint">
              {t("collage.cta")}
            </Link>
          </motion.div>
        </div>
      )}
    </section>
  );
}

function PileCard({ i, race, e, lang }: { i: number; race: CollageRace; e: MotionValue<number>; lang: keyof typeof MONTHS_SHORT }) {
  const [sx, sy] = START[i % START.length];
  const [ex, ey] = END[i % END.length];
  // left/top (not transform) so the percentages resolve against the iPad frame — its containing
  // block — instead of the card's own box; x/y below is just the constant self-centering offset.
  const left = useTransform(e, (v) => `${lerp(sx, ex, v) + 50}%`);
  const top = useTransform(e, (v) => `${lerp(sy, ey, v) + 50}%`);
  const rotate = useTransform(e, (v) => lerp(i % 2 ? 10 : -10, 0, v));
  const [, m, d] = race.date.split("-").map(Number);
  return (
    <motion.figure
      style={{ left, top, x: "-50%", y: "-50%", rotate, zIndex: 10 + i, width: "clamp(56px, 24%, 108px)", aspectRatio: "4 / 5" }}
      className="absolute overflow-hidden rounded-lg border border-white/15 bg-gradient-to-br from-mint via-[#0d3a26] to-ink shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8)]"
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
