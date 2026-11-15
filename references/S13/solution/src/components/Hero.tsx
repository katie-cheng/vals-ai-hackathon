import * as React from "react";
import { SITE } from "../data/content";
import { EASE, Magnetic } from "../lib/anim";
import { Bubbles, Gleams, ParticleCanvas } from "../lib/fx";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Droplets,
  Phone,
  Sparkles,
} from "lucide-react";

function HeroWords({
  text: a,
  delay: i = 0,
  className: r = "",
  wordClassName: w = "",
}: {
  text: string;
  delay?: number;
  className?: string;
  wordClassName?: string;
}) {
  const words = a.split(" ");
  return (
    <span className={r} aria-label={a}>
      {words.map((l, u) => (
        <span key={u} className="inline-block" aria-hidden>
          <motion.span
            className={`inline-block will-change-transform ${w}`}
            initial={{
              y: "0.35em",
              opacity: 0,
            }}
            animate={{
              y: "0em",
              opacity: 1,
            }}
            transition={{
              duration: 1,
              ease: EASE,
              delay: i + u * 0.09,
            }}
          >
            {l}
          </motion.span>
          {u < words.length - 1 ? <span>{" "}</span> : null}
        </span>
      ))}
    </span>
  );
}
function Hero() {
  const a = React.useRef(null),
    { scrollYProgress: i } = useScroll({
      target: a,
      offset: ["start start", "end start"],
    }),
    r = useTransform(i, [0, 1], ["0%", "28%"]),
    l = useTransform(i, [0, 1], [1, 1.22]),
    u = useTransform(i, [0, 0.75], [1, 0]),
    h = useTransform(i, [0, 1], [0, -140]),
    y = useMotionValue(0),
    b = useMotionValue(0),
    v = useSpring(y, {
      stiffness: 55,
      damping: 18,
    }),
    g = useSpring(b, {
      stiffness: 55,
      damping: 18,
    }),
    S = useTransform(v, [-1, 1], [-26, 26]),
    A = useTransform(g, [-1, 1], [-18, 18]),
    E = useTransform(v, [-1, 1], [34, -34]),
    V = useTransform(g, [-1, 1], [22, -22]);
  return (
    React.useEffect(() => {
      const M = (H) => {
        (y.set((H.clientX / window.innerWidth - 0.5) * 2),
          b.set((H.clientY / window.innerHeight - 0.5) * 2));
      };
      return (
        window.addEventListener("mousemove", M, {
          passive: true,
        }),
        () => window.removeEventListener("mousemove", M)
      );
    }, [y, b]),
    (
      <section
        ref={a}
        id="top"
        className="relative flex min-h-[108svh] flex-col overflow-hidden"
      >
        <motion.div
          style={{
            y: r,
            scale: l,
          }}
          className="absolute inset-0"
          aria-hidden
        >
          <div className="animate-drift absolute -inset-[6%]">
            <video
              className="h-full w-full object-cover"
              src="/videos/hero-wash.mp4"
              poster="/images/hero-house.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#04141f]/80 via-[#04141f]/35 to-[#04141f]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#04141f]/85 via-transparent to-[#04141f]/40" />
        </motion.div>
        <motion.div
          style={{
            x: S,
            y: A,
          }}
          className="pointer-events-none absolute inset-0"
          aria-hidden
        >
          <div className="absolute left-[8%] top-[16%] h-72 w-72 rounded-full bg-cyan-400/25 blur-[110px]" />
          <div className="absolute bottom-[22%] right-[10%] h-80 w-80 rounded-full bg-sky-500/20 blur-[120px]" />
        </motion.div>
        <motion.div
          style={{
            x: E,
            y: V,
          }}
          className="pointer-events-none absolute inset-0"
          aria-hidden
        >
          <div className="animate-pulse-soft absolute right-[22%] top-[12%] h-40 w-40 rounded-full bg-white/10 blur-[80px]" />
        </motion.div>
        <ParticleCanvas density={80} />
        <Bubbles count={22} />
        <Gleams count={12} />
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-60"
          aria-hidden
        >
          {Array.from({
            length: 12,
          }).map((M, H) => (
            <span
              key={H}
              className="animate-droplet-roll absolute rounded-full"
              style={{
                left: `${(H * 83 + 13) % 100}%`,
                top: 0,
                width: 3 + ((H * 37) % 5),
                height: 20 + ((H * 53) % 60),
                animationDuration: `${5 + ((H * 29) % 7)}s`,
                animationDelay: `${-((H * 41) % 10)}s`,
                background:
                  "linear-gradient(180deg, transparent, rgba(186,230,253,.4) 30%, rgba(255,255,255,.7) 50%, rgba(125,211,252,.35) 75%, transparent)",
              }}
            />
          ))}
        </div>
        <motion.div
          style={{
            opacity: u,
            y: h,
          }}
          className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pt-36 sm:px-6 lg:pt-40"
        >
          <h1 className="max-w-5xl text-[13.5vw] font-black leading-[0.92] tracking-tight text-white sm:text-7xl lg:text-[6.2rem]">
            <HeroWords text="Connecticut," delay={0.35} className="block" />
            <HeroWords
              text="in its best light."
              delay={0.62}
              className="block"
              wordClassName="animate-shine-text bg-gradient-to-r from-cyan-200 via-white to-sky-300 bg-clip-text pb-[0.08em] text-transparent"
            />
          </h1>
          <motion.p
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 1,
              ease: EASE,
              delay: 1.05,
            }}
            className="mt-6 max-w-xl text-base leading-relaxed text-sky-100/85 sm:text-lg"
          >
            Window cleaning, gutter care, house washing, and pressure washing
            for homes across Connecticut. We explain the work, agree on the
            scope, and clean with attention to the surface.
          </motion.p>
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 1,
              ease: EASE,
              delay: 1.2,
            }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Magnetic>
              <a
                href="#quote"
                className="shine-sweep group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-cyan-300 bg-[length:200%_auto] px-8 py-4 text-[15px] font-black text-[#04141f] shadow-[0_20px_60px_-12px_rgba(34,211,238,.8)] transition-all duration-500 hover:bg-right hover:shadow-[0_24px_70px_-10px_rgba(34,211,238,1)]"
              >
                <Sparkles className="h-5 w-5 transition-transform duration-500 group-hover:rotate-[25deg] group-hover:scale-125" />
                Get my free quote
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={SITE.phoneHref}
                className="group inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/5 px-7 py-4 text-[15px] font-bold text-white backdrop-blur-xl transition-all duration-300 hover:border-cyan-300/60 hover:bg-cyan-300/10"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-cyan-300/20 transition-transform duration-300 group-hover:scale-110">
                  <Phone className="h-4 w-4 text-cyan-200" />
                </span>
                {"Call "}
                {SITE.phoneDisplay}
              </a>
            </Magnetic>
          </motion.div>
          <motion.div
            className="mt-12 hidden gap-3 lg:flex"
            aria-hidden
          >
            {[
              {
                icon: BadgeCheck,
                t: "Interior + exterior glass",
              },
              {
                icon: Droplets,
                t: "Gutters · Siding · Concrete",
              },
              {
                icon: Sparkles,
                t: "Streak-aware finish",
              },
            ].map((M, H) => (
              <motion.div
                key={M.t}
                initial={{
                  opacity: 0,
                  y: 40,
                  rotate: -3,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotate: 0,
                }}
                transition={{
                  duration: 0.9,
                  ease: EASE,
                  delay: 1.4 + H * 0.15,
                }}
                className={`glass flex items-center gap-2.5 rounded-2xl px-4 py-3 text-[13px] font-bold text-sky-50 ${H % 2 ? "animate-float-y-sm" : "animate-float-y"}`}
                style={{
                  animationDelay: `${H * 0.8}s`,
                }}
              >
                <M.icon className="h-4 w-4 text-cyan-300" />
                {M.t}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        <motion.a
          href="#services"
          style={{
            opacity: u,
          }}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 1.8,
            duration: 1,
          }}
          className="group relative z-10 mx-auto mb-28 flex flex-col items-center gap-2 text-sky-200/70 transition-colors hover:text-white"
          aria-label="Scroll to explore"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.3em]">
            Scroll to explore
          </span>
          <span className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/5 backdrop-blur transition-all duration-300 group-hover:border-cyan-300/60 group-hover:bg-cyan-300/10">
            <ArrowDown className="h-5 w-5 animate-bounce text-cyan-300" />
          </span>
        </motion.a>
        <motion.div
          className="absolute inset-x-0 bottom-0 z-10"
          aria-hidden
        >
          <div className="overflow-hidden border-t border-cyan-300/20 bg-[#04141f]/85 py-3 backdrop-blur-xl">
            <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap pr-8">
              {[0, 1].map((M) => (
                <div key={M} className="flex items-center gap-8">
                  {[
                    "PRESSURE WASHING",
                    "WINDOW CLEANING",
                    "GUTTER CLEANING",
                    "HOUSE WASHING",
                    "DRIVEWAYS",
                    "PATIOS",
                    "FREE ESTIMATES",
                  ].map((H) => (
                    <span
                      key={H}
                      className="flex items-center gap-8 text-[13px] font-black tracking-[0.28em] text-cyan-200/80"
                    >
                      {H}
                      <Droplets className="h-3.5 w-3.5 text-cyan-400" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    )
  );
}

export { HeroWords, Hero };
