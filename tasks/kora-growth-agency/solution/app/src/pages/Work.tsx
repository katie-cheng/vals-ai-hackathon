import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { caseStudies } from "../data/content";
import { CountUp, Reveal, SplitText, Stagger, StaggerItem } from "../components/motion";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Quote } from "lucide-react";
import { CTASection } from "../components/shared";

const workFilters = ["All", "SaaS", "Fintech", "DTC", "B2B"];
export function Work() {
  const [s, n] = useState("All"),
    l = useRef(null),
    { scrollYProgress: r } = useScroll({
      target: l,
      offset: ["start start", "end start"],
    }),
    d = useTransform(r, [0, 1], ["0%", "30%"]),
    f = useTransform(r, [0, 0.8], [1, 0]),
    h = s === "All" ? caseStudies : caseStudies.filter((m) => m.industry === s);
  return (
    <>
      <section ref={l} className="relative overflow-hidden pt-36 pb-10 sm:pt-44">
        <div className="dot-grid-dark pointer-events-none absolute inset-0 opacity-60" />
        <motion.div
          style={{
            y: d,
            opacity: f,
          }}
          className="container-x relative"
        >
          <SplitText text="Work that moved the number." as="h1" className="display-lg mt-6 max-w-4xl" />
          <Reveal delay={0.25}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-500 sm:text-lg">
              Real clients, real constraints, real revenue. Every case study shows the starting point, the
              moves, and the receipts.
            </p>
          </Reveal>
          <Reveal delay={0.35}>
            <div className="mt-8 flex flex-wrap gap-2">
              {workFilters.map((m) => (
                <button
                  key={m}
                  onClick={() => n(m)}
                  className={`relative rounded-full px-5 py-2.5 text-[13px] font-bold transition-colors ${s === m ? "text-cream-50" : "border border-ink-900/12 bg-white/60 text-ink-500 hover:border-ink-900/30"}`}
                >
                  {s === m && (
                    <motion.span
                      layoutId="work-filter"
                      className="absolute inset-0 rounded-full bg-ink-900"
                      transition={{
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  )}
                  <span className="relative">{m}</span>
                </button>
              ))}
            </div>
          </Reveal>
        </motion.div>
      </section>
      <section className="container-x pb-24">
        <motion.div layout={!0} className="grid gap-5 md:grid-cols-2">
          {h.map((m, g) => (
            <motion.div
              key={m.slug}
              layout={!0}
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 30,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: g * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                to={`/work/${m.slug}`}
                className="zoom-img group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_10px_40px_-20px_rgba(14,16,14,0.25)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_-24px_rgba(14,16,14,0.35)]"
              >
                <div className="relative h-64 overflow-hidden sm:h-72">
                  <img src={m.image} alt={m.client} className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="absolute top-4 left-4 rounded-full bg-ink-950/60 px-3.5 py-1.5 text-xs font-bold text-cream-50 backdrop-blur-md">
                    {m.industry}
                  </span>
                  <span className="absolute right-4 bottom-4 grid h-12 w-12 translate-y-3 place-items-center rounded-full bg-cream-50 text-ink-900 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <p className="text-xs font-bold text-pine-600">
                    {m.client}
                    {", "}
                    {m.year}
                  </p>
                  <h2 className="mt-2 text-xl leading-snug font-bold tracking-tight sm:text-2xl">
                    {m.title}
                  </h2>
                  <div className="mt-5 grid grid-cols-3 gap-3 border-t border-ink-900/10 pt-5">
                    {m.metrics.map((x) => (
                      <div key={x.label}>
                        <p className="text-lg font-bold tabular-nums sm:text-xl">
                          <CountUp
                            value={x.value}
                            decimals={x.decimals ?? 0}
                            prefix={x.prefix ?? ""}
                            suffix={x.suffix ?? ""}
                          />
                        </p>
                        <p className="mt-0.5 text-[10.5px] leading-snug font-medium text-ink-500">
                          {x.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
      <CTASection
        title="Your story could be next."
      />
    </>
  );
}
export function CaseStudy() {
  const { slug: s } = useParams(),
    n = caseStudies.find((x) => x.slug === s),
    l = useRef(null),
    { scrollYProgress: r } = useScroll({
      target: l,
      offset: ["start start", "end start"],
    }),
    d = useTransform(r, [0, 1], [1, 1.15]),
    f = useTransform(r, [0, 1], ["0%", "15%"]),
    h = useTransform(r, [0, 1], ["0%", "-25%"]);
  if (!n) return <Navigate to="/work" replace={!0} />;
  const m = caseStudies.findIndex((x) => x.slug === s),
    g = caseStudies[(m + 1) % caseStudies.length];
  return (
    <>
      <section ref={l} className="relative flex min-h-[92svh] items-end overflow-hidden">
        <motion.div
          style={{
            scale: d,
            y: f,
          }}
          className="absolute inset-0"
        >
          <img src={n.image} alt={n.client} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/40 to-pine-950/95" />
        </motion.div>
        <motion.div
          style={{
            y: h,
          }}
          className="container-x relative z-10 pb-14 text-cream-50"
        >
          <Reveal y={16}>
            <Link
              to="/work"
              className="inline-flex items-center gap-2 text-[13px] font-bold text-cream-50/60 transition-colors hover:text-cream-50"
            >
              <ArrowLeft className="h-4 w-4" />
              {" All case studies"}
            </Link>
          </Reveal>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-cream-50/15 px-4 py-1.5 text-xs font-bold backdrop-blur-md">
              {n.industry}
            </span>
            <span className="rounded-full bg-cream-50/15 px-4 py-1.5 text-xs font-bold backdrop-blur-md">
              {n.year}
            </span>
            <span className="rounded-full bg-cream-50/15 px-4 py-1.5 text-xs font-bold backdrop-blur-md">
              {n.duration}
            </span>
          </div>
          <p className="mt-5 text-sm font-bold text-mint-300">{n.client}</p>
          <SplitText text={n.title} as="h1" className="display-lg mt-2 max-w-4xl" delay={0.1} />
          <Stagger
            className="mt-8 grid max-w-2xl grid-cols-3 gap-4 border-t border-cream-50/20 pt-7"
            gap={0.1}
          >
            {n.metrics.map((x) => (
              <StaggerItem key={x.label}>
                <p className="text-2xl font-bold tabular-nums sm:text-4xl">
                  <CountUp
                    value={x.value}
                    decimals={x.decimals ?? 0}
                    prefix={x.prefix ?? ""}
                    suffix={x.suffix ?? ""}
                  />
                </p>
                <p className="mt-1 text-[11px] leading-snug font-medium text-cream-50/60 sm:text-xs">
                  {x.label}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </motion.div>
        <div className="absolute inset-x-0 bottom-0 z-10">
          <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="h-8 w-full sm:h-10">
            <path d="M0 48h1440V24C1200 4 960 0 720 0S240 4 0 24v24z" fill="#faf8f2" />
          </svg>
        </div>
      </section>
      <section className="container-x section-pad !pb-12">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SplitText text="Where they started." as="h2" className="display-md mt-4" />
            <Reveal delay={0.15}>
              <div className="mt-6 flex flex-wrap gap-2">
                {n.services.map((x) => (
                  <span
                    key={x}
                    className="rounded-full border border-pine-700/25 bg-pine-700/5 px-4 py-2 text-sm font-medium text-pine-800"
                  >
                    {x}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
          <div>
            {n.challenge.map((x, y) => (
              <Reveal key={y} delay={y * 0.08}>
                <p
                  className={`text-[15px] leading-relaxed text-ink-500 sm:text-lg ${y > 0 ? "mt-5" : ""} ${y === 0 ? "text-xl font-medium text-ink-900 sm:text-2xl sm:leading-snug" : ""}`}
                >
                  {x}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="container-x pb-24">
        <SplitText
          text="Three moves that changed everything."
          as="h2"
          className="display-md mt-4 max-w-3xl"
        />
        <Stagger className="mt-10 grid gap-5 lg:grid-cols-3" gap={0.12}>
          {n.approach.map((x, y) => (
            <StaggerItem key={x.title} className="h-full">
              <div className="group h-full rounded-3xl bg-ink-900 p-7 text-cream-50 transition-all duration-500 hover:-translate-y-2 hover:bg-pine-800 sm:p-8">
                <span className="display-md text-mint-300/90">0{y + 1}</span>
                <h3 className="mt-4 text-xl font-bold">{x.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cream-50/65">{x.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <section
        className="bg-cream-100/70 py-24 sm:py-28"
        style={{
          borderRadius: "2.5rem",
        }}
      >
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SplitText text="Receipts, not adjectives." as="h2" className="display-md mt-4" />
            {n.results.map((x, y) => (
              <Reveal key={y} delay={0.1 + y * 0.08}>
                <p className="mt-5 text-[15px] leading-relaxed text-ink-500">{x}</p>
              </Reveal>
            ))}
            <Reveal delay={0.25}>
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-ink-900/10 pt-7">
                {n.metrics.map((x) => (
                  <div key={x.label}>
                    <p className="text-2xl font-bold text-pine-800 tabular-nums sm:text-3xl">
                      <CountUp
                        value={x.value}
                        decimals={x.decimals ?? 0}
                        prefix={x.prefix ?? ""}
                        suffix={x.suffix ?? ""}
                      />
                    </p>
                    <p className="mt-1 text-[11px] leading-snug font-medium text-ink-500">{x.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <figure className="relative overflow-hidden rounded-[2rem] bg-pine-800 p-8 text-cream-50 sm:p-12">
              <div className="dot-grid absolute inset-0 opacity-60" />
              <Quote className="relative h-10 w-10 text-mint-300" />
              <blockquote className="relative mt-5 text-xl leading-snug font-semibold sm:text-2xl">
                “{n.quote.text}”
              </blockquote>
              <figcaption className="relative mt-7 border-t border-cream-50/15 pt-6">
                <p className="font-bold">{n.quote.author}</p>
                <p className="mt-1 text-sm text-cream-50/60">{n.quote.role}</p>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>
      <section className="container-x py-24">
        <Reveal>
          <Link
            to={`/work/${g.slug}`}
            className="zoom-img group relative block overflow-hidden rounded-[2rem]"
          >
            <img src={g.image} alt={g.client} className="h-80 w-full object-cover sm:h-96" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-8 sm:p-12">
              <div>
                <p className="text-xs font-bold text-mint-300">
                  Next case study
                </p>
                <p className="display-md mt-2 max-w-xl text-cream-50">
                  {g.client}
                  {", "}
                  {g.industry}
                </p>
              </div>
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-cream-50 text-ink-900 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-8deg]">
                <ArrowRight className="h-6 w-6" />
              </span>
            </div>
          </Link>
        </Reveal>
      </section>
      <CTASection
        title="Want results like these?"
      />
    </>
  );
}
