import * as React from "react";
import { comparisons } from "../data/content";
import { EASE, Reveal, SplitWords } from "../lib/anim";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronsLeftRight } from "lucide-react";

function ComparisonSlider({ active: a }) {
  const i = comparisons[a],
    [r, l] = React.useState(50),
    [u, h] = React.useState(false),
    [d, p] = React.useState(true),
    y = React.useRef(null);
  (React.useEffect(() => {
    (p(true), l(50));
  }, [a]),
    React.useEffect(() => {
      if (!d) return;
      let g = 0;
      const S = performance.now(),
        A = (E) => {
          const V = (E - S) / 1e3;
          (l(50 + Math.sin(V * 0.9) * 26), (g = requestAnimationFrame(A)));
        };
      return ((g = requestAnimationFrame(A)), () => cancelAnimationFrame(g));
    }, [d]));
  const b = (g) => {
      const S = y.current?.getBoundingClientRect();
      S && l(Math.min(96, Math.max(4, ((g - S.left) / S.width) * 100)));
    };
  return (
    <div
      ref={y}
      className="relative aspect-[4/3] w-full cursor-ew-resize select-none overflow-hidden rounded-lg border border-white/12 sm:aspect-[16/10]"
      onPointerDown={(g) => {
        (p(false),
          h(true),
          (g.target as HTMLElement).setPointerCapture?.(g.pointerId),
          b(g.clientX));
      }}
      onPointerMove={(g) => u && b(g.clientX)}
      onPointerUp={() => h(false)}
      onPointerCancel={() => h(false)}
      role="slider"
      aria-label={`${i.title} before and after comparison`}
      aria-valuenow={Math.round(r)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={(g) => {
        (g.key === "ArrowLeft" && (p(false), l((S) => Math.max(4, S - 4))),
          g.key === "ArrowRight" && (p(false), l((S) => Math.min(96, S + 4))));
      }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={i.slug + "-after"}
          src={i.after_image}
          alt={i.alt_text}
          initial={{
            opacity: 0,
            scale: 1.06,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.7,
            ease: EASE,
          }}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      </AnimatePresence>
      <div className="pointer-events-none absolute inset-0" aria-hidden>
      </div>
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          width: `${r}%`,
        }}
        aria-hidden
      >
        <div
          className="relative h-full"
          style={{
            width: `${(100 / r) * 100}%`,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={i.slug + "-before"}
              src={i.before_image}
              alt=""
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.7,
                ease: EASE,
              }}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
          </AnimatePresence>
        </div>
      </div>
      <span className="absolute left-4 top-4 z-20 rounded-md border border-white/25 bg-black/60 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-white">
        Before
      </span>
      <span className="absolute right-4 top-4 z-20 rounded-md border border-white/25 bg-black/60 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-white">
        After
      </span>
      <div
        className="absolute inset-y-0 z-10"
        style={{
          left: `${r}%`,
        }}
        aria-hidden
      >
        <div className="absolute inset-y-0 -left-px w-[2px] bg-white/80" />
        <div className="absolute top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-md border border-white/25 bg-black/60 text-white">
          <ChevronsLeftRight className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
      <AnimatePresence>
        {d && (
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
            }}
            className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-md border border-white/25 bg-black/60 px-3.5 py-1.5 text-[12.5px] font-medium text-white"
          >
            Drag to reveal the clean
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BeforeAfter() {
  const [a, i] = React.useState(0),
    r = comparisons[a];
  return (
    <section
      id="results"
      className="relative overflow-hidden bg-[#f5fafd] py-24 text-[#04141f] sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
      </div>
      <div className="relative mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="mb-10 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <SplitWords
              text="See what a thorough clean changes."
              as="h2"
              className="font-serif-d block text-[1.9rem] font-medium leading-tight sm:text-[2.6rem]"
            />
            <Reveal delay={0.2}>
              <p className="mt-4 text-[17px] leading-relaxed text-slate-600">
                Move the control across each image to compare the surface before
                and after cleaning. These examples illustrate the difference in
                clarity, color, and visible buildup.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.15} className="flex flex-wrap gap-2">
            {comparisons.map((l, u) => (
              <button
                key={l.slug}
                onClick={() => i(u)}
                className={`group relative overflow-hidden rounded-md px-4 py-2.5 text-[13px] font-medium transition-all duration-300 ${u === a ? "bg-[#04141f] text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-sky-400 hover:text-sky-700"}`}
              >
                {u === a && (
                  <motion.span
                    layoutId="tab-glow"
                    className="absolute inset-0 bg-cyan-400/30"
                    transition={{
                      duration: 0.5,
                      ease: EASE,
                    }}
                  />
                )}
                <span className="relative">{l.title}</span>
              </button>
            ))}
          </Reveal>
        </div>
        <Reveal>
          <ComparisonSlider active={a} />
        </Reveal>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={r.slug}
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              transition={{
                duration: 0.45,
                ease: EASE,
              }}
              className="max-w-2xl"
            >
              <p className="text-[15px] leading-relaxed text-slate-600">
                {r.description}
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                i((l) => (l - 1 + comparisons.length) % comparisons.length)
              }
              className="grid h-12 w-12 place-items-center rounded-full bg-[#04141f] text-white transition-all duration-300 hover:bg-sky-700"
              aria-label="Previous comparison"
            >
              ←
            </button>
            <div className="flex gap-1.5 px-2">
              {comparisons.map((l, u) => (
                <button
                  key={l.slug}
                  onClick={() => i(u)}
                  aria-label={`Show ${l.title}`}
                  className={`h-2 rounded-full transition-all duration-400 ${u === a ? "w-8 bg-sky-500" : "w-2 bg-slate-300 hover:bg-sky-300"}`}
                />
              ))}
            </div>
            <button
              onClick={() => i((l) => (l + 1) % comparisons.length)}
              className="grid h-12 w-12 place-items-center rounded-full bg-[#04141f] text-white transition-all duration-300 hover:bg-sky-700"
              aria-label="Next comparison"
            >
              →
            </button>
          </div>
        </div>
        <p className="mt-4 text-[12px] italic text-slate-400">
          Illustrative comparison. Results depend on the material and its
          condition.
        </p>
      </div>
    </section>
  );
}

export { ComparisonSlider, BeforeAfter };
