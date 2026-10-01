"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

export function ContainerScroll({
  titleComponent,
  children,
}: {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const scaleRange: [number, number] = isMobile ? [0.7, 0.9] : [1.05, 1];
  const rotate = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleRange);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <div ref={containerRef} className="relative flex h-[55rem] items-center justify-center p-2 md:h-[70rem] md:p-20">
      <div className="relative w-full py-10 md:py-32" style={{ perspective: "1000px" }}>
        <motion.div style={{ translateY: translate }} className="mx-auto max-w-4xl text-center">
          {titleComponent}
        </motion.div>
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
}

function Card({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow: "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026",
      }}
      className="mx-auto -mt-12 h-[26rem] w-full max-w-5xl rounded-[30px] border-4 border-mint-bright/20 bg-[#0a1a13] p-2 shadow-2xl md:h-[36rem] md:p-6"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-ink md:p-4">{children}</div>
    </motion.div>
  );
}
