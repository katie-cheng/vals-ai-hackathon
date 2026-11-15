import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE } from "./motion";

const preloaderWords = ["Strategy", "Creative", "Revenue", "Growth"];
export function Preloader({ done: s }) {
  const [n, l] = useState(0),
    [r, d] = useState(0);
  return (
    useEffect(() => {
      const f = performance.now(),
        h = 1700;
      let m = 0;
      const g = (x) => {
        const y = Math.min((x - f) / h, 1);
        (l(Math.round(y * 100)),
          d(Math.min(Math.floor(y * preloaderWords.length), preloaderWords.length - 1)),
          y < 1 ? (m = requestAnimationFrame(g)) : setTimeout(s, 250));
      };
      return ((m = requestAnimationFrame(g)), () => cancelAnimationFrame(m));
    }, [s]),
    (
      <motion.div
        className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-pine-950 text-cream-50"
        exit={{
          y: "-100%",
          transition: {
            duration: 0.9,
            ease: [0.76, 0, 0.24, 1],
          },
        }}
      >
        <div className="dot-grid absolute inset-0 opacity-60" />
        <AnimatePresence mode="wait">
          <motion.span
            key={r}
            initial={{
              opacity: 0,
              y: 24,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -24,
            }}
            transition={{
              duration: 0.4,
              ease: EASE,
            }}
            className="relative text-sm font-bold text-mint-300"
          >
            {preloaderWords[r]}
          </motion.span>
        </AnimatePresence>
        <div className="relative mt-4 text-7xl font-extrabold tracking-tight tabular-nums sm:text-8xl">
          {n}
          <span className="text-mint-300">%</span>
        </div>
        <div className="relative mt-8 h-[3px] w-56 overflow-hidden rounded-full bg-cream-50/15">
          <div
            className="h-full rounded-full bg-mint-300 transition-[width] duration-100"
            style={{
              width: `${n}%`,
            }}
          />
        </div>
        <span className="relative mt-6 text-xl font-extrabold">
          kora<span className="text-mint-300">.</span>
        </span>
      </motion.div>
    )
  );
}
