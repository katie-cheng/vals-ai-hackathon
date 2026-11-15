import * as React from "react";
import { REDUCED } from "./anim";
import { motion, useScroll, useTransform } from "framer-motion";

function rand(a) {
  const i = Math.sin(a * 127.1 + 311.7) * 43758.5453;
  return i - Math.floor(i);
}

function ScrollProgress() {
  const { scrollYProgress: a } = useScroll(),
    i = useTransform(a, [0, 1], [0, 1]);
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[90] h-[3px] origin-left bg-cyan-300"
      style={{
        scaleX: i,
      }}
      aria-hidden
    />
  );
}

function WaveDivider({
  className: a = "",
  flip: i = false,
  color: r = "#04141f",
  opacity: l = 1,
}) {
  return (
    <div
      className={`pointer-events-none overflow-hidden ${a}`}
      aria-hidden
      style={{
        opacity: l,
      }}
    >
      <div className={`flex w-[200%] ${i ? "rotate-180" : ""}`}>
        {[0, 1].map((u) => (
          <svg
            key={u}
            className="w-1/2 shrink-0"
            viewBox="0 0 1200 90"
            preserveAspectRatio="none"
            style={{
              animationDuration: u ? "13s" : "9s",
            }}
          >
            <path
              d="M0,55 C150,20 300,85 450,55 C600,25 750,80 900,50 C1050,22 1150,60 1200,45 L1200,90 L0,90 Z"
              fill={r}
              opacity={u ? 0.35 : 0.85}
            />
          </svg>
        ))}
      </div>
    </div>
  );
}

export { rand, ScrollProgress, WaveDivider };
