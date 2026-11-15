import * as React from "react";
import { prices, towns } from "../data/content";
import { EASE, Reveal, SplitWords, DUR } from "../lib/anim";
import { AnimatePresence, motion } from "framer-motion";

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
      fontWeight="600"
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
        className="bg-paper grain-light relative overflow-hidden py-24 text-[#04141f] sm:py-32"
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden>
        </div>
        <div className="relative mx-auto max-w-6xl px-6 sm:px-10 lg:px-24">
          <div className="mb-8 grid gap-10 grid-12 split-5-7 lg:items-end">
            <div>
              <SplitWords
                text="Clear prices for window work."
                as="h2"
                className="font-serif-d block text-[1.9rem] font-normal leading-tight sm:text-[2.6rem]"
              />
              <Reveal delay={0.2}>
                <p className="mt-4 text-[17px] leading-relaxed text-slate-600">
                  Individual window items have set prices.
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.15}>
              <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#04141f] p-6 sm:p-7">
                <h3 className="relative text-xl font-normal text-white">
                  Larger jobs need a look first.
                </h3>
                <p className="relative mt-2 text-[14px] leading-relaxed text-sky-100/75">
                  Gutter cleaning, house washing, driveways, sidewalks, and
                  patios are priced by the actual job. Size, stories, surface
                  condition, and access all affect the quote. Your estimate is
                  free, and the complete price is confirmed before work is
                  scheduled.
                </p>
              </div>
            </Reveal>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
            {prices.map((l, u) => (
              <Reveal key={l.id} delay={u * 0.07}>
                <motion.div
                  transition={{
                    duration: DUR.base,
                    ease: EASE,
                  }}
                  className="group relative h-full overflow-hidden rounded-lg bg-white p-6 ring-1 ring-slate-200/80 transition-shadow"
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1.5 origin-left scale-x-0 bg-cyan-400 transition-transform group-hover:scale-x-100"
                    aria-hidden
                  />
                  <p className="min-h-[2.75em] text-[12px] lg:min-h-[4.1em] xl:min-h-[2.75em] font-medium uppercase leading-snug tracking-[0.08em] text-slate-500">
                    {l.label}
                  </p>
                  <p className="mt-2 flex items-baseline gap-1.5 whitespace-nowrap text-4xl font-medium tracking-tight text-[#04141f]">
                    {l.display_price}
                    <span className="text-[13px] font-medium tracking-normal text-slate-400">
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
      <section id="areas" className="bg-tone-a grain relative overflow-hidden py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 sm:px-10 lg:px-24 grid-12 split-7-5 lg:items-center">
          <Reveal className="relative order-2 lg:order-1">
            <div className="relative">
              <div className="relative">
                <svg
                  viewBox="40 20 620 440"
                  className="w-full"
                  role="img"
                  aria-label="Representative Suds Squad service towns in Connecticut"
                >
                  <motion.path
                    d={CT_PATH}
                    fill="rgba(14,116,144,.25)"
                    stroke="rgba(125,211,252,.6)"
                    strokeWidth="2"
                    initial={{
                      pathLength: 0,
                      opacity: 0,
                    }}
                    animate={{
                      pathLength: 1,
                      opacity: 1,
                    }}
                    transition={{
                      duration: DUR.draw,
                      ease: EASE,
                    }}
                  />
                  <path
                    d="M380 70c-50 70 35 98-12 156s35 85-8 140M250 90c45 65-20 105 20 162s-8 95 20 130"
                    fill="none"
                    stroke="rgba(125,211,252,.35)"
                    strokeWidth="2"
                    strokeDasharray="5 8"
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
                              stroke="#74a3af"
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
                          fill={h ? "#74a3af" : "rgba(186,230,253,.75)"}
                          stroke="#04141f"
                          strokeWidth="2"
                          className="transition-all"
                          initial={{
                            scale: 0,
                            opacity: 0,
                          }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                          }}
                          viewport={{
                            once: true,
                          }}
                          transition={{
                            delay: 0.4 + u * 0.06,
                            duration: DUR.base,
                            ease: EASE,
                          }}
                        />
                        {h && <TownLabel town={l} />}
                      </g>
                    );
                  })}
                </svg>
                <div
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
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
              className="font-serif-d block text-[1.9rem] font-normal leading-tight text-white sm:text-[2.6rem]"
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
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {towns.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => i(l.name)}
                    className={`option w-full ${a === l.name ? "option-active" : ""}`}
                  >
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
                    duration: DUR.base,
                    ease: EASE,
                  }}
                  className="mt-4 flex items-center gap-2 text-[14px] font-medium text-cyan-200"
                > {r.name}
                  {", "}
                  {r.region}. Yes, we come to you.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  );
}

export { CT_PATH, PricingAreas };
