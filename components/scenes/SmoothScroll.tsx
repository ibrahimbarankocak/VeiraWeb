"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * A page can be entered with a hash already in the URL (a shared link, or a nav/footer link
 * clicked from a different page). Neither the browser's native jump nor Lenis's own `anchors`
 * option (which only intercepts in-page link clicks) reliably lands on it, because the target
 * section's height is only known once client-side layout (pinned scroll sections, images) has
 * settled. Retry for a bit after mount instead of jumping once too early.
 */
function scrollToInitialHash(lenis: Lenis | null) {
  const id = decodeURIComponent(window.location.hash.replace(/^#/, "").split("#")[0]);
  if (!id) return;
  const NAV_OFFSET = -76;
  // Jump instantly rather than animate: the pinned scroll sections above the target keep
  // resizing (ResizeObserver, the client-only hero scene mounting) for a moment after load,
  // so a smooth in-flight scroll gets restarted mid-flight and never actually arrives. A couple
  // of instant, non-overlapping jumps land correctly once layout has settled either way.
  const jump = () => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: NAV_OFFSET, immediate: true });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + NAV_OFFSET });
  };
  jump();
  setTimeout(jump, 500);
  setTimeout(jump, 1500);
}

/** Inertial smooth scrolling for the whole site (skipped for reduced-motion users). */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      scrollToInitialHash(null);
      return;
    }
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: true,
    });
    scrollToInitialHash(lenis);
    return () => lenis.destroy();
  }, []);
  return null;
}
