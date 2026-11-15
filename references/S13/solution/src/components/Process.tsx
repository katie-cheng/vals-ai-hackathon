import * as React from "react";
import { SITE, processSteps } from "../data/content";
import { EASE, Reveal, SplitWords } from "../lib/anim";
import { Bubbles } from "../lib/fx";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BadgeDollarSign,
  CalendarCheck,
  ClipboardList,
  Droplets,
  Sparkles,
} from "lucide-react";

const PROCESS_ICONS = [ClipboardList, CalendarCheck, Droplets, Sparkles];

function Process() {
  const a = React.useRef(null),
    { scrollYProgress: i } = useScroll({
      target: a,
      offset: ["start 0.75", "end 0.55"],
    }),
    r = useTransform(i, [0, 1], [0, 1]);
  return (
    <section
      ref={a}
      id="process"
      className="relative overflow-hidden py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="animate-drift absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-sky-600/12 blur-[140px]" />
      </div>
      <Bubbles count={16} className="opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center sm:mb-20">
          <Reveal>
            <p className="mb-4 flex items-center justify-center gap-3 text-[12px] font-black uppercase tracking-[0.35em] text-cyan-300">
              <span className="h-px w-10 bg-cyan-300" />
              {" 03 / How it works "}
              <span className="h-px w-10 bg-cyan-300" />
            </p>
          </Reveal>
          <SplitWords
            text="From first message to final check."
            as="h2"
            className="font-serif-d block text-4xl font-semibold leading-[1.05] text-white sm:text-6xl"
          />
          <Reveal delay={0.2}>
            <p className="mt-5 text-[15.5px] leading-relaxed text-sky-100/75">
              You will know what we are cleaning, what it costs, and when we are
              coming before the work begins. One request can include several
              services.
            </p>
          </Reveal>
        </div>
        <div className="relative">
          <div
            className="absolute left-[27px] top-4 hidden h-[calc(100%-2rem)] w-[3px] overflow-hidden rounded-full bg-white/10 md:block lg:left-1/2 lg:-translate-x-1/2"
            aria-hidden
          >
            <motion.div
              className="h-full w-full origin-top bg-gradient-to-b from-cyan-300 via-sky-400 to-cyan-200"
              style={{
                scaleY: r,
              }}
            />
          </div>
          <svg
            className="absolute left-[27px] top-4 hidden h-[calc(100%-2rem)] w-[3px] md:block lg:left-1/2 lg:-translate-x-1/2"
            aria-hidden
          >
            <line
              x1="1.5"
              y1="0"
              x2="1.5"
              y2="100%"
              stroke="rgba(255,255,255,.7)"
              strokeWidth="1.5"
              strokeDasharray="6 10"
              className="animate-flow-dash"
            />
          </svg>
          <div className="space-y-10 md:space-y-0">
            {processSteps.map((l, u) => {
              const Icon = PROCESS_ICONS[u % PROCESS_ICONS.length],
                d = u % 2 === 0;
              return (
                <div
                  key={l.id}
                  className={`relative md:grid md:grid-cols-2 md:gap-16 md:pb-16 ${u === processSteps.length - 1 ? "md:pb-0" : ""}`}
                >
                  <motion.div
                    initial={{
                      scale: 0,
                      rotate: -90,
                    }}
                    whileInView={{
                      scale: 1,
                      rotate: 0,
                    }}
                    viewport={{
                      once: true,
                      margin: "-20% 0px",
                    }}
                    transition={{
                      duration: 0.7,
                      ease: EASE,
                    }}
                    className="absolute left-0 top-0 z-10 grid h-14 w-14 place-items-center rounded-2xl border border-cyan-300/40 bg-gradient-to-br from-cyan-300 to-sky-500 text-[#04141f] shadow-[0_12px_36px_-8px_rgba(34,211,238,.9)] md:left-1/2 md:-translate-x-1/2 lg:h-16 lg:w-16"
                  >
                    <Icon className="h-6 w-6 lg:h-7 lg:w-7" strokeWidth={2.4} />
                    <span className="absolute -right-1.5 -top-1.5 grid h-7 w-7 place-items-center rounded-full bg-white text-[12px] font-black text-[#04141f] shadow">
                      {l.step_number}
                    </span>
                  </motion.div>
                  <div
                    className={`pl-20 md:pl-0 ${d ? "md:col-start-1 md:pr-4 md:text-right" : "md:col-start-2 md:pl-4"}`}
                  >
                    <Reveal delay={0.1}>
                      <motion.div
                        whileHover={{
                          y: -6,
                          scale: 1.015,
                        }}
                        transition={{
                          duration: 0.35,
                          ease: EASE,
                        }}
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl transition-colors duration-300 hover:border-cyan-300/40 sm:p-8"
                      >
                        <div
                          className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-400/15 blur-3xl transition-all duration-500 group-hover:bg-cyan-400/30"
                          aria-hidden
                        />
                        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-200">
                          {l.tag}
                        </p>
                        <h3 className="font-serif-d text-2xl font-semibold text-white sm:text-[1.7rem]">
                          {l.title}
                        </h3>
                        <p className="mt-3 text-[14.5px] leading-relaxed text-sky-100/70">
                          {l.description}
                        </p>
                        {u === 0 && (
                          <a
                            href="#quote"
                            className="mt-5 inline-flex items-center gap-2 text-[13.5px] font-black text-cyan-300 transition-all hover:gap-3 hover:text-cyan-200"
                          >
                            {"Start your request "}
                            <ArrowRight className="h-4 w-4" />
                          </a>
                        )}
                        {u === 1 && (
                          <p className="mt-5 inline-flex items-center gap-2 text-[13px] font-bold text-sky-200/80">
                            <BadgeDollarSign className="h-4 w-4 text-cyan-300" />
                            {
                              " Complete price confirmed before work is scheduled"
                            }
                          </p>
                        )}
                      </motion.div>
                    </Reveal>
                  </div>
                  <div
                    className={
                      d ? "md:col-start-2" : "md:col-start-1 md:row-start-1"
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
        <Reveal className="mt-14 text-center">
          <p className="text-[14px] text-sky-100/70">
            Have photos of the problem areas?{" "}
            <a
              href={SITE.smsHref}
              className="font-bold text-cyan-300 underline decoration-cyan-300/40 underline-offset-4 transition hover:text-cyan-200"
            >
              {"Text them to "}
              {SITE.phoneDisplay}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export { PROCESS_ICONS, Process };
