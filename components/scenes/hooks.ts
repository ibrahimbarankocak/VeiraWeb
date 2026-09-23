"use client";

import { useEffect, useState } from "react";
import { useTransform, type MotionValue } from "framer-motion";

/** True once the viewport is at least `px` wide. False on the server and on first paint. */
export function useMinWidth(px: number) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width:${px}px)`);
    const on = () => setOk(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [px]);
  return ok;
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (t: number) => t * t * (3 - 2 * t);
/** Map v from [a,b] to 0..1, clamped. */
export const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

/**
 * Scroll-linked value: `from` until progress reaches `a`, `to` from `b` on, eased in between.
 * Deliberately uses the function form of useTransform. The array form lets framer-motion hand
 * opacity/transform to a native ViewTimeline bound to the element itself, which is wrong for
 * pinned (sticky) scenes.
 */
export function useMap(p: MotionValue<number>, a: number, b: number, from: number, to: number, ease?: (t: number) => number) {
  return useTransform(p, (v) => {
    const t = range(v, a, b);
    return from + (to - from) * (ease ? ease(t) : t);
  });
}
