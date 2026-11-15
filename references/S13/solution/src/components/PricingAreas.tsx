import * as React from "react";
import { prices, towns } from "../data/content";
import { EASE, Magnetic, Reveal, SplitWords } from "../lib/anim";
import { Bubbles } from "../lib/fx";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Droplets, MapPin } from "lucide-react";

const CT_PATH =
  "M104 62 568 48 612 91 598 154 620 195 594 235 577 276 537 307 494 307 469 341 433 348 407 382 373 390 348 419 308 423 276 451 234 440 203 410 173 402 168 373 168 404 126 435 67 428 75 373 94 327 85 271 102 222 91 166 103 119Z";

type Town = (typeof towns)[number];

function TownLabel({ town: t }: { town: Town }) {
  const near = towns
    .filter((o) => o.id !== t.id)
    .reduce((best, o) =>
      Math.hypot(o.map_x - t.map_x, o.map_y - t.map_y) <
      Math.hypot(best.map_x - t.map_x, best.map_y - t.map_y)
        ? o
        : best,
    );
  const left = near.map_x > t.map_x,
    up = near.map_y > t.map_y;
  return (
    <text
      x={t.map_x + (left ? -14 : 14)}
      y={t.map_y + (up ? -10 : 18)}
      textAnchor={left ? "end" : "start"}
      fill="#fff"
      fontSize="13"
      fontWeight="800"
      paintOrder="stroke"
      stroke="#04141f"
      strokeWidth="5"
      strokeLinejoin="round"
      pointerEvents="none"
    >
      {t.name}
    </text>
  );
}

