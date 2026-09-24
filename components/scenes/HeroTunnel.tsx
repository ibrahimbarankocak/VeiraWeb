"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { RunScene } from "./RunScene";
import { range, smooth, useMap } from "./hooks";

// Concentric rounded "tunnel" rings, outermost first, drawn as crisp vector bands in a 1000 x 900 box.
// Colours come from the theme (--ring-0 .. --ring-7 in globals.css).
const N = 8;
const BOX_W = 1000;
const BOX_H = 900;
const BAND = 45; // band thickness
const R0 = 240; // outer corner radius
const R_STEP = 20; // corner radius shrinks by this much per band
const OVERLAP = 1.2; // each band tucks slightly under the next one so no hairline seams show

const HOLE_W = (BOX_W - 2 * N * BAND) / BOX_W; // opening width as a fraction of B (the ring box width)
const HOLE_H = (BOX_H - 2 * N * BAND) / BOX_W; // opening height as a fraction of B
const HOLE_R = (R0 - R_STEP * N) / BOX_W; // opening corner radius as a fraction of B

const roundedRect = (x: number, y: number, w: number, h: number, r: number) => {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
};

const BANDS = Array.from({ length: N }, (_, i) => {
  const o = i * BAND;
  const j = i + 1;
  const e = i === N - 1 ? 0 : OVERLAP; // the innermost band's inner edge is the visible opening, so no overlap there
  const inner = j * BAND + e;
  return {
    i,
    d:
      roundedRect(o, o, BOX_W - 2 * o, BOX_H - 2 * o, R0 - R_STEP * i) +
      roundedRect(inner, inner, BOX_W - 2 * inner, BOX_H - 2 * inner, R0 - R_STEP * j - e),
  };
});

/** Ring box width in px. Capped by screen height too, so the rings never crowd the headline and buttons. */
const bOf = (w: number, h: number) => Math.min(620, Math.max(260, Math.min(w * 0.4, h * 0.55)));

const Headline = () => (
  <>
    <p className="eyebrow mb-4">The running companion</p>
    <h1 className="headline mx-auto max-w-[95rem] text-[clamp(2.4rem,min(7vw,11vh),7.5rem)]">
      The smartest way to
      <br />
      <span className="grad-text">find your next race</span>
    </h1>
    <p className="mx-auto mt-5 hidden max-w-2xl text-lg text-fg/65 sm:block md:text-xl [@media(max-height:760px)]:hidden">
      Discover races, track every kilometer on every shoe, and climb the weekly league — all in one app built by
      runners, for runners.
    </p>
    <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
      <Link href="/login?mode=signup" className="btn-mint">
        Join Veira free
      </Link>
      <Link
        href="/races"
        className="rounded-full border border-fg/25 bg-ink/60 px-7 py-3.5 font-display text-lg font-bold uppercase tracking-wide text-fg backdrop-blur transition hover:border-mint-bright hover:text-mint-bright"
      >
        See the race calendar
      </Link>
    </div>
  </>
);

