import { insights } from "../data/content";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Reveal, SplitText, Stagger, StaggerItem } from "../components/motion";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import { CTASection } from "../components/shared";

const insightCategories = ["All", ...Array.from(new Set(insights.map((s) => s.category)))];
export function Insights() {
  const [s, n] = useState("All"),
    l = useRef(null),
    { scrollYProgress: r } = useScroll({
      target: l,
      offset: ["start start", "end start"],
    }),
    d = useTransform(r, [0, 1], ["0%", "30%"]),
    f = useTransform(r, [0, 0.8], [1, 0]),
    h = s === "All" ? insights : insights.filter((x) => x.category === s),
    [m, ...g] = h;
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
          <SplitText text="Thinking that ships revenue." as="h1" className="display-lg mt-6 max-w-4xl" />
          <Reveal delay={0.25}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-500 sm:text-lg">
              Playbooks, teardowns, and honest opinions from 120+ engagements. No fluff, every article ends
              with something you can ship.
            </p>
          </Reveal>
          <Reveal delay={0.35}>
            <div className="mt-8 flex flex-wrap gap-2">
              {insightCategories.map((x) => (
                <button
                  key={x}
                  onClick={() => n(x)}
                  className={`relative rounded-full px-5 py-2.5 text-[13px] font-extrabold transition-colors ${s === x ? "text-cream-50" : "border border-ink-900/12 bg-white/60 text-ink-500 hover:border-ink-900/30"}`}
                >
                  {s === x && (
                    <motion.span
                      layoutId="insight-filter"
                      className="absolute inset-0 rounded-full bg-ink-900"
                      transition={{
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  )}
                  <span className="relative">{x}</span>
                </button>
              ))}
            </div>
          </Reveal>
        </motion.div>
      </section>
      <section className="container-x pb-24">
        {m && (
          <Reveal>
            <Link
              to={`/insights/${m.slug}`}
              className="zoom-img group grid overflow-hidden rounded-[1.75rem] bg-ink-900 text-cream-50 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_70px_-24px_rgba(14,16,14,0.45)] lg:grid-cols-2"
            >
              <div className="relative min-h-72 overflow-hidden lg:min-h-[26rem]">
                <img src={m.image} alt={m.title} className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute top-5 left-5 rounded-full bg-cream-50 px-4 py-1.5 text-xs font-extrabold text-pine-900">
                  {"Featured: "}
                  {m.category}
                </span>
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-12">
                <p className="flex items-center gap-2 text-xs font-bold text-cream-50/50">
                  {m.date} <Clock className="h-3.5 w-3.5" /> {m.readTime}
                </p>
                <h2 className="mt-3 text-2xl leading-tight font-extrabold tracking-tight sm:text-4xl">
                  {m.title}
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-cream-50/65">{m.excerpt}</p>
                <div className="mt-6 flex items-center justify-between border-t border-cream-50/15 pt-6">
                  <div>
                    <p className="text-sm font-extrabold">{m.author.name}</p>
                    <p className="text-xs text-cream-50/50">{m.author.role}</p>
                  </div>
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-cream-50 text-ink-900 transition-transform duration-300 group-hover:scale-110">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        )}
        <motion.div layout={!0} className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {g.map((x) => (
            <motion.div
              key={x.slug}
              layout={!0}
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 24,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                to={`/insights/${x.slug}`}
                className="zoom-img group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_10px_40px_-20px_rgba(14,16,14,0.25)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-24px_rgba(14,16,14,0.35)]"
              >
                <div className="relative h-52 overflow-hidden">
                  <img src={x.image} alt={x.title} className="h-full w-full object-cover" loading="lazy" />
                  <span className="absolute top-4 left-4 rounded-full bg-cream-50/90 px-3.5 py-1.5 text-xs font-extrabold text-pine-800 backdrop-blur">
                    {x.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-bold text-ink-400">
                    {x.date}
                    {", "}
                    {x.readTime}
                  </p>
                  <h3 className="mt-2 text-lg leading-snug font-extrabold tracking-tight transition-colors group-hover:text-pine-700">
                    {x.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">{x.excerpt}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[13px] font-extrabold text-ink-900">
                    {"Read article "}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
      <CTASection
        title="Want this thinking applied to your funnel?"
      />
    </>
  );
}
export function InsightPost() {
  const { slug: s } = useParams(),
    n = insights.find((g) => g.slug === s),
    l = useRef(null),
    { scrollYProgress: r } = useScroll({
      target: l,
      offset: ["start start", "end start"],
    }),
    d = useTransform(r, [0, 1], ["0%", "20%"]);
  if (!n) return <Navigate to="/insights" replace={!0} />;
  const f = insights.findIndex((g) => g.slug === s),
    h = insights[(f + 1) % insights.length],
    m = insights.filter((g) => g.slug !== s).slice(0, 2);
  return (
    <>
      <section ref={l} className="relative overflow-hidden bg-pine-950 pt-32 pb-0 text-cream-50 sm:pt-40">
        <motion.div
          style={{
            y: d,
          }}
          className="absolute inset-0"
        >
          <img src={n.image} alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-pine-950/70 via-pine-950/85 to-pine-950" />
        </motion.div>
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="container-x relative max-w-4xl">
          <Reveal y={16}>
            <Link
              to="/insights"
              className="inline-flex items-center gap-2 text-[13px] font-extrabold text-cream-50/60 transition-colors hover:text-cream-50"
            >
              <ArrowLeft className="h-4 w-4" />
              {" All insights"}
            </Link>
          </Reveal>
          <Reveal y={16} delay={0.05}>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-mint-300 px-4 py-1.5 text-xs font-extrabold text-pine-950">
                {n.category}
              </span>
              <span className="rounded-full bg-cream-50/10 px-4 py-1.5 text-xs font-extrabold text-cream-50/70">
                {n.date}
              </span>
              <span className="rounded-full bg-cream-50/10 px-4 py-1.5 text-xs font-extrabold text-cream-50/70">
                {n.readTime}
              </span>
            </div>
          </Reveal>
          <SplitText text={n.title} as="h1" className="display-md mt-5" delay={0.1} />
          <Reveal delay={0.25}>
            <div className="mt-7 flex items-center gap-3 border-t border-cream-50/15 pt-6 pb-12">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-mint-300 text-sm font-extrabold text-pine-950">
                {n.author.name
                  .split(" ")
                  .map((g) => g[0])
                  .join("")}
              </span>
              <div>
                <p className="text-sm font-extrabold">{n.author.name}</p>
                <p className="text-xs text-cream-50/55">{n.author.role}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="container-x max-w-4xl pt-10">
        <Reveal>
          <div className="overflow-hidden rounded-[1.75rem]">
            <img src={n.image} alt={n.title} className="aspect-[16/8] w-full object-cover" />
          </div>
        </Reveal>
      </section>
      <article className="container-x max-w-3xl py-14">
        {n.body.map((g, x) =>
          g.type === "h2" ? (
            <Reveal key={x} delay={0.02}>
              <h2 className="mt-12 text-2xl font-extrabold tracking-tight sm:text-3xl">{g.text}</h2>
            </Reveal>
          ) : g.type === "quote" ? (
            <Reveal key={x} delay={0.02}>
              <blockquote className="my-10 rounded-3xl bg-pine-800 p-8 text-xl leading-snug font-bold text-cream-50 sm:p-10 sm:text-2xl">
                <span className="mb-3 block text-4xl text-mint-300">“</span>
                {g.text}
              </blockquote>
            </Reveal>
          ) : g.type === "list" ? (
            <Stagger key={x} className="my-8 flex flex-col gap-3" gap={0.06}>
              {g.items.map((y) => (
                <StaggerItem key={y} y={16}>
                  <li className="flex items-start gap-3 rounded-2xl border border-ink-900/10 bg-white/70 p-4 text-[15px] font-semibold text-ink-800">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-pine-700 text-xs font-extrabold text-cream-50">
                      ✓
                    </span>
                    {y}
                  </li>
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <Reveal key={x} delay={0.02}>
              <p
                className={`mt-6 text-[16px] leading-[1.8] text-ink-500 ${x === 0 ? "text-lg font-medium text-ink-800 sm:text-xl sm:leading-[1.7]" : ""}`}
              >
                {g.text}
              </p>
            </Reveal>
          ),
        )}
        <Reveal>
          <div className="mt-14 flex flex-col items-start justify-between gap-5 rounded-3xl border border-ink-900/10 bg-white/70 p-7 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-pine-700 text-sm font-extrabold text-cream-50">
                {n.author.name
                  .split(" ")
                  .map((g) => g[0])
                  .join("")}
              </span>
              <div>
                <p className="text-sm font-extrabold">
                  {"Written by "}
                  {n.author.name}
                </p>
                <p className="text-xs text-ink-500">{n.author.role}</p>
              </div>
            </div>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-[13px] font-extrabold text-cream-50 transition-colors hover:bg-pine-700"
            >
              {"Discuss this with us "}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </Reveal>
      </article>
      <section className="container-x pb-24">
        <div className="flex items-end justify-between">
          <SplitText text="Keep reading." as="h2" className="display-md" />
          <Reveal delay={0.1} className="hidden sm:block">
            <Link
              to="/insights"
              className="group inline-flex items-center gap-2 text-sm font-extrabold text-pine-700"
            >
              {"All articles "}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </div>
        <Stagger className="mt-8 grid gap-5 md:grid-cols-2" gap={0.1}>
          {[h, ...m].slice(0, 2).map((g) => (
            <StaggerItem key={g.slug}>
              <Link
                to={`/insights/${g.slug}`}
                className="zoom-img group grid overflow-hidden rounded-3xl bg-white shadow-[0_10px_40px_-20px_rgba(14,16,14,0.25)] transition-all duration-500 hover:-translate-y-1.5 sm:grid-cols-2"
              >
                <div className="relative h-48 overflow-hidden sm:h-full sm:min-h-56">
                  <img
                    src={g.image}
                    alt={g.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col justify-center p-6">
                  <p className="text-xs font-extrabold text-pine-700">
                    {g.category}
                  </p>
                  <h3 className="mt-2 leading-snug font-extrabold transition-colors group-hover:text-pine-700">
                    {g.title}
                  </h3>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-extrabold">
                    {"Read "}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <CTASection />
    </>
  );
}
