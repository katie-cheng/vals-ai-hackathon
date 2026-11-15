import * as React from "react";
import { Plus } from "lucide-react";
import { SITE, faqs } from "../data/content";
import { EASE, Reveal, SplitWords } from "../lib/anim";
import { AnimatePresence, motion } from "framer-motion";

function Faq() {
  const [a, i] = React.useState(faqs[0]?.id ?? null);
  return (
    <section id="faq" className="bg-tone-b relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
      </div>
      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 sm:px-10 lg:px-24 grid-12 split-5-7">
        <div>
          <SplitWords
            text="Useful answers before you book."
            as="h2"
            className="font-serif-d block text-[1.9rem] font-normal leading-tight text-white sm:text-[2.6rem]"
          />
        </div>
        <div className="space-y-3">
          {faqs.map((r, l) => {
            const u = a === r.id;
            return (
              <Reveal key={r.id} delay={Math.min(l * 0.04, 0.3)} y={24}>
                <motion.article
                  className={`overflow-hidden rounded-lg border transition-colors duration-300 ${u ? "border-cyan-300/40 bg-cyan-300/[0.07]" : "card-tone border-white/10 bg-white/[0.02] hover:border-white/25"}`}
                >
                  <button
                    onClick={() => i(u ? null : r.id)}
                    aria-expanded={u}
                    aria-controls={`faq-answer-${r.id}`}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                  >
                    <span
                      className={`text-[13px] font-semibold tabular-nums ${u ? "text-cyan-300" : "text-sky-200/40"}`}
                    >
                      {String(l + 1).padStart(2, "0")}
                    </span>
                    <strong className="flex-1 text-[15px] font-medium text-white sm:text-base">
                      {r.question}
                    </strong>
                    <motion.span
                      animate={{
                        rotate: u ? 45 : 0,
                      }}
                      transition={{
                        duration: 0.35,
                        ease: EASE,
                      }}
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors duration-300 ${u ? "bg-cyan-300 text-[#04141f]" : "bg-white/10 text-cyan-200"}`}
                    >
                      <Plus className="h-4 w-4" strokeWidth={2.25} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {u && (
                      <motion.div
                        id={`faq-answer-${r.id}`}
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.45,
                          ease: EASE,
                        }}
                      >
                        <p className="px-5 pb-5 pl-[3.4rem] text-[14.5px] leading-relaxed text-sky-100/75 sm:px-6 sm:pl-[3.7rem]">
                          {r.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              </Reveal>
            );
          })}
        </div>
      </div>
      <div className="hidden">
      </div>
    </section>
  );
}

export { Faq };
