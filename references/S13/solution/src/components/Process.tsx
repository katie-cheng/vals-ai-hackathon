import * as React from "react";
import { SITE, processSteps } from "../data/content";
import { EASE, Reveal, SplitWords, DUR } from "../lib/anim";
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
      className="bg-tone-a relative overflow-hidden py-24 sm:py-32"
    >
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 sm:px-10 lg:px-24 grid-12 split-5-7">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SplitWords
            text="From first message to final check."
            as="h2"
            className="font-serif-d block text-[1.9rem] font-normal leading-tight text-white sm:text-[2.6rem]"
          />
          <Reveal delay={0.2}>
            <p className="mt-5 text-[17px] leading-relaxed text-sky-100/75">
              You will know what we are cleaning, what it costs, and when we are
              coming before the work begins.
            </p>
          </Reveal>
        </div>
        <div className="relative">
          <div
            className="absolute left-[21px] top-6 h-[calc(100%-3rem)] w-[2px] overflow-hidden rounded-full bg-white/10"
            aria-hidden
          >
            <motion.div
              className="h-full w-full origin-top bg-cyan-300"
              style={{
                scaleY: r,
              }}
            />
          </div>
          <ol>
            {processSteps.map((l) => (
              <li key={l.id} className="relative pl-16">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-20% 0px" }}
                  transition={{ duration: DUR.base, ease: EASE }}
                  className="absolute left-0 top-5 z-10 grid h-11 w-11 place-items-center rounded-full border border-cyan-300 bg-[#04141f] text-lg font-light text-cyan-100"
                >
                  {l.step_number}
                </motion.div>
                <Reveal delay={0.1}>
                  <div className="border-b border-white/10 py-6">
                    <h3 className="font-serif-d text-[1.25rem] font-normal leading-snug text-white">
                      {l.title}
                    </h3>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-sky-100/70">
                      {l.description}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export { Process };
