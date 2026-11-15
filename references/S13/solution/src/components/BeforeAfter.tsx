import * as React from "react";
import { comparisons } from "../data/content";
import { EASE, Reveal, SplitWords } from "../lib/anim";
import { Gleams } from "../lib/fx";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronsLeftRight, MoveHorizontal } from "lucide-react";

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
      className="relative aspect-[4/3] w-full cursor-ew-resize select-none overflow-hidden rounded-[1.75rem] border border-white/12 shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)] sm:aspect-[16/10]"
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
        <motion.div
          className="absolute -left-1/3 top-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: ["0%", "500%"],
          }}
          transition={{
            duration: 4.5,
            repeat: 1 / 0,
            ease: "easeInOut",
            repeatDelay: 2,
          }}
        />
      </div>
      <Gleams count={8} />
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
      <span className="absolute left-4 top-4 z-20 rounded-full border border-white/25 bg-black/55 px-3.5 py-1.5 text-[13px] font-bold text-white backdrop-blur">
        Before
      </span>
      <span className="absolute right-4 top-4 z-20 rounded-full bg-cyan-300 px-3.5 py-1.5 text-[13px] font-bold text-[#04141f] shadow-lg">
        After
      </span>
      <div
        className="absolute inset-y-0 z-10"
        style={{
          left: `${r}%`,
        }}
        aria-hidden
      >
        <div className="absolute inset-y-0 -left-px w-[3px] bg-gradient-to-b from-cyan-200 via-white to-cyan-200 shadow-[0_0_20px_rgba(34,211,238,.9)]" />
        <motion.div
          animate={
            u
              ? {
                  scale: 1.25,
                }
              : {
                  scale: 1,
                }
          }
          transition={
            u
              ? {
                  duration: 0.2,
                }
              : {
                  duration: 0.2,
                }
          }
          className="absolute top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white/80 bg-gradient-to-br from-cyan-300 to-sky-500 text-[#04141f] shadow-[0_10px_36px_-6px_rgba(34,211,238,1)]"
        >
          <ChevronsLeftRight className="h-6 w-6" strokeWidth={2.8} />
        </motion.div>
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
            className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#04141f]/70 px-4 py-2 text-[12px] font-bold text-cyan-100 backdrop-blur-xl"
          >
            <MoveHorizontal className="h-4 w-4 text-cyan-300" />
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
        <div className="animate-drift absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-cyan-300/30 blur-[120px]" />
        <div
          className="animate-drift absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-400/20 blur-[110px]"
          style={{
            animationDelay: "-7s",
          }}
        />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <SplitWords
              text="See what a thorough clean changes."
              as="h2"
              className="font-serif-d block text-4xl font-semibold leading-[1.05] sm:text-6xl"
            />
            <Reveal delay={0.2}>
              <p className="mt-4 text-[15.5px] leading-relaxed text-slate-600">
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
                className={`group relative overflow-hidden rounded-full px-4 py-2.5 text-[13px] font-medium transition-all duration-300 ${u === a ? "bg-[#04141f] text-white shadow-[0_12px_30px_-10px_rgba(4,20,31,.6)]" : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:ring-sky-400 hover:text-sky-700"}`}
              >
                {u === a && (
                  <motion.span
                    layoutId="tab-glow"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-sky-500/30"
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
              className="grid h-12 w-12 place-items-center rounded-full bg-[#04141f] text-white transition-all duration-300 hover:scale-105 hover:bg-sky-700"
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
              className="grid h-12 w-12 place-items-center rounded-full bg-[#04141f] text-white transition-all duration-300 hover:scale-105 hover:bg-sky-700"
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
