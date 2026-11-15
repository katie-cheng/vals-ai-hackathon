import { stats, trustItems } from "../data/content";
import { CountUp, EASE, Reveal, SplitWords, Tilt } from "../lib/anim";
import { Gleams } from "../lib/fx";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  House,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  SquareStack,
} from "lucide-react";

const TRUST_ICONS = {
  shield: ShieldCheck,
  detail: ScanSearch,
  calendar: CalendarCheck,
  sparkle: Sparkles,
  home: House,
  windows: SquareStack,
};

function Trust() {
  return (
    <section id="why-us" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <video
          className="h-full w-full object-cover opacity-20"
          src="/videos/window-clean.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#04141f] via-[#04141f]/70 to-[#04141f]" />
        <div className="animate-drift absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-cyan-500/15 blur-[130px]" />
      </div>
      <Gleams count={10} className="opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 max-w-3xl sm:mb-16">
          <Reveal>
            <p className="mb-4 flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.35em] text-cyan-300">
              <span className="h-px w-10 bg-cyan-300" />
              {" 04 / Company facts"}
            </p>
          </Reveal>
          <SplitWords
            text="Careful work. Clear communication."
            as="h2"
            className="font-serif-d block text-4xl font-semibold leading-[1.05] text-white sm:text-6xl"
          />
          <Reveal delay={0.2}>
            <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-sky-100/75">
              Good exterior cleaning is not about using the most pressure. It is
              about reading the surface, working methodically, and respecting
              the home around it.
            </p>
          </Reveal>
        </div>
        <div className="mb-12 grid grid-cols-2 gap-3 sm:mb-16 lg:grid-cols-4">
          {stats.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.08}>
              <motion.div
                whileHover={{
                  y: -6,
                }}
                transition={{
                  duration: 0.35,
                  ease: EASE,
                }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-center backdrop-blur-xl sm:p-7"
              >
                <div
                  className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
                  aria-hidden
                />
                <p className="bg-gradient-to-br from-white to-cyan-200 bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
                  <CountUp to={a.value} suffix={a.suffix} />
                </p>
                <p className="mt-2 text-[13px] font-black uppercase tracking-[0.14em] text-white">
                  {a.label}
                </p>
                <p className="mt-1 text-[12px] text-sky-200/60">{a.note}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
        <div className="persp grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
          {trustItems.map((a, i) => {
            const Icon = TRUST_ICONS[a.icon] ?? ShieldCheck;
            return (
              <Reveal key={a.id} delay={(i % 3) * 0.1}>
                <Tilt max={8} className="h-full">
                  <motion.div
                    whileHover={{
                      y: -8,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: EASE,
                    }}
                    className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-xl transition-colors duration-300 hover:border-cyan-300/40 sm:p-7"
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 translate-y-full bg-gradient-to-t from-cyan-400/20 to-transparent transition-transform duration-500 group-hover:translate-y-0"
                      aria-hidden
                    />
                    <div
                      className="relative mb-5 inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300/25 to-sky-500/20 ring-1 ring-cyan-300/30 transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-110 group-hover:from-cyan-300 group-hover:to-sky-400"
                      style={{
                        transform: "translateZ(30px)",
                      }}
                    >
                      <Icon
                        className="h-6 w-6 text-cyan-200 transition-colors duration-300 group-hover:text-[#04141f]"
                        strokeWidth={2.2}
                      />
                    </div>
                    <h3
                      className="relative text-lg font-black text-white"
                      style={{
                        transform: "translateZ(20px)",
                      }}
                    >
                      {a.title}
                    </h3>
                    <p className="relative mt-2.5 text-[14px] leading-relaxed text-sky-100/70">
                      {a.description}
                    </p>
                  </motion.div>
                </Tilt>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { TRUST_ICONS, Trust };
