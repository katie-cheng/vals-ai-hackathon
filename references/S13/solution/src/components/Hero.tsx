import * as React from "react";
import { SITE } from "../data/content";
import { EASE, DUR } from "../lib/anim";
import { AppWindow, ArrowRight, Car, ClipboardCheck, Droplets, Fence, House, SprayCan } from "lucide-react";
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
      transition={{ duration: DUR.slow, ease: EASE, delay: i }}
    >
      {a}
    </motion.span>
  );
}

function Hero() {
  return (
      <section
        id="top"
        className="relative flex min-h-[max(76svh,560px)] flex-col overflow-hidden"
      >
        <div
          className="absolute inset-0"
          aria-hidden
        >
          <div className="absolute inset-0">
            <img
              src="/images/hero-wash-first.jpg"
              alt=""
              fetchPriority="high"
              decoding="sync"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <video
              className="relative h-full w-full object-cover"
              src="/videos/hero-wash.mp4"
              poster="/images/hero-wash-first.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          </div>
          <div className="absolute inset-0 bg-[#04141f]/45" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_70%_at_50%_45%,transparent_30%,rgb(4_20_31/0.92)_100%)]" />
        </div>
        <motion.div
          className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-12 pt-28 sm:px-10 lg:px-24 lg:pb-16 lg:pt-28"
        >
          <h1 className="font-serif-d max-w-4xl text-[11vw] font-normal leading-[1.04] tracking-[-0.01em] text-white sm:text-6xl lg:text-[4.4rem]">
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
              duration: DUR.slow,
              ease: EASE,
              delay: 0.42,
            }}
            className="mt-6 max-w-xl text-base leading-relaxed text-sky-100/85 sm:text-lg"
          >
            Window cleaning, gutter care, house washing, and pressure washing
            for homes across Connecticut.
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
              duration: DUR.slow,
              ease: EASE,
              delay: 0.48,
            }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <div>
              <a
                href="#quote"
                className="btn btn-primary btn-lg group"
              >
                Get my free quote
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={1.75}
                />
              </a>
            </div>
          </motion.div>
        </motion.div>
        <div className="absolute inset-x-0 bottom-0 z-10" aria-hidden>
          <div className="overflow-hidden grain border-t border-white/10 bg-[#04141f] py-3">
            <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap pr-10">
              {[0, 1].map((M) => (
                <div key={M} className="flex items-center gap-10">
                  {[
                    { t: "Pressure washing", I: SprayCan },
                    { t: "Window cleaning", I: AppWindow },
                    { t: "Gutter cleaning", I: Droplets },
                    { t: "House washing", I: House },
                    { t: "Driveways", I: Car },
                    { t: "Patios", I: Fence },
                    { t: "Free estimates", I: ClipboardCheck },
                  ].map(({ t, I }) => (
                    <span
                      key={t}
                      className="flex items-center gap-2.5 text-[12px] font-medium uppercase tracking-[0.14em] text-cyan-100/75"
                    >
                      <I className="h-3.5 w-3.5 text-cyan-300/80" strokeWidth={1.6} />
                      {t}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
  );
}

export { HeroWords, Hero };
