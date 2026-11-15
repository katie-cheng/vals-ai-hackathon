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
        <React.Fragment key={u}>
        <span className="inline-block" aria-hidden>
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
        </span>
          {u < words.length - 1 ? " " : null}
        </React.Fragment>
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
          <div className="absolute inset-0 bg-[#04141f]/65" />
        </motion.div>
        <motion.div
          style={{
            x: S,
            y: A,
          }}
          className="pointer-events-none absolute inset-0"
          aria-hidden
        >
        </motion.div>
        <motion.div
          style={{
            x: E,
            y: V,
          }}
          className="pointer-events-none absolute inset-0"
          aria-hidden
        >
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
                background: "rgba(224,242,254,.6)",
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
          <h1 className="max-w-4xl text-[11vw] font-semibold leading-[1] tracking-tight text-white sm:text-6xl lg:text-[4.4rem]">
            <HeroWords text="Connecticut," delay={0.35} className="block" />
            <HeroWords
              text="in its best light."
              delay={0.62}
              className="block"
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
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-md bg-cyan-300 px-4 py-2 text-[15px] font-medium text-[#04141f] transition-all duration-500 hover:bg-right"
              >
                Get my free quote
              </a>
            </Magnetic>
          </motion.div>
          <motion.div
            className="mt-12 hidden gap-3 lg:flex"
            aria-hidden
          >
            {[
              {
                t: "Interior + exterior glass",
              },
              {
                t: "Gutters · Siding · Concrete",
              },
              {
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
                className={`glass flex items-center gap-2.5 rounded-lg px-4 py-3 text-[13px] font-medium text-sky-50 ${H % 2 ? "animate-float-y-sm" : "animate-float-y"}`}
                style={{
                  animationDelay: `${H * 0.8}s`,
                }}
              >
                {M.t}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        <motion.div
          className="absolute inset-x-0 bottom-0 z-10"
          aria-hidden
        >
          <div className="overflow-hidden border-t border-cyan-300/20 bg-[#04141f]/85 py-3 backdrop-blur-xl">
            <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap pr-8">
              {[0, 1].map((M) => (
                <div key={M} className="flex items-center gap-8">
                  {[
                    "Pressure washing",
                    "Window cleaning",
                    "Gutter cleaning",
                    "House washing",
                    "Driveways",
                    "Patios",
                    "Free estimates",
                  ].map((H) => (
                    <span
                      key={H}
                      className="flex items-center gap-8 text-[14px] font-medium text-cyan-100/80"
                    >
                      {H}
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
