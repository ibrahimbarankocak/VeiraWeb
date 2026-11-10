"use client";

import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

const HEART =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

// Jagged crack down the middle of the heart, as clip-path polygons for each half.
const LEFT_HALF =
  "polygon(0 0, 50% 0, 50% 20.8%, 43.75% 33.3%, 54.2% 45.8%, 45% 58.3%, 53.3% 70.8%, 50% 100%, 0 100%)";
const RIGHT_HALF =
  "polygon(50% 0, 100% 0, 100% 100%, 50% 100%, 53.3% 70.8%, 45% 58.3%, 54.2% 45.8%, 43.75% 33.3%, 50% 20.8%)";

const RED = "#e11d48";
const MILK = "#fbf7ef";

type Stage = "barisma" | "kahve" | "bitti";

// Seeded so the server and client render the same hearts.
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function useHearts(count: number) {
  return useMemo(() => {
    const rand = seeded(1402);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rand() * 94,
      top: rand() * 92,
      size: 28 + rand() * 54,
      tilt: -25 + rand() * 50,
      float: 4 + rand() * 4,
      delay: rand() * 3,
      opacity: 0.55 + rand() * 0.4,
    }));
  }, [count]);
}

function HeartHalf({ side, healed, index }: { side: "left" | "right"; healed: boolean; index: number }) {
  const dir = side === "left" ? -1 : 1;
  return (
    <motion.div
      className="absolute inset-0"
      style={{ clipPath: side === "left" ? LEFT_HALF : RIGHT_HALF, transformOrigin: "50% 92%" }}
      initial={false}
      animate={healed ? { x: "0%", y: "0%", rotate: 0 } : { x: `${dir * 9}%`, y: "3%", rotate: dir * 16 }}
      transition={{ type: "spring", stiffness: 140, damping: 11, delay: healed ? 0.15 + index * 0.045 : 0 }}
    >
      <svg viewBox="0 0 24 24" className="h-full w-full">
        <path
          d={HEART}
          style={{ fill: healed ? RED : "#b4384f", transition: `fill 0.6s ease ${0.15 + index * 0.045}s` }}
        />
      </svg>
    </motion.div>
  );
}

