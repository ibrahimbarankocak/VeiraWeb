"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Inertial smooth scrolling for the whole site (skipped for reduced-motion users). */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: true,
    });
    return () => lenis.destroy();
  }, []);
  return null;
}
