import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import {
  CountUp,
  EASE,
  Magnetic,
  ParallaxImage,
  Reveal,
  SplitText,
  Stagger,
  StaggerItem,
} from "../components/motion";
import { ArrowRight, ArrowUpRight, Check, Minus, Pause, Play, Plus, Quote, Star } from "lucide-react";
import { Link } from "react-router-dom";
import {
  caseStudies,
  clientLogos,
  faqs,
  insights,
  plans,
  processSteps,
  services,
  stats,
  testimonials,
} from "../data/content";

function HomeHero() {
  const s = useRef(null),
    [n, l] = useState(!0),
    r = useRef(null),
    { scrollYProgress: d } = useScroll({
      target: s,
      offset: ["start start", "end start"],
    }),
    f = useTransform(d, [0, 1], ["0%", "18%"]),
    h = useTransform(d, [0, 1], [1, 1.12]),
    m = useTransform(d, [0, 1], ["0%", "-30%"]),
    g = useTransform(d, [0, 0.7], [1, 0]),
    x = () => {
      const y = r.current;
      y && (n ? y.pause() : y.play(), l(!n));
    };
  return (
    <section ref={s} className="relative flex min-h-[108svh] items-end justify-center overflow-hidden">
      <motion.div
        style={{
          y: f,
          scale: h,
        }}
        className="absolute inset-0"
      >
        <video
          ref={r}
          className="h-full w-full object-cover"
          src="/videos/hero.mp4"
          poster="/images/hero.jpg"
          autoPlay={!0}
          muted={!0}
          loop={!0}
          playsInline={!0}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/35 to-pine-950/90" />
        <div className="absolute inset-0 bg-pine-950/20" />
      </motion.div>
      <motion.button
        initial={{
          opacity: 0,
          scale: 0.6,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          delay: 1.6,
          duration: 0.6,
          ease: EASE,
        }}
        onClick={x}
        className="absolute top-24 right-5 z-10 grid h-11 w-11 place-items-center rounded-full border border-cream-50/30 bg-ink-950/30 text-cream-50 backdrop-blur-md transition-colors hover:bg-ink-950/60 sm:right-8"
        aria-label={n ? "Pause video" : "Play video"}
      >
        {n ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </motion.button>
      <motion.div
        style={{
          y: m,
          opacity: g,
        }}
        className="container-x relative z-10 pb-16 text-center sm:pb-20"
      >
        <h1
          className="display-xl mx-auto max-w-6xl text-cream-50 lg:!text-[6.25rem]"
          aria-label="We turn ambitious teams into revenue machines"
        >
          <SplitText text="We turn ambitious" as="span" className="block" delay={0.5} once={!1} />
          <SplitText text="teams into" as="span" className="block" delay={0.62} once={!1} />
          <span className="block">
            <SplitText text="revenue" as="span" delay={0.74} once={!1} />{" "}
            <SplitText
              text="machines."
              as="span"
              className="text-mint-300"
              delay={0.82}
              once={!1}
            />
          </span>
        </h1>
        <motion.p
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.9,
            delay: 1.05,
            ease: EASE,
          }}
          className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed font-medium text-cream-50/75 sm:text-base"
        >
          Kora is the growth consultancy behind 120+ breakouts, strategy, creative, and RevOps engineered to
          book calls and compound revenue.
        </motion.p>
        <motion.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.9,
            delay: 1.2,
            ease: EASE,
          }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Magnetic>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-cream-50 px-8 py-4 text-sm font-bold text-ink-900 transition-colors duration-300 hover:bg-mint-300"
            >
              Book your free growth call
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              to="/work"
              className="inline-flex items-center gap-2 rounded-full border border-cream-50/30 bg-cream-50/5 px-8 py-4 text-sm font-bold text-cream-50 backdrop-blur-md transition-colors duration-300 hover:border-cream-50/70"
            >
              {"See our results "}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Magnetic>
        </motion.div>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 1,
            delay: 1.5,
          }}
          className="mx-auto mt-10 flex max-w-lg items-center justify-center gap-5 text-cream-50/70"
        >
          <div className="flex -space-x-2.5">
            {["/images/team-1.jpg", "/images/team-2.jpg", "/images/team-3.jpg", "/images/team-4.jpg"].map(
              (y) => (
                <img
                  key={y}
                  src={y}
                  alt="Kora strategist"
                  className="h-9 w-9 rounded-full border-2 border-cream-50/60 object-cover"
                />
              ),
            )}
          </div>
          <div className="text-left">
            <div className="flex gap-0.5 text-gold-400">
              {Array.from({
                length: 5,
              }).map((y, v) => (
                <Star key={v} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <p className="mt-1 text-xs font-medium">Trusted by 120+ growth-stage teams</p>
          </div>
        </motion.div>
      </motion.div>
      <div className="absolute inset-x-0 bottom-0 z-10">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="h-8 w-full sm:h-12">
          <path d="M0 48h1440V24C1200 4 960 0 720 0S240 4 0 24v24z" fill="#faf8f2" />
        </svg>
      </div>
    </section>
  );
}
function HomeLogos() {
  return (
    <section className="border-b border-ink-900/8 py-10">
      <Reveal y={20}>
        <p className="text-center text-xs font-bold text-ink-500">
          Powering growth for category leaders
        </p>
      </Reveal>
      <div className="marquee-paused relative mt-7 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div
          className="marquee-track gap-14 pr-14"
          style={{
            animationDuration: "30s",
          }}
        >
          {[...clientLogos, ...clientLogos].map((s, n) => (
            <span
              key={n}
              className="flex shrink-0 items-center gap-3 text-xl font-bold tracking-tight whitespace-nowrap text-ink-900/35 transition-colors hover:text-ink-900"
            >
              <span className="h-2 w-2 rounded-full bg-pine-600/50" />
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
function HomeA8() {
  const s = useRef(null),
    { scrollYProgress: n } = useScroll({
      target: s,
      offset: ["start 0.85", "start 0.35"],
    }),
    l = [
      "Most agencies sell deliverables.",
      "We sell outcomes, pipeline, revenue, and growth you can measure in the boardroom.",
    ];
  return (
    <section ref={s} className="container-x section-pad max-w-4xl text-center">
      <div className="mt-6 text-3xl leading-[1.25] font-bold tracking-tight text-ink-900 sm:text-5xl sm:leading-[1.15]">
        {l.map((r, d) => (
          <p key={d} className={d === 1 ? "mt-2" : ""}>
            {r.split(" ").map((f, h, m) => {
              const g = l[0].split(" ").length + l[1].split(" ").length,
                x = d === 0 ? h : l[0].split(" ").length + h;
              return (
                <ScrollWord
                  key={h}
                  progress={n}
                  range={[x / g, (x + 1) / g]}
                  word={f}
                  last={h === m.length - 1}
                />
              );
            })}
          </p>
        ))}
      </div>
      <Reveal delay={0.1}>
        <Link
          to="/about"
          className="group mt-8 inline-flex items-center gap-2 text-sm font-bold text-pine-700"
        >
          More about our story
          <span className="grid h-8 w-8 place-items-center rounded-full bg-pine-700 text-cream-50 transition-transform duration-300 group-hover:translate-x-1">
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </Reveal>
    </section>
  );
}
function ScrollWord({ progress: s, range: n, word: l, last: r }) {
  const d = useTransform(s, n, [0.14, 1]);
  return (
    <motion.span
      style={{
        opacity: d,
      }}
      className="inline-block"
    >
      {l}
      {r ? "" : " "}
    </motion.span>
  );
}
function HomeN8() {
  const [s, n] = useState(0);
  return (
    <section
      className="bg-ink-900 py-24 text-cream-50 sm:py-32"
      style={{
        borderRadius: "2.5rem 2.5rem 0 0",
      }}
    >
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <SplitText text="Everything growth needs." as="h2" className="display-md mt-5 max-w-xl" />
            <SplitText
              text="Nothing it doesn't."
              as="h2"
              className="display-md max-w-xl text-mint-300"
              delay={0.12}
            />
          </div>
          <Reveal delay={0.15}>
            <p className="max-w-sm text-[15px] leading-relaxed text-cream-50/60">
              Six practices, one team, zero handoff hell. Hover to explore, every engagement blends the
              practices your funnel actually needs.
            </p>
          </Reveal>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Stagger
            className="flex flex-col divide-y divide-cream-50/10 border-y border-cream-50/10"
            gap={0.06}
          >
            {services.map((l, r) => {
              const d = s === r;
              return (
                <StaggerItem key={l.slug} y={20}>
                  <button
                    onMouseEnter={() => n(r)}
                    onClick={() => n(r)}
                    className="group flex w-full items-center gap-5 py-5 text-left"
                  >
                    <span
                      className={`text-xs font-bold tabular-nums transition-colors ${d ? "text-mint-300" : "text-cream-50/30"}`}
                    >
                      0{r + 1}
                    </span>
                    <span className="flex-1">
                      <span
                        className={`block text-xl font-bold tracking-tight transition-all duration-300 sm:text-2xl ${d ? "translate-x-1 text-cream-50" : "text-cream-50/55 group-hover:text-cream-50/85"}`}
                      >
                        {l.name}
                      </span>
                      <AnimatePresence initial={!1}>
                        {d && (
                          <motion.span
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
                            className="block overflow-hidden"
                          >
                            <span className="block pt-2 text-sm leading-relaxed text-cream-50/55">
                              {l.tagline}
                            </span>
                            <Link
                              to={`/services/${l.slug}`}
                              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-mint-300"
                              onClick={(f) => f.stopPropagation()}
                            >
                              {"Explore service "}
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-300 ${d ? "rotate-180 border-mint-300 bg-mint-300 text-pine-950" : "border-cream-50/20 text-cream-50/50"}`}
                    >
                      {d ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                </StaggerItem>
              );
            })}
          </Stagger>
          <Reveal delay={0.15} className="relative hidden lg:block">
            <div className="sticky top-28 overflow-hidden rounded-3xl">
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={services[s].slug}
                  src={services[s].image}
                  alt={services[s].name}
                  initial={{
                    opacity: 0,
                    scale: 1.08,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.7,
                    ease: EASE,
                  }}
                  className="aspect-[4/5] w-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
              <div className="absolute right-6 bottom-6 left-6 flex items-end justify-between">
                <div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={services[s].slug}
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
                        duration: 0.4,
                      }}
                      className="text-lg font-bold"
                    >
                      {services[s].name}
                    </motion.p>
                  </AnimatePresence>
                  <p className="text-xs font-medium text-cream-50/60">
                    0{s + 1}
                    {" / 06"}
                  </p>
                </div>
                <Link
                  to={`/services/${services[s].slug}`}
                  className="grid h-12 w-12 place-items-center rounded-full bg-cream-50 text-ink-900 transition-transform duration-300 hover:scale-110"
                  aria-label="View service"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
function HomeI8() {
  return (
    <section className="border-b border-ink-900/8 bg-cream-50">
      <div className="container-x grid grid-cols-2 gap-y-10 py-14 lg:grid-cols-4">
        {stats.map((s, n) => (
          <Reveal
            key={s.label}
            delay={n * 0.08}
            className={`text-center ${n > 0 ? "lg:border-l lg:border-ink-900/10" : ""}`}
          >
            <div className="text-4xl font-bold tracking-tight text-ink-900 tabular-nums sm:text-5xl">
              <CountUp
                value={s.value}
                decimals={s.decimals ?? 0}
                prefix={s.prefix ?? ""}
                suffix={s.suffix ?? ""}
              />
            </div>
            <p className="mx-auto mt-2 max-w-[12rem] text-[13px] leading-snug font-medium text-ink-500">
              {s.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
function HomeL8() {
  const s = useRef(null),
    { scrollYProgress: n } = useScroll({
      target: s,
    }),
    l = useTransform(n, [0.1, 0.9], [0, 1]);
  return (
    <section className="container-x section-pad">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SplitText text="A process built for momentum." as="h2" className="display-md mt-5" />
          <Reveal delay={0.15}>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-500">
              Four phases, one operating cadence. You'll always know what's shipping this week, what we
              learned last week, and what it earned.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <Link
              to="/contact"
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-bold text-cream-50 transition-colors hover:bg-pine-700"
            >
              Start with a diagnosis
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
        <div ref={s} className="relative">
          <div className="absolute top-2 bottom-2 left-[7px] w-[2px] rounded-full bg-ink-900/10" />
          <motion.div
            style={{
              scaleY: l,
            }}
            className="absolute top-2 bottom-2 left-[7px] w-[2px] origin-top rounded-full bg-pine-600"
          />
          <div className="flex flex-col gap-4">
            {processSteps.map((r, d) => (
              <Reveal key={r.n} delay={d * 0.05}>
                <div className="group relative ml-10 rounded-3xl border border-ink-900/10 bg-white/70 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-pine-600/40 hover:shadow-[0_24px_60px_-24px_rgba(29,74,47,0.35)] sm:p-8">
                  <span className="absolute top-8 -left-10 grid h-4 w-4 place-items-center">
                    <span className="h-3 w-3 rounded-full border-[3px] border-cream-50 bg-pine-600 ring-2 ring-pine-600/30" />
                  </span>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs font-bold tracking-[0.2em] text-pine-600">{r.n}</span>
                    <span className="text-4xl font-bold text-ink-900/8 transition-colors duration-500 group-hover:text-pine-600/20 sm:text-5xl">
                      {r.n}
                    </span>
                  </div>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{r.title}</h3>
                  <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-500">{r.desc}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {r.tags.map((f) => (
                      <span
                        key={f}
                        className="rounded-full bg-cream-100 px-3.5 py-1.5 text-xs font-semibold text-ink-700"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
function HomeCases() {
  const s = caseStudies.slice(0, 3);
  return (
    <section
      className="bg-cream-100/60 py-24 sm:py-32"
      style={{
        borderRadius: "2.5rem",
      }}
    >
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <SplitText text="Proof, not promises." as="h2" className="display-lg mt-5" />
          </div>
          <Reveal delay={0.15}>
            <Link
              to="/work"
              className="group inline-flex items-center gap-2 text-sm font-bold text-pine-700"
            >
              View all case studies
              <span className="grid h-9 w-9 place-items-center rounded-full border border-pine-700/30 transition-all duration-300 group-hover:bg-pine-700 group-hover:text-cream-50">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </Reveal>
        </div>
        <div className="mt-12 flex flex-col gap-6">
          {s.map((n, l) => (
            <Reveal key={n.slug} delay={l * 0.05}>
              <Link
                to={`/work/${n.slug}`}
                className="zoom-img group grid overflow-hidden rounded-[1.75rem] bg-white shadow-[0_10px_50px_-20px_rgba(14,16,14,0.25)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_-24px_rgba(14,16,14,0.35)] lg:grid-cols-2"
              >
                <div className="relative min-h-64 overflow-hidden lg:min-h-[22rem]">
                  <img
                    src={n.image}
                    alt={n.client}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute top-5 left-5 rounded-full bg-ink-950/60 px-4 py-1.5 text-xs font-bold text-cream-50 backdrop-blur-md">
                    {n.industry}
                  </span>
                </div>
                <div className="flex flex-col justify-center p-7 sm:p-10">
                  <p className="text-xs font-bold text-pine-600">
                    {n.client}
                  </p>
                  <h3 className="mt-3 text-2xl leading-tight font-bold tracking-tight sm:text-[2rem]">
                    {n.title}
                  </h3>
                  <div className="mt-6 grid grid-cols-3 gap-4 border-t border-ink-900/10 pt-6">
                    {n.metrics.map((r) => (
                      <div key={r.label}>
                        <div className="text-xl font-bold tracking-tight text-ink-900 tabular-nums sm:text-2xl">
                          <CountUp
                            value={r.value}
                            decimals={r.decimals ?? 0}
                            prefix={r.prefix ?? ""}
                            suffix={r.suffix ?? ""}
                          />
                        </div>
                        <p className="mt-1 text-[11px] leading-snug font-medium text-ink-500">{r.label}</p>
                      </div>
                    ))}
                  </div>
                  <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-ink-900">
                    Read case study
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-900 text-cream-50 transition-all duration-300 group-hover:bg-pine-600">
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
function HomeO8() {
  const [s, n] = useState(0),
    [l, r] = useState(1),
    d = (h) => {
      (r(h), n((m) => (m + h + testimonials.length) % testimonials.length));
    };
  useEffect(() => {
    const h = setInterval(() => d(1), 6500);
    return () => clearInterval(h);
  }, [s]);
  const f = testimonials[s];
  return (
    <section className="container-x section-pad">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <SplitText text="Teams that trusted the process." as="h2" className="display-md mt-5" />
          <Reveal delay={0.2}>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => d(-1)}
                className="grid h-12 w-12 place-items-center rounded-full border border-ink-900/15 text-xl transition-all hover:bg-ink-900 hover:text-cream-50"
                aria-label="Previous testimonial"
              >
                ←
              </button>
              <button
                onClick={() => d(1)}
                className="grid h-12 w-12 place-items-center rounded-full border border-ink-900/15 text-xl transition-all hover:bg-ink-900 hover:text-cream-50"
                aria-label="Next testimonial"
              >
                →
              </button>
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-6 flex gap-2">
              {testimonials.map((h, m) => (
                <button
                  key={m}
                  onClick={() => {
                    (r(m > s ? 1 : -1), n(m));
                  }}
                  aria-label={`Go to testimonial ${m + 1}`}
                  className={`h-2 rounded-full transition-all duration-500 ${m === s ? "w-10 bg-pine-700" : "w-2 bg-ink-900/15 hover:bg-ink-900/30"}`}
                />
              ))}
            </div>
          </Reveal>
        </div>
        <div className="relative min-h-[26rem] overflow-hidden rounded-[2rem] bg-pine-800 p-8 text-cream-50 sm:min-h-[24rem] sm:p-12">
          <div className="dot-grid absolute inset-0 opacity-60" />
          <Quote className="absolute top-8 right-8 h-16 w-16 text-cream-50/10" />
          <AnimatePresence mode="wait" custom={l}>
            <motion.figure
              key={s}
              custom={l}
              initial={{
                opacity: 0,
                x: 60 * l,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -60 * l,
              }}
              transition={{
                duration: 0.55,
                ease: EASE,
              }}
              className="relative flex h-full min-h-[20rem] flex-col justify-between gap-8 sm:min-h-[18rem]"
            >
              <blockquote className="text-xl leading-snug font-semibold sm:text-2xl">“{f.quote}”</blockquote>
              <figcaption className="flex items-end justify-between gap-6 border-t border-cream-50/15 pt-6">
                <div>
                  <p className="font-bold">{f.name}</p>
                  <p className="mt-1 text-sm text-cream-50/60">{f.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-mint-300 tabular-nums">{f.metric}</p>
                  <p className="mt-1 text-xs font-medium text-cream-50/60">{f.metricLabel}</p>
                </div>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
function HomeC8() {
  const [s, n] = useState(!0);
  return (
    <section className="container-x section-pad !pt-0">
      <div className="text-center">
        <SplitText
          text="Honest pricing, serious returns."
          as="h2"
          className="display-md mx-auto mt-5 max-w-3xl"
        />
        <Reveal delay={0.15}>
          <div className="mt-7 inline-flex items-center gap-1 rounded-full border border-ink-900/12 bg-white/70 p-1.5">
            {["Monthly", "Quarterly −15%"].map((l, r) => {
              const d = r === 1,
                f = s === d;
              return (
                <button
                  key={l}
                  onClick={() => n(d)}
                  className={`relative rounded-full px-5 py-2.5 text-[13px] font-bold transition-colors ${f ? "text-cream-50" : "text-ink-500"}`}
                >
                  {f && (
                    <motion.span
                      layoutId="billing-pill"
                      className="absolute inset-0 rounded-full bg-ink-900"
                      transition={{
                        duration: 0.45,
                        ease: EASE,
                      }}
                    />
                  )}
                  <span className="relative">{l}</span>
                </button>
              );
            })}
          </div>
        </Reveal>
      </div>
      <Stagger className="mt-12 grid gap-5 lg:grid-cols-3" gap={0.12}>
        {plans.map((l) => (
          <StaggerItem key={l.name} className="h-full">
            <div
              className={`relative flex h-full flex-col rounded-[1.75rem] p-7 transition-all duration-500 hover:-translate-y-2 sm:p-8 ${l.featured ? "bg-ink-900 text-cream-50 shadow-[0_30px_80px_-24px_rgba(14,16,14,0.5)]" : "border border-ink-900/10 bg-white/80 hover:shadow-[0_30px_70px_-28px_rgba(14,16,14,0.35)]"}`}
            >
              {l.featured && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-pine-600 px-4 py-1.5 text-xs font-bold whitespace-nowrap text-cream-50">
                  {l.badge}
                </span>
              )}
              <h3 className="text-xl font-bold">{l.name}</h3>
              <p
                className={`mt-2 min-h-12 text-sm leading-relaxed ${l.featured ? "text-cream-50/60" : "text-ink-500"}`}
              >
                {l.blurb}
              </p>
              <div className="mt-5 flex items-baseline gap-2">
                {l.monthly ? (
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
                        className="text-5xl font-bold tracking-tight tabular-nums"
                      >
                        ${s ? Math.round(l.monthly * 0.85).toLocaleString() : l.monthly.toLocaleString()}
                      </motion.span>
                    </AnimatePresence>
                    <span className={`text-sm font-semibold ${l.featured ? "text-cream-50/50" : "text-ink-400"}`}>
                      {l.unit}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-5xl font-bold tracking-tight tabular-nums">
                      ${l.oneTime?.toLocaleString()}
                    </span>
                    <span className={`text-sm font-semibold ${l.featured ? "text-cream-50/50" : "text-ink-400"}`}>
                      {l.unit}
                    </span>
                  </>
                )}
              </div>
              <ul className="mt-6 flex flex-col gap-2.5">
                {l.benefits.slice(0, 6).map((r) => (
                  <li key={r} className="flex items-start gap-2.5 text-[13.5px] font-medium">
                    <span
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${l.featured ? "bg-mint-300/20 text-mint-300" : "bg-pine-700/10 text-pine-700"}`}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className={l.featured ? "text-cream-50/80" : "text-ink-700"}>{r}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/pricing"
                className={`mt-7 inline-flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition-all duration-300 ${l.featured ? "bg-cream-50 text-ink-900 hover:bg-mint-300" : "border border-ink-900/15 text-ink-900 hover:border-ink-900 hover:bg-ink-900 hover:text-cream-50"}`}
              >
                {l.cta} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
function HomeU8() {
  const [s, n] = useState(0);
  return (
    <section className="container-x pb-24">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SplitText text="Questions? Good. We like those." as="h2" className="display-md mt-5" />
          <Reveal delay={0.15}>
            <p className="mt-5 text-[15px] leading-relaxed text-ink-500">
              Still curious? Bring your hardest question to a free growth call, we'll answer it live.
            </p>
          </Reveal>
        </div>
        <Stagger className="flex flex-col gap-3" gap={0.07}>
          {faqs.map((l, r) => {
            const d = s === r;
            return (
              <StaggerItem key={l.q} y={20}>
                <div
                  className={`overflow-hidden rounded-2xl border transition-all duration-500 ${d ? "border-pine-700/30 bg-white shadow-[0_20px_50px_-24px_rgba(29,74,47,0.4)]" : "border-ink-900/10 bg-white/60 hover:border-ink-900/25"}`}
                >
                  <button
                    onClick={() => n(d ? -1 : r)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
                  >
                    <span className="text-[15px] font-bold sm:text-base">{l.q}</span>
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all duration-500 ${d ? "rotate-180 bg-pine-700 text-cream-50" : "bg-cream-100 text-ink-900"}`}
                    >
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>
                  <AnimatePresence initial={!1}>
                    {d && (
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
                        <p className="px-5 pb-6 text-[14.5px] leading-relaxed text-ink-500 sm:px-6">{l.a}</p>
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
  );
}
function HomeD8() {
  return (
    <section className="container-x pb-24">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <SplitText text="Thinking that ships." as="h2" className="display-md mt-5" />
        </div>
        <Reveal delay={0.15}>
          <Link
            to="/insights"
            className="group inline-flex items-center gap-2 text-sm font-bold text-pine-700"
          >
            All articles
            <span className="grid h-9 w-9 place-items-center rounded-full border border-pine-700/30 transition-all duration-300 group-hover:bg-pine-700 group-hover:text-cream-50">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        </Reveal>
      </div>
      <Stagger className="mt-10 grid gap-5 md:grid-cols-3" gap={0.1}>
        {insights.slice(0, 3).map((s) => (
          <StaggerItem key={s.slug} className="h-full">
            <Link
              to={`/insights/${s.slug}`}
              className="zoom-img group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_10px_40px_-20px_rgba(14,16,14,0.25)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-24px_rgba(14,16,14,0.35)]"
            >
              <div className="relative h-52 overflow-hidden">
                <img src={s.image} alt={s.title} className="h-full w-full object-cover" loading="lazy" />
                <span className="absolute top-4 left-4 rounded-full bg-cream-50/90 px-3.5 py-1.5 text-xs font-bold text-pine-800 backdrop-blur">
                  {s.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs font-semibold text-ink-400">
                  {s.date}
                  {", "}
                  {s.readTime}
                </p>
                <h3 className="mt-2 text-lg leading-snug font-bold tracking-tight transition-colors group-hover:text-pine-700">
                  {s.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">{s.excerpt}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[13px] font-bold text-ink-900">
                  {"Read article "}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
function HomeMarquee() {
  const s = ["Book a call", "Grow revenue", "Fix your funnel", "Scale faster"];
  return (
    <Link to="/contact" className="group relative block overflow-hidden bg-pine-700 py-6">
      <div
        className="marquee-track gap-10"
        style={{
          animationDuration: "22s",
        }}
      >
        {[...s, ...s, ...s, ...s].map((n, l) => (
          <span
            key={l}
            className="flex shrink-0 items-center gap-10 text-3xl font-bold tracking-tight whitespace-nowrap text-cream-50 sm:text-4xl"
          >
            {n}
            <ArrowUpRight className="h-8 w-8 text-mint-300 transition-transform duration-300 group-hover:rotate-45" />
          </span>
        ))}
      </div>
    </Link>
  );
}
export function HomeC1() {
  const s = useRef(null),
    { scrollYProgress: n } = useScroll({
      target: s,
      offset: ["start end", "end start"],
    }),
    l = useTransform(n, [0, 1], [60, -60]),
    r = useTransform(n, [0, 1], [120, -120]);
  return (
    <>
      <HomeHero />
      <HomeLogos />
      <HomeA8 />
      <HomeN8 />
      <HomeI8 />
      <HomeL8 />
      <HomeCases />
      <HomeO8 />
      <section ref={s} className="container-x pb-24">
        <div className="relative overflow-hidden rounded-[2rem]">
          <ParallaxImage
            src="/images/about-team.jpg"
            alt="Kora team workshop"
            className="h-[26rem] sm:h-[32rem]"
            imgClassName="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink-950/70 via-transparent to-transparent p-8 sm:p-12">
            <div className="flex w-full flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <motion.div
                style={{
                  y: l,
                }}
              >
                <SplitText
                  text="Small team. Senior only."
                  as="h3"
                  className="display-md max-w-md text-cream-50"
                />
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream-50/70">
                  Partners on every account, specialists in every sprint. Meet the people behind the numbers.
                </p>
              </motion.div>
              <motion.div
                style={{
                  y: r,
                }}
                className="shrink-0"
              >
                <Link
                  to="/about"
                  className="group inline-flex items-center gap-2 rounded-full bg-cream-50 px-7 py-3.5 text-sm font-bold text-ink-900 transition-colors hover:bg-mint-300"
                >
                  {"Meet the team "}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      <HomeC8 />
      <HomeU8 />
      <HomeD8 />
      <HomeMarquee />
    </>
  );
}
