import * as React from "react";
import { services } from "../data/content";
import { EASE, Reveal, SplitWords, Tilt } from "../lib/anim";
import { Bubbles, DropletsFx, SprayCanvas } from "../lib/fx";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Droplets,
  House,
  Sparkles,
  Sun,
  Waves,
} from "lucide-react";

const SERVICE_ICONS = [Waves, Sun, Sparkles, Droplets, House, Building2];

function ServiceVisual({ visual: a }) {
  switch (a) {
    case "pressure":
      return (
        <>
          <SprayCanvas />
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden
          >
            {Array.from({
              length: 9,
            }).map((i, r) => (
              <span
                key={r}
                className="animate-drip absolute top-6 rounded-full bg-gradient-to-b from-white/70 to-cyan-200/10"
                style={{
                  left: `${8 + r * 10.5}%`,
                  width: 3,
                  height: 46 + ((r * 29) % 40),
                  animationDelay: `${(r * 0.37) % 3}s`,
                }}
              />
            ))}
          </div>
        </>
      );
    case "exterior-window":
      return (
        <>
          <DropletsFx count={12} />
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden
          >
            <motion.div
              className="absolute top-[-10%] h-[120%] w-16 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              animate={{
                x: ["-40%", "900%"],
              }}
              transition={{
                duration: 5.5,
                repeat: 1 / 0,
                ease: "easeInOut",
                repeatDelay: 1.2,
              }}
            />
            <motion.div
              className="absolute left-[12%] top-[8%] h-[70%] w-1.5 rounded-full bg-white/70 shadow-[0_0_18px_rgba(255,255,255,.8)]"
              animate={{
                x: [0, 190, 0],
                rotate: [-4, 3, -4],
              }}
              transition={{
                duration: 7,
                repeat: 1 / 0,
                ease: "easeInOut",
              }}
            >
              <span className="absolute -left-2 top-0 h-10 w-5 rounded bg-cyan-200/90" />
            </motion.div>
          </div>
        </>
      );
    case "interior-window":
      return (
        <>
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100/50 via-white/25 to-transparent backdrop-blur-[1.5px]"
            animate={{
              opacity: [0.85, 0.12, 0.85],
            }}
            transition={{
              duration: 8,
              repeat: 1 / 0,
              ease: "easeInOut",
            }}
            aria-hidden
          />
          <motion.div
            className="pointer-events-none absolute -left-1/4 top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-amber-100/40 to-transparent"
            animate={{
              x: ["0%", "420%"],
            }}
            transition={{
              duration: 6,
              repeat: 1 / 0,
              ease: "easeInOut",
              repeatDelay: 0.8,
            }}
            aria-hidden
          />
          <DropletsFx count={6} className="opacity-50" />
        </>
      );
    case "gutter":
      return (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 top-[46%] overflow-hidden"
            aria-hidden
          >
            <div className="absolute inset-x-0 top-6 h-10 rounded-full border-y-4 border-white/25 bg-gradient-to-b from-slate-500/60 to-slate-700/60" />
            <motion.div
              className="absolute inset-x-[-50%] top-[38px] h-2 opacity-80"
              style={{
                background:
                  "repeating-linear-gradient(90deg, rgba(125,211,252,.9) 0 26px, rgba(255,255,255,.75) 26px 40px, rgba(125,211,252,.9) 40px 66px)",
              }}
              animate={{
                x: ["0%", "6%"],
              }}
              transition={{
                duration: 0.9,
                repeat: 1 / 0,
                ease: "linear",
              }}
            />
            {Array.from({
              length: 5,
            }).map((i, r) => (
              <svg
                key={r}
                className="animate-leaf absolute top-7"
                style={{
                  animationDelay: `${r * 1.35}s`,
                  animationDuration: `${6 + (r % 3)}s`,
                }}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={r % 2 ? "#bef264" : "#4ade80"}
              >
                <path
                  d="M12 2C7 7 5 12 6 20c8 1 13-1 15-9 1.4-5.6-3-9-9-9zm0 0c-2 4-3 8-2.5 13M12 2c2.5 3.5 3.5 7.5 3 12"
                  stroke="#166534"
                  strokeWidth="1"
                  fillOpacity=".9"
                />
              </svg>
            ))}
          </div>
          <Bubbles count={10} minSize={2} maxSize={10} />
        </>
      );
    case "house":
      return (
        <>
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 90% 60% at 30% 70%, rgba(101,67,33,.5), transparent 60%), radial-gradient(ellipse 70% 50% at 75% 30%, rgba(74,90,46,.45), transparent 60%)",
            }}
            animate={{
              opacity: [0.95, 0.05, 0.95],
            }}
            transition={{
              duration: 9,
              repeat: 1 / 0,
              ease: "easeInOut",
            }}
            aria-hidden
          />
          <motion.div
            className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent"
            animate={{
              x: ["-30%", "480%"],
            }}
            transition={{
              duration: 4.5,
              repeat: 1 / 0,
              ease: "easeInOut",
            }}
            aria-hidden
          />
          <DropletsFx count={8} className="opacity-60" />
        </>
      );
    default:
      return (
        <>
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-cyan-200/25"
            animate={{
              opacity: [0.2, 0.9, 0.2],
              x: ["-12%", "12%", "-12%"],
            }}
            transition={{
              duration: 7,
              repeat: 1 / 0,
              ease: "easeInOut",
            }}
            aria-hidden
          />
          <motion.div
            className="pointer-events-none absolute bottom-6 left-6 right-6 h-1.5 rounded-full bg-white/10"
            aria-hidden
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-sky-400"
              animate={{
                x: ["-100%", "320%"],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3.4,
                repeat: 1 / 0,
                ease: "easeInOut",
              }}
              style={{
                width: "30%",
              }}
            />
          </motion.div>
          <Bubbles count={8} minSize={2} maxSize={9} />
        </>
      );
  }
}