function PricingAreas() {
  const [a, i] = React.useState("Connecticut"),
    r = towns.find((l) => l.name === a);
  return (
    <>
      <section
        id="pricing"
        className="relative overflow-hidden bg-[#f5fafd] py-24 text-[#04141f] sm:py-32"
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-end">
            <div>
              <SplitWords
                text="Clear prices for window work."
                as="h2"
                className="font-serif-d block text-[1.9rem] font-medium leading-tight sm:text-[2.6rem]"
              />
              <Reveal delay={0.2}>
                <p className="mt-4 text-[17px] leading-relaxed text-slate-600">
                  Individual window items have set prices. Gutters, siding, and
                  hard surfaces are quoted after we understand the size,
                  condition, and access at your property.
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.15}>
              <div className="glass-strong relative overflow-hidden !rounded-3xl p-6 sm:p-7">
                <Bubbles count={8} minSize={2} maxSize={10} />
                <h3 className="font-serif-d relative text-xl font-medium text-white">
                  Larger jobs need a look first.
                </h3>
                <p className="relative mt-2 text-[14px] leading-relaxed text-sky-100/75">
                  Gutter cleaning, house washing, driveways, sidewalks, and
                  patios are priced by the actual job. Size, stories, surface
                  condition, and access all affect the quote. Your estimate is
                  free, and the complete price is confirmed before work is
                  scheduled.
                </p>
                <Magnetic strength={0.2} className="relative mt-5 inline-block">
                  <a
                    href="#quote"
                    className="group inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 text-[13.5px] font-black text-[#04141f]"
                  >
                    {"Get my property quote "}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </Magnetic>
              </div>
            </Reveal>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {prices.map((l, u) => (
              <Reveal key={l.id} delay={u * 0.07}>
                <motion.div
                  whileHover={{
                    y: -8,
                    rotate: u % 2 ? 1 : -1,
                  }}
                  transition={{
                    duration: 0.35,
                    ease: EASE,
                  }}
                  className="group relative h-full overflow-hidden rounded-3xl bg-white p-6 shadow-[0_18px_50px_-20px_rgba(4,40,70,.35)] ring-1 ring-slate-200/80 transition-shadow duration-300"
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1.5 origin-left scale-x-0 bg-cyan-400 transition-transform duration-500 group-hover:scale-x-100"
                    aria-hidden
                  />
                  <Droplets className="h-5 w-5 text-sky-400 transition-transform duration-500 group-hover:rotate-[20deg] group-hover:scale-125" />
                  <p className="mt-4 text-[14px] font-bold text-slate-600">
                    {l.label}
                  </p>
                  <p className="mt-1 text-4xl font-black tracking-tight text-[#04141f]">
                    {l.display_price}
                    <span className="ml-1.5 align-middle text-[13px] font-bold text-slate-400">
                      {l.unit}
                    </span>
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                    {l.note}
                  </p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section id="areas" className="relative overflow-hidden py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
        </div>
        <Bubbles count={12} className="opacity-40" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative order-2 lg:order-1">
            <div className="glass relative overflow-hidden rounded-[2rem] p-4 sm:p-6">
              <div className="relative">
                <svg
                  viewBox="40 20 620 440"
                  className="w-full"
                  role="img"
                  aria-label="Representative Suds Squad service towns in Connecticut"
                >
                  <defs>
                    <radialGradient id="ctGlow" cx="50%" cy="45%" r="70%">
                      <stop offset="0%" stopColor="rgba(34,211,238,.35)" />
                      <stop offset="100%" stopColor="rgba(34,211,238,0)" />
                    </radialGradient>
                  </defs>
                  <rect
                    x="40"
                    y="20"
                    width="620"
                    height="440"
                    fill="url(#ctGlow)"
                  />
                  <motion.path
                    d={CT_PATH}
                    fill="rgba(14,116,144,.25)"
                    stroke="rgba(125,211,252,.6)"
                    strokeWidth="2"
                    initial={{
                      pathLength: 0,
                      opacity: 0,
                    }}
                    whileInView={{
                      pathLength: 1,
                      opacity: 1,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 2.2,
                      ease: EASE,
                    }}
                  />
                  <path
                    d="M380 70c-50 70 35 98-12 156s35 85-8 140M250 90c45 65-20 105 20 162s-8 95 20 130"
                    fill="none"
                    stroke="rgba(125,211,252,.35)"
                    strokeWidth="2"
                    strokeDasharray="5 8"
                    className="animate-flow-dash"
                  />
                  {towns.map((l, u) => {
                    const h = a === l.name;
                    return (
                      <g
                        key={l.id}
                        className="cursor-pointer"
                        onClick={() => i(l.name)}
                      >
                        {h && (
                          <>
                            <circle
                              cx={l.map_x}
                              cy={l.map_y}
                              r="16"
                              fill="none"
                              stroke="#22d3ee"
                              strokeWidth="2"
                            >
                              <animate
                                attributeName="r"
                                values="8;22"
                                dur="1.6s"
                                repeatCount="indefinite"
                              />
                              <animate
                                attributeName="opacity"
                                values=".9;0"
                                dur="1.6s"
                                repeatCount="indefinite"
                              />
                            </circle>
                            <circle
                              cx={l.map_x}
                              cy={l.map_y}
                              r="26"
                              fill="rgba(34,211,238,.15)"
                            />
                          </>
                        )}
                        <motion.circle
                          cx={l.map_x}
                          cy={l.map_y}
                          r={h ? 8 : 5}
                          fill={h ? "#22d3ee" : "rgba(186,230,253,.75)"}
                          stroke="#04141f"
                          strokeWidth="2"
                          className="transition-all duration-300"
                          initial={{
                            scale: 0,
                            opacity: 0,
                          }}
                          whileInView={{
                            scale: 1,
                            opacity: 1,
                          }}
                          viewport={{
                            once: true,
                          }}
                          transition={{
                            delay: 0.4 + u * 0.06,
                            duration: 0.4,
                            ease: EASE,
                          }}
                        />
                        {h && <TownLabel town={l} />}
                      </g>
                    );
                  })}
                </svg>
                <div
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.5rem]"
                  aria-hidden
                >
                </div>
              </div>
            </div>
          </Reveal>
          <div className="order-1 lg:order-2">
            <SplitWords
              text="One state. Plenty of dirty windows."
              as="h2"
              className="font-serif-d block text-[1.9rem] font-medium leading-tight text-white sm:text-[2.6rem]"
            />
            <Reveal delay={0.2}>
              <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-sky-100/75">
                We serve homes throughout Connecticut, from the Capitol Region
                to the shoreline and Fairfield County. If your property has a
                Connecticut ZIP code, send us the address.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="mb-3 mt-8 text-[14px] font-semibold text-sky-100/80">
                Representative service towns
              </p>
              <div className="flex flex-wrap gap-2">
                {towns.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => i(l.name)}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-bold transition-all duration-300 ${a === l.name ? "scale-105 bg-cyan-300 text-[#04141f]" : "border border-white/12 bg-white/5 text-sky-100/75 hover:border-cyan-300/50 hover:text-white"}`}
                  >
                    <MapPin className="h-3 w-3" />
                    {l.name}
                  </button>
                ))}
              </div>
            </Reveal>
            <AnimatePresence mode="wait">
              {r && (
                <motion.p
                  key={r.name}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,
                  }}
                  transition={{
                    duration: 0.35,
                    ease: EASE,
                  }}
                  className="mt-4 flex items-center gap-2 text-[14px] font-bold text-cyan-200"
                >
                  <Check className="h-4 w-4 text-cyan-300" /> {r.name}
                  {", "}
                  {r.region}. Yes, we come to you.
                </motion.p>
              )}
            </AnimatePresence>
            <Reveal delay={0.4}>
              <p className="mt-4 text-[13px] text-sky-200/60">
                Do not see your town? The map shows a selection only. Ask about
                any Connecticut address.
              </p>
              <Magnetic strength={0.2} className="mt-5 inline-block">
                <a
                  href="#quote"
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[13.5px] font-black text-[#04141f] transition-all duration-300 hover:bg-cyan-300"
                >
                  {"Ask about your property "}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Magnetic>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

export { CT_PATH, PricingAreas };
