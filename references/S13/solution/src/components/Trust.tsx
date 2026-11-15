import { trustItems } from "../data/content";
import { Reveal, SplitWords, Tilt } from "../lib/anim";
import { Gleams } from "../lib/fx";
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
        <div className="absolute inset-0 bg-[#04141f]/60" />
      </div>
      <Gleams count={10} className="opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 max-w-3xl sm:mb-16">
          <SplitWords
            text="Careful work. Clear communication."
            as="h2"
            className="font-serif-d block text-[1.9rem] font-medium leading-tight text-white sm:text-[2.6rem]"
          />
          <Reveal delay={0.2}>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-sky-100/75">
              Good exterior cleaning is not about using the most pressure. It is
              about reading the surface, working methodically, and respecting
              the home around it.
            </p>
          </Reveal>
        </div>
        <div className="persp grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
          {trustItems.map((a, i) => {
            const Icon = TRUST_ICONS[a.icon] ?? ShieldCheck;
            return (
              <Reveal key={a.id} delay={(i % 3) * 0.1}>
                <Tilt max={8} className="group h-full">
                  <div
                    className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.08] p-6 backdrop-blur-xl transition-[transform,border-color] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2 group-hover:border-cyan-300/40 sm:p-7"
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div
                      className="relative mb-5 inline-grid h-14 w-14 place-items-center rounded-2xl bg-cyan-300/25 ring-1 ring-cyan-300/30 transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-110 group-hover:from-cyan-300 group-hover:to-sky-400"
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
                      className="relative text-lg font-semibold text-white"
                      style={{
                        transform: "translateZ(20px)",
                      }}
                    >
                      {a.title}
                    </h3>
                    <p className="relative mt-2.5 text-[14px] leading-relaxed text-sky-100/70">
                      {a.description}
                    </p>
                  </div>
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
