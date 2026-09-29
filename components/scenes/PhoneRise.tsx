"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cubicBezier, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ClubsScreen, HomeScreen, InventoryScreen, LeagueScreen } from "../sections/Screens";
import { Reveal } from "../ui/Reveal";
import { useMap, useMinWidth } from "./hooks";
import { useI18n } from "../../lib/i18n/context";

const easeOut = cubicBezier(0.22, 1, 0.36, 1);

function Rise({
  i,
  p,
  pin,
  scale,
  title,
  body,
  screen,
}: {
  i: number;
  p: MotionValue<number>;
  pin: boolean;
  scale: number;
  title: string;
  body: string;
  screen: ReactNode;
}) {
  const start = 0.04 + 0.09 * i;
  const end = start + 0.36;
  const rise = useMap(p, start, end, 105, 0, easeOut);
  const y = useTransform(rise, (v) => `${v}vh`);
  const caption = useMap(p, end - 0.06, end + 0.04, 0, 1);

  const card = (
    <motion.div style={pin ? { y } : undefined} className={i % 2 ? "lg:mt-8" : ""}>
      <div
        className="mx-auto [--s:0.8] lg:[--s:0.66]"
        style={{ width: "calc(340px * var(--s))", height: "calc(718px * var(--s))", ...(pin ? ({ "--s": scale } as CSSProperties) : {}) }}
      >
        <div style={{ width: 340, transform: "scale(var(--s))", transformOrigin: "top left" }}>{screen}</div>
      </div>
      <motion.div style={pin ? { opacity: caption } : undefined} className="mx-auto mt-5 max-w-[15rem] text-center">
        <h3 className="headline text-3xl">{title}</h3>
        <p className="mt-2 text-sm text-fg/55 [@media(max-height:880px)]:hidden">{body}</p>
      </motion.div>
    </motion.div>
  );

  return pin ? card : <Reveal>{card}</Reveal>;
}

export function PhoneRise() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const desktop = useMinWidth(1024);
  const pin = desktop && !reduce;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const items = [
    { title: t("features.f1Title"), body: t("features.f1Body"), screen: <HomeScreen /> },
    { title: t("features.f2Title"), body: t("features.f2Body"), screen: <LeagueScreen /> },
    { title: t("features.f3Title"), body: t("features.f3Body"), screen: <InventoryScreen /> },
    { title: t("features.f4Title"), body: t("features.f4Body"), screen: <ClubsScreen /> },
  ];

  // While pinned, everything (title, phones, captions) must fit in one screen. Size the phones from the
  // window height so short windows (laptops, display scaling) never clip the captions.
  const [scale, setScale] = useState(0.66);
  useEffect(() => {
    const fit = () => {
      const vh = window.innerHeight;
      const reserved = vh < 880 ? 390 : 460; // header gap + title + stagger + caption (+ body text on tall screens)
      setScale(Math.min(0.8, Math.max(0.4, (vh - reserved) / 718)));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  const titleOpacity = useMap(p, 0.1, 0.6, 1, 0.6);
  const titleY = useMap(p, 0, 0.7, 0, -30);

  return (
    <section id="features" ref={ref} className={pin ? "relative h-[300vh]" : "relative px-5 py-24"}>
      <div className={pin ? "sticky top-0 flex h-screen flex-col overflow-hidden px-8 pt-24" : ""}>
        <motion.div style={pin ? { opacity: titleOpacity, y: titleY } : undefined} className="mb-10 text-center lg:mb-6">
          <p className="eyebrow mb-3">{t("features.eyebrow")}</p>
          <h2 className="headline text-[clamp(2.4rem,5vw,4.5rem)]">
            {t("features.headline1")} <span className="grad-text">{t("features.headlineGrad")}</span>
          </h2>
        </motion.div>
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {items.map((item, i) => (
            <Rise key={item.title} i={i} p={p} pin={pin} scale={scale} title={item.title} body={item.body} screen={item.screen} />
          ))}
        </div>
      </div>
    </section>
  );
}
