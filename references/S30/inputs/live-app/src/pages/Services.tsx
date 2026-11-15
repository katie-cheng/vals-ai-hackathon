import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { CountUp, Reveal, SectionTag, SplitText, Stagger, StaggerItem } from "../components/motion";
import { caseStudies, services } from "../data/content";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { CTASection } from "../components/shared";

export function Services() {
  const s = useRef(null),
    { scrollYProgress: n } = useScroll({
      target: s,
      offset: ["start start", "end start"],
    }),
    l = useTransform(n, [0, 1], ["0%", "30%"]),
    r = useTransform(n, [0, 0.8], [1, 0]);
  return (
    <>
      <section ref={s} className="relative overflow-hidden pt-36 pb-14 sm:pt-44">
        <div className="dot-grid-dark pointer-events-none absolute inset-0 opacity-60" />
        <div className="absolute -top-32 left-1/3 h-80 w-80 rounded-full bg-mint-200/50 blur-[110px]" />
        <motion.div
          style={{
            y: l,
            opacity: r,
          }}
          className="container-x relative"
        >
          <SectionTag>Services</SectionTag>
          <SplitText text="Six practices. One growth team." as="h1" className="display-lg mt-6 max-w-4xl" />
          <Reveal delay={0.25}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-500 sm:text-lg">
              Every engagement blends the practices your funnel actually needs — staffed senior-only, run in
              weekly sprints, measured in revenue.
            </p>
          </Reveal>
        </motion.div>
      </section>
      <section className="container-x pb-24">
        <Stagger className="flex flex-col gap-5" gap={0.08}>
          {services.map((d, f) => (
            <StaggerItem key={d.slug}>
              <Link
                to={`/services/${d.slug}`}
                className="group grid overflow-hidden rounded-[1.75rem] border border-ink-900/10 bg-white/70 transition-all duration-500 hover:-translate-y-1 hover:border-pine-700/30 hover:shadow-[0_30px_70px_-28px_rgba(29,74,47,0.4)] lg:grid-cols-[1fr_1.1fr]"
              >
                <div className="zoom-img relative min-h-60 overflow-hidden lg:min-h-72">
                  <img
                    src={d.image}
                    alt={d.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute top-5 left-5 rounded-full bg-ink-950/60 px-4 py-1.5 text-[11px] font-extrabold tracking-[0.14em] text-cream-50 uppercase backdrop-blur-md">
                    0{f + 1}
                  </span>
                </div>
                <div className="flex flex-col justify-center p-7 sm:p-10">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-pine-700/10 text-pine-700 transition-all duration-500 group-hover:bg-pine-700 group-hover:text-cream-50">
                      <d.icon className="h-5 w-5" />
                    </span>
                    <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{d.name}</h2>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed font-semibold text-pine-800">{d.tagline}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">{d.description[0]}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {d.deliverables.slice(0, 3).map((h) => (
                      <span
                        key={h}
                        className="rounded-full bg-cream-100 px-3.5 py-1.5 text-xs font-bold text-ink-700"
                      >
                        {h}
                      </span>
                    ))}
                    <span className="rounded-full bg-cream-100 px-3.5 py-1.5 text-xs font-bold text-pine-700">
                      +{d.deliverables.length - 3}
                      {" more"}
                    </span>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-ink-900">
                    Explore service
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-900 text-cream-50 transition-all duration-300 group-hover:bg-pine-600">
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <CTASection
        title="Not sure which practice you need?"
        copy="That's what the free growth call is for. We'll diagnose your funnel live and tell you exactly where to start — even if the answer is 'not us, yet'."
      />
    </>
  );
}
export function ServiceDetail() {
  const { slug: s } = useParams(),
    n = services.find((x) => x.slug === s),
    l = useRef(null),
    { scrollYProgress: r } = useScroll({
      target: l,
      offset: ["start start", "end start"],
    }),
    d = useTransform(r, [0, 1], ["0%", "25%"]);
  if (!n) return <Navigate to="/services" replace={!0} />;
  const f = services.findIndex((x) => x.slug === s),
    h = services[(f + 1) % services.length],
    m = caseStudies.filter((x) => x.services.includes(n.name)).slice(0, 2),
    g = (m.length ? m : caseStudies.slice(0, 2)).slice(0, 2);
  return (
    <>
      <section
        ref={l}
        className="relative overflow-hidden bg-pine-950 pt-32 pb-16 text-cream-50 sm:pt-40 sm:pb-20"
      >
        <motion.div
          style={{
            y: d,
          }}
          className="absolute inset-0"
        >
          <img src={n.image} alt="" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-pine-950/60 via-pine-950/80 to-pine-950" />
        </motion.div>
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="container-x relative">
          <Reveal y={16}>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-[13px] font-extrabold text-cream-50/60 transition-colors hover:text-cream-50"
            >
              <ArrowLeft className="h-4 w-4" />
              {" All services"}
            </Link>
          </Reveal>
          <div className="mt-8 flex items-center gap-4">
            <Reveal y={16}>
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-mint-300 text-pine-950">
                <n.icon className="h-7 w-7" />
              </span>
            </Reveal>
            <Reveal y={16} delay={0.05}>
              <p className="text-xs font-extrabold tracking-[0.2em] text-mint-300 uppercase">
                Service 0{f + 1}
                {" / 06"}
              </p>
            </Reveal>
          </div>
          <SplitText text={n.name} as="h1" className="display-lg mt-4 max-w-4xl" delay={0.1} />
          <Reveal delay={0.25}>
            <p className="mt-5 max-w-2xl text-base leading-relaxed font-medium text-cream-50/70 sm:text-lg">
              {n.tagline}
            </p>
          </Reveal>
          <Reveal delay={0.35}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-cream-50 px-7 py-3.5 text-sm font-extrabold text-pine-950 transition-colors hover:bg-mint-300"
              >
                {"Start this engagement "}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-cream-50/25 px-7 py-3.5 text-sm font-extrabold transition-colors hover:border-cream-50/60"
              >
                See pricing
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="border-b border-ink-900/8 bg-cream-50">
        <div className="container-x grid gap-8 py-12 sm:grid-cols-3">
          {n.outcomes.map((x, y) => (
            <Reveal key={x.label} delay={y * 0.08} className="text-center sm:text-left">
              <p className="text-4xl font-extrabold tracking-tight text-pine-800 tabular-nums sm:text-5xl">
                <CountUp
                  value={x.value}
                  decimals={x.decimals ?? 0}
                  prefix={x.prefix ?? ""}
                  suffix={x.suffix ?? ""}
                />
              </p>
              <p className="mx-auto mt-2 max-w-56 text-[13px] leading-snug font-semibold text-ink-500 sm:mx-0">
                {x.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="container-x section-pad">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <SectionTag>The engagement</SectionTag>
            <SplitText text="What this actually looks like." as="h2" className="display-md mt-5" />
            {n.description.map((x, y) => (
              <Reveal key={y} delay={0.1 + y * 0.08}>
                <p className="mt-5 text-[15px] leading-relaxed text-ink-500 sm:text-base">{x}</p>
              </Reveal>
            ))}
            <div className="mt-10">
              <h3 className="text-sm font-extrabold tracking-[0.18em] text-ink-400 uppercase">
                How we run it
              </h3>
              <Stagger className="mt-5 grid gap-3 sm:grid-cols-2" gap={0.08}>
                {n.process.map((x, y) => (
                  <StaggerItem key={x.title}>
                    <div className="h-full rounded-2xl border border-ink-900/10 bg-white/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-pine-700/30">
                      <span className="text-xs font-extrabold text-pine-600">
                        {"STEP "}
                        {y + 1}
                      </span>
                      <h4 className="mt-1 text-lg font-extrabold">{x.title}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-ink-500">{x.desc}</p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal delay={0.15}>
              <div className="rounded-[1.75rem] bg-ink-900 p-7 text-cream-50 sm:p-9">
                <h3 className="text-lg font-extrabold">What's included</h3>
                <ul className="mt-5 flex flex-col gap-3">
                  {n.deliverables.map((x) => (
                    <li key={x} className="flex items-start gap-3 text-sm font-semibold text-cream-50/85">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint-300/20 text-mint-300">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {x}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className="mt-7 flex items-center justify-center gap-2 rounded-full bg-cream-50 py-3.5 text-sm font-extrabold text-ink-900 transition-colors hover:bg-mint-300"
                >
                  {"Book a scoping call "}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <p className="mt-4 text-center text-xs font-semibold text-cream-50/40">
                  Fixed scope · Fixed price · No surprises
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      <section className="container-x pb-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <SectionTag>Proof</SectionTag>
            <SplitText text="This practice, in the wild." as="h2" className="display-md mt-4" />
          </div>
          <Reveal delay={0.1} className="hidden sm:block">
            <Link
              to="/work"
              className="group inline-flex items-center gap-2 text-sm font-extrabold text-pine-700"
            >
              {"All case studies "}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </div>
        <Stagger className="mt-10 grid gap-5 md:grid-cols-2" gap={0.1}>
          {g.map((x) => (
            <StaggerItem key={x.slug}>
              <Link
                to={`/work/${x.slug}`}
                className="zoom-img group block overflow-hidden rounded-3xl bg-white shadow-[0_10px_40px_-20px_rgba(14,16,14,0.25)] transition-all duration-500 hover:-translate-y-1.5"
              >
                <div className="relative h-60 overflow-hidden">
                  <img src={x.image} alt={x.client} className="h-full w-full object-cover" loading="lazy" />
                  <span className="absolute top-4 left-4 rounded-full bg-ink-950/60 px-3.5 py-1.5 text-[11px] font-extrabold tracking-[0.12em] text-cream-50 uppercase backdrop-blur-md">
                    {x.client}
                  </span>
                </div>
                <div className="p-6 sm:p-7">
                  <h3 className="text-lg leading-snug font-extrabold transition-colors group-hover:text-pine-700">
                    {x.title}
                  </h3>
                  <div className="mt-4 flex gap-6 border-t border-ink-900/10 pt-4">
                    {x.metrics.slice(0, 2).map((y) => (
                      <div key={y.label}>
                        <p className="text-xl font-extrabold tabular-nums">
                          <CountUp
                            value={y.value}
                            decimals={y.decimals ?? 0}
                            prefix={y.prefix ?? ""}
                            suffix={y.suffix ?? ""}
                          />
                        </p>
                        <p className="text-[11px] font-semibold text-ink-500">{y.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <section className="container-x pb-24">
        <Reveal>
          <Link
            to={`/services/${h.slug}`}
            className="group relative flex items-center justify-between gap-6 overflow-hidden rounded-[2rem] bg-pine-800 p-8 text-cream-50 sm:p-12"
          >
            <div className="dot-grid absolute inset-0 opacity-60" />
            <img
              src={h.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-25"
            />
            <div className="relative">
              <p className="text-xs font-extrabold tracking-[0.2em] text-mint-300 uppercase">Next service</p>
              <p className="display-md mt-2">{h.name}</p>
            </div>
            <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-cream-50 text-ink-900 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-8deg]">
              <ArrowRight className="h-6 w-6" />
            </span>
          </Link>
        </Reveal>
      </section>
      <CTASection />
    </>
  );
}
