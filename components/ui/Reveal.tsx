"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Renders visible by default (SSR / no-JS safe). After mount, anything still below the
// fold is hidden and eased in when it scrolls into view.
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"visible" | "hidden" | "shown">("visible");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.95) return;
    setState("hidden");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -80px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition duration-700 ease-out ${state === "hidden" ? "translate-y-9 opacity-0" : ""} ${className}`}
      style={{ transitionDelay: state === "shown" ? `${delay}s` : undefined }}
    >
      {children}
    </div>
  );
}
