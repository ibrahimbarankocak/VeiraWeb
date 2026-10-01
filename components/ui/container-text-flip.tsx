"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils";

export interface ContainerTextFlipProps {
  words: string[];
  interval?: number;
  className?: string;
  textClassName?: string;
  animationDuration?: number;
}

export function ContainerTextFlip({
  words,
  interval = 3000,
  className,
  textClassName,
  animationDuration = 700,
}: ContainerTextFlipProps) {
  const id = useId();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [width, setWidth] = useState(100);
  const textRef = useRef<HTMLDivElement>(null);

  const updateWidth = useCallback(() => {
    if (textRef.current) setWidth(textRef.current.scrollWidth + 30);
  }, []);

  useEffect(() => {
    updateWidth();
  }, [currentWordIndex, updateWidth]);

  useEffect(() => {
    const t = setInterval(() => {
      setCurrentWordIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => clearInterval(t);
  }, [words, interval]);

  return (
    <motion.span
      layout
      layoutId={`container-text-flip-${id}`}
      animate={{ width }}
      transition={{ duration: animationDuration / 2000 }}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-xl border border-mint-bright/30 bg-mint-bright/10 px-3 py-1 align-middle",
        className
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={currentWordIndex}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: animationDuration / 1000, ease: "easeInOut" }}
          ref={textRef}
          className={cn("inline-block whitespace-nowrap text-mint-bright", textClassName)}
        >
          {words[currentWordIndex].split("").map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, filter: "blur(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: i * 0.02, duration: 0.2 }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