function BrokenHeart({
  heart,
  healed,
  still,
}: {
  heart: ReturnType<typeof useHearts>[number];
  healed: boolean;
  still: boolean;
}) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${heart.left}%`,
        top: `${heart.top}%`,
        width: heart.size,
        height: heart.size,
        rotate: heart.tilt,
        opacity: heart.opacity,
      }}
      animate={still ? undefined : { y: [0, -14, 0] }}
      transition={{ duration: heart.float, delay: heart.delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        className="relative h-full w-full"
        initial={false}
        animate={healed ? { scale: [1, 1.35, 1] } : { scale: 1 }}
        transition={{ duration: 0.6, delay: healed ? 0.55 + heart.id * 0.045 : 0 }}
      >
        <HeartHalf side="left" healed={healed} index={heart.id} />
        <HeartHalf side="right" healed={healed} index={heart.id} />
      </motion.div>
    </motion.div>
  );
}

function RisingHearts() {
  const hearts = useMemo(() => {
    const rand = seeded(2024);
    return Array.from({ length: 26 }, (_, i) => ({
      id: i,
      left: rand() * 100,
      size: 14 + rand() * 26,
      duration: 4 + rand() * 3,
      delay: rand() * 2.5,
      drift: -40 + rand() * 80,
    }));
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {hearts.map((h) => (
        <motion.svg
          key={h.id}
          viewBox="0 0 24 24"
          className="absolute"
          style={{ left: `${h.left}%`, bottom: -50, width: h.size, height: h.size }}
          initial={{ y: 0, x: 0, opacity: 0 }}
          animate={{ y: "-110vh", x: h.drift, opacity: [0, 1, 1, 0] }}
          transition={{ duration: h.duration, delay: h.delay, repeat: Infinity, ease: "easeOut" }}
        >
          <path d={HEART} fill={RED} />
        </motion.svg>
      ))}
    </div>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

const lockedMessages = [
  "Bu buton kilitli 🔒",
  "Olmaz ki öyle 🙈",
  "Anahtarı bende değil 🗝️",
  "Bir daha dene… ama diğerini 😌",
  "Sistem bu cevabı kabul etmiyor 💌",
];

function Question({ title, onYes }: { title: string; onYes: () => void }) {
  const shake = useAnimationControls();
  const [tries, setTries] = useState(0);

  const refuse = () => {
    setTries((t) => t + 1);
    shake.start({ x: [0, -10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.45 } });
  };

  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -24, scale: 0.96 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center"
    >
      <h1
        className="text-center text-[clamp(2.6rem,9vw,4.5rem)] font-bold leading-tight text-rose-700"
        style={{ fontFamily: "var(--font-script), cursive" }}
      >
        {title}
      </h1>

      <div className="mt-8 flex items-center gap-4">
        <motion.button
          type="button"
          onClick={onYes}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.94 }}
          className="rounded-full bg-rose-600 px-9 py-3.5 text-lg font-bold text-white shadow-[0_10px_30px_-8px_rgba(225,29,72,0.7)] outline-none ring-rose-300 focus-visible:ring-4"
        >
          Evet ❤️
        </motion.button>

        <motion.button
          type="button"
          aria-disabled="true"
          onClick={refuse}
          onMouseEnter={refuse}
          animate={shake}
          className="flex cursor-not-allowed select-none items-center gap-2 rounded-full border-2 border-rose-200 bg-white/70 px-7 py-3 text-lg font-semibold text-rose-300"
        >
          <LockIcon />
          Hayır
        </motion.button>
      </div>

      <div className="mt-4 h-6 text-sm font-medium text-rose-500">
        <AnimatePresence mode="wait">
          {tries > 0 && (
            <motion.p
              key={tries}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              {lockedMessages[(tries - 1) % lockedMessages.length]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function Apology() {
  const [stage, setStage] = useState<Stage>("barisma");
  const hearts = useHearts(30);
  const still = useReducedMotion() ?? false;
  const healed = stage !== "barisma";

  return (
    <main
      className="fixed inset-0 z-0 overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 50% 40%, #fffdf8 0%, ${MILK} 55%, #f5ece0 100%)`,
        fontFamily: "var(--font-sans), system-ui, sans-serif",
      }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {hearts.map((h) => (
          <BrokenHeart key={h.id} heart={h} healed={healed} still={still} />
        ))}
      </div>

      {stage === "bitti" && !still && <RisingHearts />}

      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="w-full max-w-xl rounded-[2rem] border border-rose-100 bg-white/75 px-6 py-12 shadow-[0_30px_80px_-30px_rgba(190,18,60,0.35)] backdrop-blur-md sm:px-10">
          <AnimatePresence mode="wait">
            {stage === "barisma" && (
              <Question key="barisma" title="Barıştık mı Seda?" onYes={() => setStage("kahve")} />
            )}
            {stage === "kahve" && (
              <Question key="kahve" title={"Beraber bir kahve? ☕"} onYes={() => setStage("bitti")} />
            )}
            {stage === "bitti" && (
              <motion.div
                key="bitti"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 160, damping: 14 }}
                className="text-center"
              >
                <motion.svg
                  viewBox="0 0 24 24"
                  className="mx-auto h-20 w-20"
                  animate={still ? undefined : { scale: [1, 1.15, 1, 1.15, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.4 }}
                >
                  <path d={HEART} fill={RED} />
                </motion.svg>
                <h1
                  className="mt-4 text-[clamp(2.4rem,8vw,4rem)] font-bold leading-tight text-rose-700"
                  style={{ fontFamily: "var(--font-script), cursive" }}
                >
                  Yaşasın!
                </h1>
                <p className="mt-3 text-lg text-rose-900/70">
                  Kahveler benden. Seni çok seviyorum ❤️
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
