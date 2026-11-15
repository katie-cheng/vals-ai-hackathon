import * as React from "react";
import { SITE, processSteps } from "../data/content";
import { EASE, Reveal, SplitWords } from "../lib/anim";
import { motion, useScroll, useTransform } from "framer-motion";

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
      className="relative overflow-hidden bg-gradient-to-b from-[#04141f] via-[#082230] to-[#04141f] py-24 sm:py-32"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center sm:mb-20">
          <SplitWords
            text="From first message to final check."
            as="h2"
            className="font-serif-d block text-[1.9rem] font-medium leading-tight text-white sm:text-[2.6rem]"
          />
          <Reveal delay={0.2}>
            <p className="mt-5 text-[17px] leading-relaxed text-sky-100/75">
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
              className="h-full w-full origin-top bg-cyan-300"
              style={{
                scaleY: r,
              }}
            />
          </div>
          <div className="space-y-10 md:space-y-0">
            {processSteps.map((l, u) => {
              const d = u % 2 === 0;
              return (
                <div
                  key={l.id}
                  className={`relative md:grid md:grid-cols-2 md:gap-16 md:pb-16 ${u === processSteps.length - 1 ? "md:pb-0" : ""}`}
                >
                  <motion.div
                    initial={{
                      opacity: 0,
                    }}
                    whileInView={{
                      opacity: 1,
                    }}
                    viewport={{
                      once: true,
                      margin: "-20% 0px",
                    }}
                    transition={{
                      duration: 0.4,
                      ease: EASE,
                    }}
                    className="font-serif-d absolute left-0 top-0 z-10 grid h-14 w-14 place-items-center rounded-full border-2 border-cyan-300 bg-[#04141f] text-2xl font-semibold text-cyan-100 md:left-1/2 md:-translate-x-1/2 lg:h-16 lg:w-16"
                  >
                    {l.step_number}
                  </motion.div>
                  <div
                    className={`pl-20 md:pl-0 ${d ? "md:col-start-1 md:pr-4 md:text-right" : "md:col-start-2 md:pl-4"}`}
                  >
                    <Reveal delay={0.1}>
                      <motion.div
                        transition={{
                          duration: 0.35,
                          ease: EASE,
                        }}
                        className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.05] p-6 transition-colors duration-300 hover:border-cyan-300/40 sm:p-8"
                      >
                        <h3 className="font-serif-d text-xl font-medium text-white sm:text-[1.4rem]">
                          {l.title}
                        </h3>
                        <p className="mt-3 text-[14.5px] leading-relaxed text-sky-100/70">
                          {l.description}
                        </p>
                        {u === 1 && (
                          <p className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-sky-200/80">
                            {
                              " Complete price confirmed before work is scheduled"
                            }
                          </p>
                        )}
                      </motion.div>
                    </Reveal>
                  </div>
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
              className="font-medium text-cyan-300 underline decoration-cyan-300/40 underline-offset-4 transition hover:text-cyan-200"
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

export { Process };
