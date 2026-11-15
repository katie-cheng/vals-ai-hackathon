import * as React from "react";
import { SITE } from "../data/content";
import { EASE } from "../lib/anim";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

function HeroWords({ text: a, delay: i = 0, className: r = "" }) {
  return (
    <motion.span
      className={r}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE, delay: i }}
    >
      {a}
    </motion.span>
  );
}

function Hero() {
  return (
      <section
        id="top"
        className="relative flex min-h-[108svh] flex-col overflow-hidden"
      >
        <div
          className="absolute inset-0"
          aria-hidden
        >
          <div className="absolute inset-0">
            <img
              src="/images/hero-house.jpg"
              alt=""
              fetchPriority="high"
              decoding="sync"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <video
              className="relative h-full w-full object-cover"
              src="/videos/hero-wash.mp4"
              poster="/images/hero-house.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          </div>
          <div className="absolute inset-0 bg-[#04141f]/60" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#04141f]" />
        </div>
        <motion.div
          className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pt-36 sm:px-10 lg:px-16 lg:pt-40"
        >
          <h1 className="max-w-4xl text-[11vw] font-semibold leading-[1] tracking-tight text-white sm:text-6xl lg:text-[4.4rem]">
            <HeroWords text="Connecticut," delay={0.14} className="block" />
            <HeroWords
              text="in its best light."
              delay={0.25}
              className="block"
            />
          </h1>
          <motion.p
            initial={{
              opacity: 0,
              y: 0,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 1,
              ease: EASE,
              delay: 0.42,
            }}
            className="mt-6 max-w-xl text-base leading-relaxed text-sky-100/85 sm:text-lg"
          >
            Window cleaning, gutter care, house washing, and pressure washing
            for homes across Connecticut. We explain the work, agree on the
            scope, and clean with attention to the surface.
          </motion.p>
          <motion.div
            initial={{
              opacity: 0,
              y: 0,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 1,
              ease: EASE,
              delay: 0.48,
            }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <div>
              <a
                href="#quote"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-md bg-cyan-300 px-4 py-2 text-[15px] font-medium text-[#04141f] transition-all duration-500 hover:bg-right"
              >
                Get my free quote
              </a>
            </div>
          </motion.div>
          <motion.div
            className="mt-12 hidden gap-3 lg:flex"
            aria-hidden
          >
            {[
              {
                t: "Interior + exterior glass",
              },
              {
                t: "Gutters · Siding · Concrete",
              },
              {
                t: "Streak-aware finish",
              },
            ].map((M, H) => (
              <motion.div
                key={M.t}
                initial={{
                  opacity: 0,
                  y: 0,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.9,
                  ease: EASE,
                  delay: 0.56 + H * 0.15,
                }}
                className="glass flex items-center gap-2.5 rounded-lg px-4 py-3 text-[13px] font-medium text-sky-50"
              >
                {M.t}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        <motion.div
          className="absolute inset-x-0 bottom-0 z-10"
          aria-hidden
        >
          <div className="overflow-hidden border-t border-cyan-300/20 bg-[#04141f]/85 py-3">
            <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap pr-8">
              {[0, 1].map((M) => (
                <div key={M} className="flex items-center gap-8">
                  {[
                    "Pressure washing",
                    "Window cleaning",
                    "Gutter cleaning",
                    "House washing",
                    "Driveways",
                    "Patios",
                    "Free estimates",
                  ].map((H) => (
                    <span
                      key={H}
                      className="flex items-center gap-8 text-[14px] font-medium text-cyan-100/80"
                    >
                      {H}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
  );
}

export { HeroWords, Hero };
