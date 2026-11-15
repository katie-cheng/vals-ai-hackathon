import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  CountUp,
  ParallaxImage,
  Reveal,
  SectionTag,
  SplitText,
  Stagger,
  StaggerItem,
} from "../components/motion";
import { stats, team, timeline, values } from "../data/content";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { CTASection } from "../components/shared";

function AboutChapter({ tag: s, title: n, copy: l }) {
  const r = useRef(null),
    { scrollYProgress: d } = useScroll({
      target: r,
      offset: ["start start", "end start"],
    }),
    f = useTransform(d, [0, 1], ["0%", "35%"]),
    h = useTransform(d, [0, 0.8], [1, 0]);
  return (
    <section ref={r} className="relative overflow-hidden pt-36 pb-16 sm:pt-44 sm:pb-20">
      <div className="dot-grid-dark pointer-events-none absolute inset-0 opacity-60" />
      <div className="absolute -top-40 right-[-10%] h-96 w-96 rounded-full bg-mint-200/50 blur-[120px]" />
      <div className="absolute top-20 left-[-10%] h-72 w-72 rounded-full bg-cream-200/70 blur-[100px]" />
      <motion.div
        style={{
          y: f,
          opacity: h,
        }}
        className="container-x relative"
      >
        <SectionTag>{s}</SectionTag>
        <SplitText text={n} as="h1" className="display-lg mt-6 max-w-4xl" />
        <Reveal delay={0.25}>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-500 sm:text-lg">{l}</p>
        </Reveal>
      </motion.div>
    </section>
  );
}
export function About() {
  const s = useRef(null),
    { scrollYProgress: n } = useScroll({
      target: s,
      offset: ["start end", "end start"],
    }),
    l = useTransform(n, [0, 1], ["-8%", "8%"]);
  return (
    <>
      <AboutChapter
        tag="About Kora"
        title="A consultancy built for the revenue-obsessed."
        copy="We started Kora because growth advice was broken: agencies sold hours, consultants sold decks, and nobody owned the number. So we built the firm we always wanted to hire."
      />
      <section className="container-x pb-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div ref={s} className="relative">
            <motion.div
              style={{
                y: l,
              }}
            >
              <ParallaxImage
                src="/images/about-office.jpg"
                alt="Inside the Kora studio"
                className="aspect-[4/5] sm:aspect-[5/5]"
              />
            </motion.div>
            <Reveal delay={0.3} className="absolute -right-3 -bottom-8 sm:-right-6">
              <div className="animate-float-soft rounded-3xl bg-ink-900 p-6 text-cream-50 shadow-2xl sm:p-8">
                <p className="text-4xl font-extrabold text-mint-300 tabular-nums sm:text-5xl">
                  <CountUp value={6} suffix="+" />
                </p>
                <p className="mt-1 text-xs font-bold text-cream-50/60">
                  years compounding
                  <br />
                  client growth
                </p>
              </div>
            </Reveal>
          </div>
          <div>
            <SectionTag>Our story</SectionTag>
            <SplitText text="Founded on a frustration." as="h2" className="display-md mt-5" />
            <Reveal delay={0.15}>
              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-500">
                <p>
                  In 2019, our founders sat on opposite sides of the same broken table — one in strategy
                  consulting, one in performance agencies. Both watched great advice die in handoffs: the
                  strategists never shipped, the agencies never thought.
                </p>
                <p>
                  {
                    "Kora fuses the two. Senior strategists who also run the sprints. Creative directors who read P&Ls. RevOps architects who sit in on positioning workshops. One team, one number: your revenue."
                  }
                </p>
                <p>
                  Six years and 120+ engagements later, the model hasn't changed — it's just gotten sharper.
                  And our clients' boards have noticed.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.25}>
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-ink-900/10 pt-8">
                {stats.slice(0, 3).map((r) => (
                  <div key={r.label}>
                    <p className="text-2xl font-extrabold tabular-nums sm:text-3xl">
                      <CountUp
                        value={r.value}
                        decimals={r.decimals ?? 0}
                        prefix={r.prefix ?? ""}
                        suffix={r.suffix ?? ""}
                      />
                    </p>
                    <p className="mt-1 text-[11px] leading-snug font-semibold text-ink-500">{r.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      <section
        className="bg-pine-950 py-24 text-cream-50 sm:py-32"
        style={{
          borderRadius: "2.5rem",
        }}
      >
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <SectionTag dark={!0}>What we believe</SectionTag>
            <SplitText text="Values that survive contact with revenue." as="h2" className="display-md mt-5" />
          </div>
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2" gap={0.1}>
            {values.map((r) => (
              <StaggerItem key={r.title}>
                <div className="group h-full rounded-3xl border border-cream-50/10 bg-cream-50/[0.04] p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-mint-300/40 hover:bg-cream-50/[0.07] sm:p-9">
                  <span className="grid h-13 w-13 place-items-center rounded-2xl bg-mint-300 p-3.5 text-pine-950 transition-transform duration-500 group-hover:rotate-[10deg] group-hover:scale-110">
                    <r.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold sm:text-2xl">{r.title}</h3>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-cream-50/60">{r.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
      <section className="container-x section-pad">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionTag>The journey</SectionTag>
            <SplitText text="Six years of compounding." as="h2" className="display-md mt-5" />
            <Reveal delay={0.15}>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-500">
                From two laptops to a 24-person senior team — every chapter taught us something we now install
                in our clients.
              </p>
            </Reveal>
          </div>
          <div className="flex flex-col">
            {timeline.map((r, d) => (
              <Reveal key={r.year} delay={d * 0.03}>
                <div className="group flex gap-6 border-b border-ink-900/10 py-7 transition-colors first:border-t hover:bg-white/50 sm:gap-10">
                  <span className="w-16 shrink-0 text-2xl font-extrabold text-pine-700 tabular-nums sm:text-3xl">
                    {r.year}
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold tracking-tight transition-transform duration-300 group-hover:translate-x-1 sm:text-xl">
                      {r.title}
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">{r.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="container-x pb-24">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <SectionTag>The partners</SectionTag>
            <SplitText text="Senior only. No exceptions." as="h2" className="display-md mt-5 max-w-xl" />
          </div>
          <Reveal delay={0.15}>
            <p className="max-w-sm text-[15px] leading-relaxed text-ink-500">
              The people who'll actually be in your Slack, on your calls, and in your board deck. Get to know
              them before we meet.
            </p>
          </Reveal>
        </div>
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" gap={0.1}>
          {team.map((r) => (
            <StaggerItem key={r.name} className="h-full">
              <div className="zoom-img group relative h-full overflow-hidden rounded-3xl bg-ink-900">
                <img
                  src={r.image}
                  alt={r.name}
                  className="h-105 w-full object-cover object-top"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-[11px] font-extrabold tracking-[0.18em] text-mint-300 uppercase">
                    {r.role}
                  </p>
                  <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-cream-50">{r.name}</h3>
                  <div className="grid grid-rows-[0fr] transition-all duration-500 group-hover:grid-rows-[1fr]">
                    <p className="overflow-hidden text-[13px] leading-relaxed text-cream-50/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <span className="block pt-2">{r.bio}</span>
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal delay={0.1}>
          <div className="mt-10 text-center">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-ink-900 px-7 py-3.5 text-sm font-extrabold text-cream-50 transition-colors hover:bg-pine-700"
            >
              Work with this team
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </Reveal>
      </section>
      <CTASection />
    </>
  );
}
