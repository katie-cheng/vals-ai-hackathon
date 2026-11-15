import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Minus, Pause, Play, Plus } from "lucide-react";
import { CountUp, DUR, EASE, Heading, Reveal, RevealImage, Stagger, StaggerItem } from "../components/motion";
import { Faq } from "../components/Faq";
import { Plans } from "../components/Plans";
import { CaseCard, CtaBanner, InsightCard } from "../components/shared";
import { caseStudies, clients, faqs, insights, processSteps, services, stats, testimonials } from "../data/content";

function Hero() {
  const video = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(!reduce);
  const toggle = () => {
    const v = video.current;
    if (!v) return;
    playing ? v.pause() : v.play();
    setPlaying(!playing);
  };
  return (
    <section className="relative flex min-h-[min(44rem,calc(100svh-4rem))] items-center overflow-hidden bg-ink-950">
      <video
        ref={video}
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/hero.mp4"
        poster="/images/hero.jpg"
        autoPlay={!reduce}
        muted={true}
        loop={true}
        playsInline={true}
        aria-hidden={true}
      />
      {/* Vignette so the type stays readable over the footage. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(14_16_14/0.55)_0%,rgb(14_16_14/0.88)_100%)]" />
      <div className="container-x relative py-20 text-center text-cream-50">
        <h1 className="display-xl mx-auto max-w-4xl">We turn ambitious teams into revenue machines.</h1>
        <p className="lede mx-auto mt-6 max-w-xl text-cream-50/80">
          Kora is the growth consultancy behind 120+ breakouts. Strategy, creative, and RevOps engineered to book calls and compound revenue.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/contact" className="btn btn-light">
            Book your free growth call
            <ArrowUpRight className="h-4 w-4" aria-hidden={true} />
          </Link>
          <Link to="/work" className="btn btn-ghost-light">
            See our results
          </Link>
        </div>
      </div>
      <button onClick={toggle} className="icon-btn icon-btn-light absolute right-6 bottom-6 md:right-10 lg:right-24" aria-label={playing ? "Pause video" : "Play video"}>
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
    </section>
  );
}

function ClientMarquee() {
  const row = (hidden: boolean) =>
    clients.map((c) => (
      <li key={c} aria-hidden={hidden || undefined} className="shrink-0 text-xl font-medium whitespace-nowrap text-ink-900/55">
        {c}
      </li>
    ));
  return (
    <section className="border-b border-ink-900/10 py-8" aria-label="Clients">
      <p className="container-x text-[15px] text-ink-500">Powering growth for category leaders</p>
      <div className="marquee-paused mt-5 overflow-hidden">
        <ul className="marquee-track gap-14 pr-14">
          {row(false)}
          {row(true)}
        </ul>
      </div>
    </section>
  );
}

function ScrollWord({ progress, range, word }: any) {
  const opacity = useTransform(progress, range, [0.25, 1]);
  return <motion.span style={{ opacity }}>{word} </motion.span>;
}

/** The statement brightens word by word as it is scrolled through (the reference's scroll transition). */
function WhyKora() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "start 0.35"] });
  const words = "Most agencies sell deliverables. We sell outcomes: pipeline, revenue, and growth you can measure in the boardroom.".split(" ");
  return (
    <section ref={ref} className="container-x section-pad">
      <div className="grid gap-8 lg:grid-cols-12">
        <h2 className="display-lg lg:col-span-9" aria-label={words.join(" ")}>
          {reduce ? words.join(" ") : words.map((w, i) => <ScrollWord key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} word={w} />)}
        </h2>
        <div className="lg:col-span-3 lg:self-end">
          <Link to="/about" className="text-link text-[15px]">
            More about our story
          </Link>
        </div>
      </div>
    </section>
  );
}