export function HeroTunnel() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const dims = useRef({ w: 1440, h: 900, b: 360, end: 12 });
  const tick = useMotionValue(0);
  const { scrollYProgress: p } = useScroll({ target: section, offset: ["start start", "end end"] });

  // Measure the stage so the ring geometry (CSS) and the clip-path (JS) always agree.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const b = bOf(w, h);
      el.style.setProperty("--B", `${b}px`);
      dims.current = { w, h, b, end: 1.6 * Math.max(w / (HOLE_W * b), h / (HOLE_H * b)) };
      tick.set(tick.get() + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tick]);

  // The ring centre starts a little below the bottom edge (so only the arch shows) and ends at screen centre.
  const e = useTransform(p, (v) => smooth(range(v, 0.06, 0.7)));
  const scale = useTransform([e, tick], ([v]: number[]) => Math.pow(dims.current.end, v));
  const y = useTransform([e, tick], ([v]: number[]) => {
    const { h, b } = dims.current;
    const off = 0.1 * b;
    return off + (-h / 2 - off) * v;
  });
  const clip = useTransform([e, tick], ([v]: number[]) => {
    const { w, h, b, end } = dims.current;
    const s = Math.pow(end, v);
    const hw = HOLE_W * b * s;
    const hh = HOLE_H * b * s;
    const cx = w / 2;
    const cy = h + 0.1 * b + (-h / 2 - 0.1 * b) * v;
    // Insets may go negative once the opening outgrows the screen; clamping would shrink the corner geometry.
    const top = cy - hh / 2;
    const left = cx - hw / 2;
    const right = w - (cx + hw / 2);
    const bottom = h - (cy + hh / 2);
    return `inset(${top}px ${right}px ${bottom}px ${left}px round ${HOLE_R * b * s}px)`;
  });

  const textOpacity = useMap(p, 0.08, 0.24, 1, 0);
  const textY = useMap(p, 0.05, 0.26, 0, -70);
  const textPE = useTransform(p, (v) => (v > 0.16 ? "none" : "auto"));
  const cityScale = useMap(p, 0.15, 1, 1.25, 1);
  const overlayOpacity = useMap(p, 0.72, 0.88, 0, 1);
  const overlayY = useMap(p, 0.72, 0.88, 50, 0);
  const overlayPE = useTransform(p, (v) => (v > 0.8 ? "auto" : "none"));

  if (reduce) {
    return (
      <section className="relative overflow-hidden px-5 pt-40 text-center md:px-8">
        <Headline />
        <div className="mt-16 h-[45vh] overflow-hidden rounded-t-[2rem]">
          <RunScene />
        </div>
      </section>
    );
  }

  return (
    <section ref={section} className="relative h-[340vh]">
      <div
        ref={stage}
        className="sticky top-0 h-screen overflow-hidden bg-ink"
        style={{ "--B": "clamp(260px, min(40vw, 55vh), 620px)" } as React.CSSProperties}
      >
        <div className="blob -left-40 top-10 h-[34rem] w-[34rem] animate-drift bg-mint-bright/25" />
        <div className="blob -right-32 top-40 h-[28rem] w-[28rem] animate-drift bg-[#b6ff5c]/15 [animation-delay:-6s]" />

        {/* The animated run scene, visible only through the tunnel opening. */}
        <motion.div style={{ clipPath: clip }} className="absolute inset-0 z-0">
          <motion.div style={{ scale: cityScale }} className="absolute inset-0 origin-bottom">
            <RunScene />
          </motion.div>
          <motion.div
            style={{ opacity: overlayOpacity, y: overlayY, pointerEvents: overlayPE }}
            className="absolute inset-x-0 top-[12%] z-10 px-5 text-center"
          >
            <h2 className="headline mx-auto max-w-4xl text-[clamp(2.4rem,min(7vw,11vh),6.5rem)] text-fg drop-shadow-[0_2px_20px_rgb(var(--c-ink)/0.6)]">
              Race day is <span className="grad-text">closer</span> than you think
            </h2>
            <Link href="/races" className="btn-mint mt-8">
              Find your race
            </Link>
          </motion.div>
        </motion.div>

        {/* The rings: vector art, so they stay sharp at any zoom. The opening is transparent. */}
        <motion.div style={{ scale, y }} className="pointer-events-none absolute left-1/2 top-full z-10 h-0 w-0">
          <svg
            viewBox={`0 0 ${BOX_W} ${BOX_H}`}
            aria-hidden
            className="absolute -translate-x-1/2 -translate-y-1/2 overflow-visible"
            style={{ width: "var(--B)", height: "calc(var(--B) * 0.9)" }}
          >
            {BANDS.map((b) => (
              <path key={b.i} d={b.d} style={{ fill: `var(--ring-${b.i})` }} fillRule="evenodd" />
            ))}
          </svg>
        </motion.div>

        <motion.div
          style={{ opacity: textOpacity, y: textY, pointerEvents: textPE }}
          className="absolute inset-x-0 top-0 z-20 px-5 pt-28 text-center md:px-8 md:pt-32"
        >
          <Headline />
        </motion.div>
      </div>
    </section>
  );
}

const stats = [
  ["5K → ULTRA", "every distance"],
  ["TR + EU", "country-tagged races"],
  ["WEEKLY", "league resets"],
  ["3 SOURCES+", "official federations"],
];

export function HeroStats() {
  return (
    <dl className="mx-auto -mt-1 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-fg/10 bg-fg/10 md:grid-cols-4">
      {stats.map(([a, b]) => (
        <div key={a} className="bg-ink/80 px-4 py-6 text-center">
          <dt className="headline text-3xl text-mint-bright md:text-4xl">{a}</dt>
          <dd className="mt-1 text-xs font-semibold uppercase tracking-widest text-fg/45">{b}</dd>
        </div>
      ))}
    </dl>
  );
}
