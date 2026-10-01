"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const MINT = "61, 220, 151";

export function LampContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative z-0 flex min-h-[34rem] w-full flex-col items-center justify-center overflow-hidden rounded-md bg-ink", className)}>
      <div className="isolate z-0 flex w-full flex-1 scale-y-125 items-center justify-center">
        <motion.div
          initial={{ opacity: 0.4, width: "14rem" }}
          whileInView={{ opacity: 1, width: "26rem" }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
          style={{ backgroundImage: `conic-gradient(from 70deg at 50% 0%, rgba(${MINT},0) 0deg, rgba(${MINT},0.55) 360deg)` }}
          className="absolute inset-auto right-1/2 h-56 w-[26rem] overflow-visible"
        >
          <div className="absolute bottom-0 left-0 z-20 h-40 w-full bg-ink [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute bottom-0 left-0 z-20 h-full w-40 bg-ink [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.4, width: "14rem" }}
          whileInView={{ opacity: 1, width: "26rem" }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
          style={{ backgroundImage: `conic-gradient(from 290deg at 50% 0%, rgba(${MINT},0.55) 0deg, rgba(${MINT},0) 360deg)` }}
          className="absolute inset-auto left-1/2 h-56 w-[26rem]"
        >
          <div className="absolute bottom-0 right-0 z-20 h-full w-40 bg-ink [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute bottom-0 right-0 z-20 h-40 w-full bg-ink [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-ink blur-2xl" />
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md" />
        <div
          className="absolute inset-auto z-50 h-36 w-[24rem] -translate-y-1/2 rounded-full opacity-50 blur-3xl"
          style={{ background: `rgba(${MINT},0.6)` }}
        />
        <motion.div
          initial={{ width: "7rem" }}
          whileInView={{ width: "14rem" }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-auto z-30 h-36 w-56 -translate-y-[6rem] rounded-full blur-2xl"
          style={{ background: `rgba(${MINT},0.9)` }}
        />
        <motion.div
          initial={{ width: "14rem" }}
          whileInView={{ width: "26rem" }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-auto z-50 h-0.5 w-[26rem] -translate-y-[7rem]"
          style={{ background: `rgb(${MINT})` }}
        />
        <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-ink" />
      </div>

      <div className="relative z-50 flex -translate-y-56 flex-col items-center px-5">{children}</div>
    </div>
  );
}
