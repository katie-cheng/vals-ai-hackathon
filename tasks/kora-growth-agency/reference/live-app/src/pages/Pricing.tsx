import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { EASE, Reveal, SectionTag, SplitText, Stagger, StaggerItem } from "../components/motion";
import { faqs, plans } from "../data/content";
import { ArrowRight, ArrowUpRight, Check, Plus, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { CTASection } from "../components/shared";

const guarantees = [
  "3× opportunity guarantee on every Sprint",
  "Month-to-month after 90 days",
  "Pause or cancel with 30 days notice",
  "You own every asset, dashboard & playbook",
];
export function Pricing() {
  const [s, n] = useState(!0),
    [l, r] = useState(1),
    d = useRef(null),
    { scrollYProgress: f } = useScroll({
      target: d,
      offset: ["start start", "end start"],
    }),
    h = useTransform(f, [0, 1], ["0%", "30%"]),
    m = useTransform(f, [0, 0.8], [1, 0]);
  return (
    <>
      <section ref={d} className="relative overflow-hidden pt-36 pb-10 sm:pt-44">
        <div className="dot-grid-dark pointer-events-none absolute inset-0 opacity-60" />
        <div className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-mint-200/50 blur-[110px]" />
        <motion.div
          style={{
            y: h,
            opacity: m,
          }}
          className="container-x relative text-center"
        >
          <div className="flex justify-center">
            <SectionTag>Pricing</SectionTag>
          </div>
          <SplitText
            text="Priced like an investment."
            as="h1"
            className="display-lg mx-auto mt-6 max-w-4xl"
          />
          <SplitText
            text="Because that's what it is."
            as="h1"
            className="display-lg serif-accent mx-auto max-w-4xl text-pine-700"
            delay={0.12}
          />
          <Reveal delay={0.25}>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-500 sm:text-lg">
              Transparent tiers, no hourly billing, no surprise invoices. Pick the intensity that matches your
              ambition.
            </p>
          </Reveal>
          <Reveal delay={0.35}>
            <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-ink-900/12 bg-white/70 p-1.5">
              {["Monthly", "Quarterly −15%"].map((g, x) => {
                const y = x === 1,
                  v = s === y;
                return (
                  <button
                    key={g}
                    onClick={() => n(y)}
                    className={`relative rounded-full px-6 py-2.5 text-[13px] font-extrabold transition-colors ${v ? "text-cream-50" : "text-ink-500"}`}
                  >
                    {v && (
                      <motion.span
                        layoutId="billing-pill-page"
                        className="absolute inset-0 rounded-full bg-ink-900"
                        transition={{
                          duration: 0.45,
                          ease: EASE,
                        }}
                      />
                    )}
                    <span className="relative">{g}</span>
                  </button>
                );
              })}
            </div>
          </Reveal>
        </motion.div>
      </section>
      <section className="container-x pb-20">
        <Stagger className="grid items-stretch gap-5 lg:grid-cols-3" gap={0.12}>
          {plans.map((g) => (
            <StaggerItem key={g.name} className="h-full">
              <div
                className={`relative flex h-full flex-col rounded-[1.75rem] p-7 transition-all duration-500 hover:-translate-y-2 sm:p-9 ${g.featured ? "bg-ink-900 text-cream-50 shadow-[0_30px_80px_-24px_rgba(14,16,14,0.5)] lg:scale-[1.04]" : "border border-ink-900/10 bg-white/80 hover:shadow-[0_30px_70px_-28px_rgba(14,16,14,0.35)]"}`}
              >
                {g.badge && (
                  <span
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-[11px] font-extrabold tracking-[0.12em] whitespace-nowrap uppercase ${g.featured ? "bg-pine-600 text-cream-50" : "bg-cream-100 text-pine-800"}`}
                  >
                    {g.badge}
                  </span>
                )}
                <h2 className="text-xl font-extrabold">{g.name}</h2>
                <p
                  className={`mt-2 min-h-12 text-sm leading-relaxed ${g.featured ? "text-cream-50/60" : "text-ink-500"}`}
                >
                  {g.blurb}
                </p>
                <div className="mt-5 flex items-baseline gap-2">
                  {g.monthly ? (
                    <>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={s ? "y" : "m"}
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
                            y: -12,
                          }}
                          transition={{
                            duration: 0.35,
                            ease: EASE,
                          }}
                          className="text-5xl font-extrabold tracking-tight tabular-nums sm:text-6xl"
                        >
                          ${s ? Math.round(g.monthly * 0.85).toLocaleString() : g.monthly.toLocaleString()}
                        </motion.span>
                      </AnimatePresence>
                      <span
                        className={`text-sm font-bold ${g.featured ? "text-cream-50/50" : "text-ink-400"}`}
                      >
                        {g.unit}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-5xl font-extrabold tracking-tight tabular-nums sm:text-6xl">
                        ${g.oneTime?.toLocaleString()}
                      </span>
                      <span
                        className={`text-sm font-bold ${g.featured ? "text-cream-50/50" : "text-ink-400"}`}
                      >
                        {g.unit}
                      </span>
                    </>
                  )}
                </div>
                {g.monthly && s && (
                  <p className={`mt-1 text-xs font-bold ${g.featured ? "text-mint-300" : "text-pine-700"}`}>
                    Billed quarterly · save ${Math.round(g.monthly * 0.15 * 3).toLocaleString()}/quarter
                  </p>
                )}
                <ul className="mt-7 flex flex-col gap-3">
                  {g.benefits.map((x) => (
                    <li key={x} className="flex items-start gap-2.5 text-[13.5px] font-semibold">
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${g.featured ? "bg-mint-300/20 text-mint-300" : "bg-pine-700/10 text-pine-700"}`}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span className={g.featured ? "text-cream-50/80" : "text-ink-700"}>{x}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className={`group mt-8 inline-flex items-center justify-center gap-2 rounded-full py-4 text-sm font-extrabold transition-all duration-300 ${g.featured ? "bg-cream-50 text-ink-900 hover:bg-mint-300" : "border border-ink-900/15 text-ink-900 hover:border-ink-900 hover:bg-ink-900 hover:text-cream-50"}`}
                >
                  {g.cta}{" "}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-pine-700/20 bg-mint-100/60 p-7 sm:flex-row sm:justify-center sm:gap-8">
            <span className="flex items-center gap-2 text-sm font-extrabold text-pine-800">
              <ShieldCheck className="h-5 w-5" />
              {" The Kora guarantee"}
            </span>
            <div className="flex flex-wrap justify-center gap-x-7 gap-y-2">
              {guarantees.map((g) => (
                <span key={g} className="flex items-center gap-1.5 text-[13px] font-bold text-ink-700">
                  <Check className="h-4 w-4 text-pine-700" strokeWidth={3} /> {g}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
      <section className="container-x pb-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionTag>Kora vs. the alternatives</SectionTag>
            <SplitText text="Do the math with us." as="h2" className="display-md mt-4" />
            <Reveal delay={0.15}>
              <p className="mt-5 text-[15px] leading-relaxed text-ink-500">
                A senior growth hire costs $150k+ and takes six months to ramp — and they're still one person.
                Here's what the same budget buys at Kora.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <Link
                to="/contact"
                className="group mt-7 inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-extrabold text-cream-50 transition-colors hover:bg-pine-700"
              >
                {"Talk through the math "}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>
          <Stagger className="flex flex-col gap-3" gap={0.08}>
            {[
              {
                label: "Senior growth hire",
                cost: "$150k+/yr + equity",
                note: "One person · 6-month ramp · single skillset",
                dim: !0,
              },
              {
                label: "Traditional agency",
                cost: "$8–15k/mo",
                note: "Junior staff · hourly billing · reports, not revenue",
                dim: !0,
              },
              {
                label: "Kora Growth Partner",
                cost: "$5.5k/mo quarterly",
                note: "Strategist + specialists · shipping week one · revenue-measured",
                dim: !1,
              },
            ].map((g) => (
              <StaggerItem key={g.label}>
                <div
                  className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5 sm:p-7 ${g.dim ? "border-ink-900/10 bg-white/50" : "border-pine-700/40 bg-pine-800 text-cream-50 shadow-[0_20px_50px_-20px_rgba(22,54,38,0.5)]"}`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-lg font-extrabold">{g.label}</h3>
                    <p
                      className={`text-lg font-extrabold tabular-nums ${g.dim ? "text-ink-400" : "text-mint-300"}`}
                    >
                      {g.cost}
                    </p>
                  </div>
                  <p className={`mt-1 text-sm font-semibold ${g.dim ? "text-ink-400" : "text-cream-50/70"}`}>
                    {g.note}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
      <section id="faq" className="container-x pb-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <SectionTag>Pricing FAQ</SectionTag>
            <SplitText text="Fair questions, straight answers." as="h2" className="display-md mt-4" />
          </div>
          <Stagger className="mt-10 flex flex-col gap-3" gap={0.07}>
            {faqs.map((g, x) => {
              const y = l === x;
              return (
                <StaggerItem key={g.q} y={20}>
                  <div
                    className={`overflow-hidden rounded-2xl border transition-all duration-500 ${y ? "border-pine-700/30 bg-white shadow-[0_20px_50px_-24px_rgba(29,74,47,0.4)]" : "border-ink-900/10 bg-white/60 hover:border-ink-900/25"}`}
                  >
                    <button
                      onClick={() => r(y ? -1 : x)}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
                    >
                      <span className="text-[15px] font-extrabold sm:text-base">{g.q}</span>
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all duration-500 ${y ? "rotate-180 bg-pine-700 text-cream-50" : "bg-cream-100 text-ink-900"}`}
                      >
                        <Plus className="h-4 w-4" />
                      </span>
                    </button>
                    <AnimatePresence initial={!1}>
                      {y && (
                        <motion.div
                          initial={{
                            height: 0,
                            opacity: 0,
                          }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                          }}
                          transition={{
                            duration: 0.45,
                            ease: EASE,
                          }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-6 text-[14.5px] leading-relaxed text-ink-500 sm:px-6">
                            {g.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>
      <CTASection
        title="Still deciding? Let's talk it through."
        copy="Book a free call and we'll help you pick the right tier — or tell you honestly if you're not ready for one yet."
      />
    </>
  );
}