function ServicesShowcase() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  return (
    <section className="grain-surface bg-ink-900 text-cream-50">
      <div className="container-x section-pad">
        <div className="grid gap-x-8 gap-y-4 lg:grid-cols-12 lg:items-end">
          <Heading text="Everything growth needs. Nothing it doesn't." className="display-md lg:col-span-7" />
          <Reveal className="lg:col-span-5">
            <p className="text-[15px] leading-relaxed text-cream-50/70">Six practices, one team, zero handoff hell. Every engagement blends the practices your funnel actually needs.</p>
          </Reveal>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <ul className="border-t border-cream-50/15 lg:col-span-7">
            {services.map((s, i) => {
              const open = active === i;
              return (
                <li key={s.slug} className="border-b border-cream-50/15">
                  <h3>
                    <button onClick={() => setActive(i)} aria-expanded={open} aria-controls={`service-${s.slug}`} className="flex w-full items-center justify-between gap-5 py-4 text-left">
                      <span className={`display-sm transition-colors ${open ? "text-cream-50" : "text-cream-50/60 hover:text-cream-50"}`}>{s.name}</span>
                      {open ? <Minus className="h-4 w-4 shrink-0" aria-hidden={true} /> : <Plus className="h-4 w-4 shrink-0 text-cream-50/60" aria-hidden={true} />}
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={`service-${s.slug}`}
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduce ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-lg text-[15px] leading-relaxed text-cream-50/70">{s.tagline}</p>
                        <Link to={`/services/${s.slug}`} className="text-link text-link-light mt-3 mb-5 inline-block text-[15px]">
                          Explore {s.name}
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
          <div className="relative hidden aspect-[4/5] overflow-hidden rounded-lg bg-ink-800 lg:col-span-5 lg:block">
            <AnimatePresence initial={false}>
              <motion.img
                key={services[active].slug}
                src={services[active].image}
                alt={services[active].name}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DUR, ease: EASE }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBand() {
  return (
    <section className="border-b border-ink-900/10" aria-label="Results in numbers">
      <dl className="container-x grid grid-cols-2 gap-x-8 gap-y-8 py-12 lg:grid-cols-4">
        {stats.map((s) => (
          <Reveal key={s.label} className="flex flex-col-reverse justify-end border-t border-ink-900/15 pt-4">
            <dt className="mt-1 text-[15px] text-ink-500">{s.label}</dt>
            <dd className="figure text-[2.5rem] leading-none">
              <CountUp value={s.value} decimals={s.decimals ?? 0} prefix={s.prefix ?? ""} suffix={s.suffix ?? ""} />
            </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="container-x section-pad">
      <div className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Heading text="A process built for momentum." className="display-md" />
          <Reveal>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-500">
              Four phases, one operating cadence. You'll always know what's shipping this week, what we learned last week, and what it earned.
            </p>
          </Reveal>
        </div>
        <ol className="border-t border-ink-900/15 lg:col-span-7">
          {processSteps.map((p) => (
            <li key={p.n} className="border-b border-ink-900/15">
              <Reveal className="grid gap-x-8 gap-y-2 py-6 sm:grid-cols-7">
                <h3 className="display-sm sm:col-span-2">{p.title}</h3>
                <div className="sm:col-span-5">
                  <p className="text-[15px] leading-relaxed text-ink-700">{p.desc}</p>
                  <p className="mt-2 text-sm text-ink-500">{p.tags.join(", ")}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function SelectedWork() {
  const featured = caseStudies.slice(0, 3);
  return (
    <section className="bg-cream-100">
      <div className="container-x section-pad">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <Heading text="Proof, not promises." className="display-md" />
          <Link to="/work" className="text-link text-[15px]">
            View all case studies
          </Link>
        </div>
        <div className="mt-10 grid gap-x-8 gap-y-12 lg:grid-cols-3">
          {featured.map((c) => (
            <Reveal key={c.slug}>
              <CaseCard study={c} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const [index, setIndex] = useState(0);
  const step = (d: number) => setIndex((i) => (i + d + testimonials.length) % testimonials.length);
  return (
    <section className="container-x section-pad" aria-label="Client testimonials">
      <div className="flex items-end justify-between gap-8">
        <Heading text="Teams that trusted the process." className="display-md" />
        <div className="flex gap-2">
          <button onClick={() => step(-1)} className="icon-btn" aria-label="Previous testimonial">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button onClick={() => step(1)} className="icon-btn" aria-label="Next testimonial">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* Every quote sits in the same grid cell, so the tallest one sets the height and switching never moves the page. */}
      <div className="mt-10 grid border-t border-ink-900/15 pt-8" aria-live="polite">
        {testimonials.map((t, i) => (
          <figure
            key={t.name}
            aria-hidden={i !== index}
            className={`col-start-1 row-start-1 grid gap-x-8 gap-y-6 transition-opacity duration-300 lg:grid-cols-12 ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <blockquote className="display-sm lg:col-span-8">“{t.quote}”</blockquote>
            <figcaption className="text-[15px] lg:col-span-4">
              <p>{t.name}</p>
              <p className="text-ink-500">{t.role}</p>
              <p className="mt-4 text-ink-700">
                {t.metric} {t.metricLabel}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function TeamBand() {
  return (
    <section className="container-x pb-[clamp(4rem,7vw,6.5rem)]">
      <div className="grid gap-x-8 gap-y-6 lg:grid-cols-12 lg:items-end">
        <RevealImage src="/images/about-team.jpg" alt="Kora team in a workshop" className="aspect-[16/9] lg:col-span-8" />
        <div className="lg:col-span-4">
          <Heading text="Small team. Senior only." as="h2" className="display-md" />
          <p className="mt-3 text-[15px] leading-relaxed text-ink-500">Partners on every account, specialists in every sprint.</p>
          <Link to="/about" className="text-link mt-4 inline-block text-[15px]">
            Meet the team
          </Link>
        </div>
      </div>
    </section>
  );
}

function PricingPreview() {
  return (
    <section className="bg-cream-100">
      <div className="container-x section-pad">
        <Heading text="Honest pricing, serious returns." className="display-md mb-8" />
        <Plans to="/pricing" benefitLimit={6} />
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="container-x section-pad">
      <div className="grid gap-x-8 gap-y-8 lg:grid-cols-12">
        <Heading text="Questions? Good. We like those." className="display-md lg:col-span-5" />
        <div className="lg:col-span-7">
          <Faq items={faqs} />
        </div>
      </div>
    </section>
  );
}

function InsightsPreview() {
  return (
    <section className="container-x pb-[clamp(4rem,7vw,6.5rem)]">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <Heading text="Thinking that ships." className="display-md" />
        <Link to="/insights" className="text-link text-[15px]">
          All articles
        </Link>
      </div>
      <Stagger className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-3">
        {insights.slice(0, 3).map((a) => (
          <StaggerItem key={a.slug}>
            <InsightCard article={a} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

export function Home() {
  return (
    <>
      <Hero />
      <ClientMarquee />
      <WhyKora />
      <ServicesShowcase />
      <StatsBand />
      <ProcessSection />
      <SelectedWork />
      <Testimonials />
      <TeamBand />
      <PricingPreview />
      <FaqSection />
      <InsightsPreview />
      <CtaBanner />
    </>
  );
}
