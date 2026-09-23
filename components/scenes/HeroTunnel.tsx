"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Skyline } from "./Skyline";
import { range, smooth, useMap } from "./hooks";

// Concentric rounded "tunnel" rings, outermost first. Each ring is a border band of thickness T*B.
const RINGS = ["#d9fbe9", "#a7f0cb", "#5fe3a6", "#2fbf83", "#1f9068", "#166a4d", "#104a37", "#0a3025"];
const N = RINGS.length;
const T = 0.045;
const HOLE_W = 1 - 2 * N * T; // opening width as a fraction of B
const HOLE_H = 0.9 - 2 * N * T; // opening height as a fraction of B
const bOf = (vw: number) => Math.min(620, Math.max(260, vw * 0.4));

const Headline = () => (
  <>
    <p className="eyebrow mb-5">The running companion</p>
    <h1 className="headline mx-auto max-w-[95rem] text-[clamp(2.6rem,7vw,7.5rem)]">
      The smartest way to
      <br />
      <span className="grad-text">find your next race</span>
    </h1>
    <p className="mx-auto mt-6 hidden max-w-2xl text-lg text-white/65 sm:block md:text-xl">
      Discover races, track every kilometer on every shoe, and climb the weekly league — all in one app built by
      runners, for runners.
    </p>
    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
      <Link href="/login?mode=signup" className="btn-mint">
        Join Veira free
      </Link>
      <Link
        href="/races"
        className="rounded-full border border-white/20 px-7 py-3.5 font-display text-lg font-bold uppercase tracking-wide text-white transition hover:border-mint-bright hover:text-mint-bright"
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
  const dims = useRef({ w: 1440, h: 900, end: 12 });
  const tick = useMotionValue(0);
  const { scrollYProgress: p } = useScroll({ target: section, offset: ["start start", "end end"] });

  // Measure the stage so the ring geometry (CSS) and the clip-path (JS) always agree.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const b = bOf(w);
      el.style.setProperty("--B", `${b}px`);
      dims.current = { w, h, end: 1.6 * Math.max(w / (HOLE_W * b), h / (HOLE_H * b)) };
      tick.set(tick.get() + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tick]);

  const e = useTransform(p, (v) => smooth(range(v, 0.04, 0.7)));
  const scale = useTransform([e, tick], ([v]: number[]) => Math.pow(dims.current.end, v));
  const y = useTransform([e, tick], ([v]: number[]) => -0.5 * dims.current.h * v);
  const clip = useTransform([e, tick], ([v]: number[]) => {
    const { w, h, end } = dims.current;
    const b = bOf(w);
    const s = Math.pow(end, v);
    const hw = HOLE_W * b * s;
    const hh = HOLE_H * b * s;
    const cx = w / 2;
    const cy = h * (1 - 0.5 * v);
    // Insets may go negative once the opening outgrows the screen; clamping would shrink the corner geometry.
    const top = cy - hh / 2;
    const left = cx - hw / 2;
    const right = w - (cx + hw / 2);
    const bottom = h - (cy + hh / 2);
    return `inset(${top}px ${right}px ${bottom}px ${left}px round ${0.055 * b * s}px)`;
  });

  const textOpacity = useMap(p, 0.03, 0.2, 1, 0);
  const textY = useMap(p, 0, 0.22, 0, -70);
  const textPE = useTransform(p, (v) => (v > 0.12 ? "none" : "auto"));
  const cityScale = useMap(p, 0.15, 1, 1.3, 1);
  const overlayOpacity = useMap(p, 0.72, 0.88, 0, 1);
  const overlayY = useMap(p, 0.72, 0.88, 50, 0);
  const overlayPE = useTransform(p, (v) => (v > 0.8 ? "auto" : "none"));

  if (reduce) {
    return (
      <section className="relative overflow-hidden px-5 pt-40 text-center md:px-8">
        <Headline />
        <div className="mt-16 h-[45vh] overflow-hidden rounded-t-[2rem]">
          <Skyline />
        </div>
      </section>
    );
  }

  return (
    <section ref={section} className="relative h-[340vh]">
      <div
        ref={stage}
        className="sticky top-0 h-screen overflow-hidden bg-ink"
        style={{ "--B": "clamp(260px,40vw,620px)" } as React.CSSProperties}
      >
        <div className="blob -left-40 top-10 h-[34rem] w-[34rem] animate-drift bg-mint-bright/25" />
        <div className="blob -right-32 top-40 h-[28rem] w-[28rem] animate-drift bg-[#b6ff5c]/15 [animation-delay:-6s]" />

        {/* The skyline, visible only through the tunnel opening. */}
        <motion.div style={{ clipPath: clip }} className="absolute inset-0 z-0">
          <motion.div style={{ scale: cityScale }} className="absolute inset-0 origin-bottom">
            <Skyline />
          </motion.div>
          <motion.div
            style={{ opacity: overlayOpacity, y: overlayY, pointerEvents: overlayPE }}
            className="absolute inset-x-0 top-[14%] z-10 px-5 text-center"
          >
            <h2 className="headline mx-auto max-w-4xl text-[clamp(2.6rem,7vw,6.5rem)] text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
              Race day is <span className="grad-text">closer</span> than you think
            </h2>
            <Link href="/races" className="btn-mint mt-8">
              Find your race
            </Link>
          </motion.div>
        </motion.div>

        {/* The rings. The opening stays transparent so the skyline shows through. */}
        <motion.div style={{ scale, y }} className="pointer-events-none absolute left-1/2 top-full z-10 h-0 w-0 will-change-transform">
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ width: "var(--B)", height: "calc(var(--B) * 0.9)" }}
          >
            {RINGS.map((c, i) => (
              <div
                key={c}
                className="absolute"
                style={{
                  inset: `calc(var(--B) * ${i * T})`,
                  border: `calc(var(--B) * ${T}) solid ${c}`,
                  borderRadius: `calc(var(--B) * ${0.24 - i * 0.02})`,
                }}
              />
            ))}
          </div>
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
    <dl className="mx-auto -mt-1 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
      {stats.map(([a, b]) => (
        <div key={a} className="bg-ink/80 px-4 py-6 text-center">
          <dt className="headline text-3xl text-mint-bright md:text-4xl">{a}</dt>
          <dd className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/45">{b}</dd>
        </div>
      ))}
    </dl>
  );
}
