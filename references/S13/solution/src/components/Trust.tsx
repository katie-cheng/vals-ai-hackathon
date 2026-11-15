import { trustItems } from "../data/content";
import { Reveal, SplitWords } from "../lib/anim";
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
    <section id="why-us" className="bg-tone-b relative overflow-hidden py-24 sm:py-32">
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
      <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-24">
        <div className="mb-8 max-w-3xl sm:mb-10">
          <SplitWords
            text="Careful work. Clear communication."
            as="h2"
            className="font-serif-d block text-[1.9rem] font-normal leading-tight text-white sm:text-[2.6rem]"
          />
          <Reveal delay={0.2}>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-sky-100/75">
              Good exterior cleaning is not about using the most pressure. It is
              about reading the surface, working methodically, and respecting
              the home around it.
            </p>
          </Reveal>
        </div>
        <div className="persp grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:gap-8">
          {trustItems.map((a, i) => {
            return (
              <Reveal key={a.id} delay={(i % 3) * 0.1}>
                <div className="group h-full">
                  <div
                    className="surface relative h-full overflow-hidden p-6 group-hover:border-cyan-300/40 sm:p-7"
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
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
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { TRUST_ICONS, Trust };
