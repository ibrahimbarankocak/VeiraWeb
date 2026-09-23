"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/** Moves its children vertically as it crosses the viewport: y goes from y[0] to y[1] px. */
export function Parallax({
  children,
  y = [40, -40],
  className = "",
}: {
  children?: ReactNode;
  y?: [number, number];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const ty = useTransform(scrollYProgress, [0, 1], y);
  return (
    <motion.div ref={ref} style={reduce ? undefined : { y: ty }} className={className}>
      {children}
    </motion.div>
  );
}

/** A blurred glow that drifts at its own speed behind the content. */
export function ParallaxBlob({ className = "", y = [80, -80] }: { className?: string; y?: [number, number] }) {
  return <Parallax y={y} className={`blob ${className}`} />;
}

/** Content that lifts and fades as the page scrolls away from the top (for hero sections). */
export function ScrollFade({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, -110]);
  const opacity = useTransform(scrollY, [0, 550], [1, 0.1]);
  return (
    <motion.div style={reduce ? undefined : { y, opacity }} className={className}>
      {children}
    </motion.div>
  );
}

/** Thin mint progress bar across the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-mint-bright to-[#b6ff5c]"
    />
  );
}
