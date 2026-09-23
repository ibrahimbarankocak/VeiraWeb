"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Page content slides away to uncover a footer that stays fixed underneath.
 * A spacer the height of the footer keeps the document scrollable far enough to reveal it.
 */
export function FooterReveal({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  const footerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <div className="relative z-10 rounded-b-[2rem] bg-ink shadow-[0_30px_60px_rgba(0,0,0,0.6)]">{children}</div>
      <div aria-hidden style={{ height }} />
      <div ref={footerRef} className="fixed inset-x-0 bottom-0 z-0">
        {footer}
      </div>
    </>
  );
}
