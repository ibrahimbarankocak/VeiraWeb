"use client";

import { useRef, type ReactNode } from "react";
import { cubicBezier, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ClubsScreen, HomeScreen, InventoryScreen, LeagueScreen } from "../sections/Screens";
import { Reveal } from "../ui/Reveal";
import { useMap, useMinWidth } from "./hooks";

const items: { title: string; body: string; screen: ReactNode }[] = [
  { title: "Know what's next", body: "Next-race countdown, weekly rhythm and quick shortcuts, synced with Strava.", screen: <HomeScreen /> },
  { title: "Compete weekly", body: "A pace-based league that resets every week, with boards for 5K to 42K.", screen: <LeagueScreen /> },
  { title: "Never run dead shoes", body: "Kilometers per shoe, shoe-life tracking and race-day kit checklists.", screen: <InventoryScreen /> },
  { title: "Find your people", body: "Join admin-verified running clubs with member leaderboards.", screen: <ClubsScreen /> },
];

const easeOut = cubicBezier(0.22, 1, 0.36, 1);

function Rise({ i, p, pin, item }: { i: number; p: MotionValue<number>; pin: boolean; item: (typeof items)[number] }) {
  const start = 0.04 + 0.09 * i;
  const end = start + 0.36;
  const rise = useMap(p, start, end, 105, 0, easeOut);
  const y = useTransform(rise, (v) => `${v}vh`);
  const caption = useMap(p, end - 0.06, end + 0.04, 0, 1);

  const card = (
    <motion.div style={pin ? { y } : undefined} className={i % 2 ? "lg:mt-8" : ""}>
      <div
        className="mx-auto [--s:0.8] lg:[--s:0.66]"
        style={{ width: "calc(340px * var(--s))", height: "calc(718px * var(--s))" }}
      >
        <div style={{ width: 340, transform: "scale(var(--s))", transformOrigin: "top left" }}>{item.screen}</div>
      </div>
      <motion.div style={pin ? { opacity: caption } : undefined} className="mx-auto mt-5 max-w-[15rem] text-center">
        <h3 className="headline text-3xl">{item.title}</h3>
        <p className="mt-2 text-sm text-fg/55 [@media(max-height:800px)]:hidden">{item.body}</p>
      </motion.div>
    </motion.div>
  );

  return pin ? card : <Reveal>{card}</Reveal>;
}

export function PhoneRise() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const desktop = useMinWidth(1024);
  const pin = desktop && !reduce;
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const titleOpacity = useMap(p, 0.1, 0.6, 1, 0.3);
  const titleY = useMap(p, 0, 0.7, 0, -30);

  return (
    <section id="features" ref={ref} className={pin ? "relative h-[300vh]" : "relative px-5 py-24"}>
      <div className={pin ? "sticky top-0 flex h-screen flex-col overflow-hidden px-8 pt-24" : ""}>
        <motion.div style={pin ? { opacity: titleOpacity, y: titleY } : undefined} className="mb-10 text-center lg:mb-6">
          <p className="eyebrow mb-3">Inside the app</p>
          <h2 className="headline text-[clamp(2.4rem,5vw,4.5rem)]">
            Everything a <span className="grad-text">runner</span> needs
          </h2>
        </motion.div>
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {items.map((item, i) => (
            <Rise key={item.title} i={i} p={p} pin={pin} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