function ServiceRow({ index: a }) {
  const i = services[a],
    Icon = SERVICE_ICONS[a % SERVICE_ICONS.length],
    l = React.useRef(null),
    { scrollYProgress: u } = useScroll({
      target: l,
      offset: ["start end", "end start"],
    }),
    h = useTransform(u, [0, 1], ["-8%", "8%"]),
    d = a % 2 === 1;
  return (
    <div ref={l} className="persp">
      <Reveal>
        <Tilt
          max={5}
          className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl"
        >
          <div className="grid gap-0 lg:grid-cols-2 ">
            <div
              className={`relative min-h-[300px] overflow-hidden lg:min-h-[420px] ${d ? "lg:order-2" : ""}`}
            >
              <motion.img
                src={i.image_url}
                alt={i.image_alt}
                loading="lazy"
                style={{
                  y: h,
                }}
                className="absolute inset-0 h-[116%] w-full scale-105 object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04141f]/90 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#04141f]/40" />
              <ServiceVisual visual={i.visual} />
              <div className="animate-float-y-sm absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/20 bg-[#04141f]/60 px-4 py-2 backdrop-blur-xl">
                <Icon className="h-4 w-4 text-cyan-300" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                  {i.eyebrow}
                </span>
              </div>
              <div className="absolute bottom-5 right-5 hidden items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-[12px] font-black text-[#04141f] opacity-0 transition-all duration-500 group-hover:opacity-100 lg:flex">
                {i.quote_label} <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </div>
            <div
              className={`relative flex flex-col justify-center gap-5 p-7 sm:p-10 ${d ? "lg:order-1" : ""}`}
            >
              <span
                className="font-serif-d pointer-events-none absolute right-6 top-4 text-[5.5rem] font-bold leading-none text-white/[0.06] transition-colors duration-500 group-hover:text-cyan-300/10"
                aria-hidden
              >
                {String(a + 1).padStart(2, "0")}
              </span>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-300">
                {String(a + 1).padStart(2, "0")}
                {" — "}
                {i.name}
              </p>
              <h3 className="font-serif-d text-3xl font-semibold leading-tight text-white sm:text-4xl">
                {i.headline}
              </h3>
              <p className="text-[15px] leading-relaxed text-sky-100/75">
                {i.description}
              </p>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {i.details.map((p, y) => (
                  <motion.li
                    key={p}
                    initial={{
                      opacity: 0,
                      x: -14,
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      delay: 0.15 + y * 0.08,
                      duration: 0.5,
                      ease: EASE,
                    }}
                    className="flex items-start gap-2 text-[13.5px] font-medium text-sky-50/90"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,.9)]" />
                    {p}
                  </motion.li>
                ))}
              </ul>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <a
                  href="#quote"
                  className="shine-sweep group/btn inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-black text-[#04141f] transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_10px_30px_-8px_rgba(34,211,238,.8)]"
                >
                  {i.quote_label}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </a>
                <p className="max-w-[240px] text-[11.5px] leading-snug text-sky-200/60">
                  {i.price_note}
                </p>
              </div>
            </div>
          </div>
          <div
            className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 ring-1 ring-inset ring-cyan-300/40 transition-opacity duration-500 group-hover:opacity-100"
            aria-hidden
          />
        </Tilt>
      </Reveal>
    </div>
  );
}

function Services() {
  return (
    <section id="services" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="animate-drift absolute -left-40 top-1/4 h-[480px] w-[480px] rounded-full bg-sky-600/15 blur-[130px]" />
        <div
          className="animate-drift absolute -right-40 top-2/3 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-[140px]"
          style={{
            animationDelay: "-6s",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />
      </div>
      <Bubbles count={14} className="opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-14 max-w-3xl sm:mb-20">
          <Reveal>
            <p className="mb-4 flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.35em] text-cyan-300">
              <span className="h-px w-10 bg-cyan-300" />
              {" 01 / Cleaning services"}
            </p>
          </Reveal>
          <SplitWords
            text="The right clean for every part of your home."
            as="h2"
            className="font-serif-d block text-4xl font-semibold leading-[1.05] text-white sm:text-6xl"
          />
          <Reveal delay={0.25}>
            <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-sky-100/75">
              Different materials need different treatment. Choose a service to
              see what is included, how pricing works, and what to tell us when
              you request an estimate.
            </p>
          </Reveal>
        </div>
        <div className="space-y-8 lg:space-y-12">
          {services.map((a, i) => (
            <ServiceRow key={services[i].slug} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export { SERVICE_ICONS, ServiceVisual, ServiceRow, Services };
