import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CountUp, Heading, Reveal } from "../components/motion";
import { CaseCard, CtaBanner, NextLink, PageHero } from "../components/shared";
import { caseStudies } from "../data/content";

const INDUSTRIES = ["All", "SaaS", "Fintech", "DTC", "B2B"];

export function Work() {
  const [industry, setIndustry] = useState("All");
  const shown = industry === "All" ? caseStudies : caseStudies.filter((c) => c.industry === industry);
  return (
    <>
      <PageHero title="Work that moved the number." copy="Real clients, real constraints, real revenue. Every case study shows the starting point, the moves, and the receipts.">
        <div className="mt-8 inline-flex max-w-full flex-wrap rounded-md border border-ink-900/20 p-1" role="group" aria-label="Filter by industry">
          {INDUSTRIES.map((i) => (
            <button
              key={i}
              onClick={() => setIndustry(i)}
              aria-pressed={industry === i}
              className={`h-9 rounded-[4px] px-4 text-[15px] whitespace-nowrap transition-colors ${industry === i ? "bg-ink-900 text-cream-50" : "text-ink-700 hover:text-ink-900"}`}
            >
              {i}
            </button>
          ))}
        </div>
      </PageHero>
      <section className="container-x pb-[clamp(4rem,7vw,6.5rem)]">
        <div className="grid min-h-[28rem] content-start gap-x-8 gap-y-14 md:grid-cols-2">
          {shown.map((c) => (
            <CaseCard key={c.slug} study={c} meta={`${c.industry}, ${c.year}`} />
          ))}
        </div>
      </section>
      <CtaBanner title="Your story could be next." />
    </>
  );
}

export function CaseStudy() {
  const { slug } = useParams();
  const study: any = caseStudies.find((c) => c.slug === slug);
  if (!study) return <Navigate to="/work" replace={true} />;
  const next = caseStudies[(caseStudies.indexOf(study) + 1) % caseStudies.length];
  const facts = [
    ["Client", study.client],
    ["Industry", study.industry],
    ["Year", study.year],
    ["Duration", study.duration],
    ["Services", study.services.join(", ")],
  ];
  return (
    <>
      <section className="container-x pt-10 pb-12 lg:pt-14">
        <Link to="/work" className="inline-flex items-center gap-2 text-[15px] text-ink-500 transition-colors hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" aria-hidden={true} />
          All case studies
        </Link>
        <h1 className="display-lg mt-8 max-w-4xl">{study.title}</h1>
        <div className="mt-10 aspect-[21/9] overflow-hidden rounded-lg bg-cream-200">
          <img src={study.image} alt={`${study.client} team`} className="h-full w-full object-cover" />
        </div>
        <div className="mt-10 grid gap-x-8 gap-y-10 lg:grid-cols-12">
          <dl className="grid grid-cols-3 gap-x-8 lg:col-span-7">
            {study.metrics.map((m: any) => (
              <div key={m.label} className="flex flex-col-reverse justify-end justify-end border-t border-ink-900/15 pt-4">
                <dt className="mt-1 text-[15px] leading-snug text-ink-500">{m.label}</dt>
                <dd className="figure text-3xl leading-none sm:text-[2.5rem]">
                  <CountUp value={m.value} decimals={m.decimals ?? 0} prefix={m.prefix ?? ""} suffix={m.suffix ?? ""} />
                </dd>
              </div>
            ))}
          </dl>
          <dl className="border-t border-ink-900/15 text-[15px] lg:col-span-4 lg:col-start-9">
            {facts.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[6rem_1fr] gap-x-4 border-b border-ink-900/15 py-2.5">
                <dt className="text-ink-500">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section className="container-x section-pad">
        <div className="grid gap-x-8 gap-y-6 lg:grid-cols-12">
          <Heading text="Where they started." className="display-md lg:col-span-5" />
          <div className="space-y-4 text-[17px] leading-relaxed text-ink-700 lg:col-span-7">
            {study.challenge.map((p: string) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </section>
      <section className="grain-surface bg-ink-900 text-cream-50">
        <div className="container-x section-pad">
          <Heading text="Three moves that changed everything." className="display-md max-w-3xl" />
          <ol className="mt-10 grid gap-x-8 lg:grid-cols-3">
            {study.approach.map((a: any) => (
              <li key={a.title} className="border-t border-cream-50/15 py-6">
                <Reveal>
                  <h3 className="display-sm">{a.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-cream-50/70">{a.desc}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="container-x section-pad">
        <div className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Heading text="Receipts, not adjectives." className="display-md" />
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink-700">
              {study.results.map((p: string) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <Reveal className="lg:col-span-6 lg:col-start-7">
            <figure className="border-l border-pine-700 pl-6">
              <blockquote className="display-sm">“{study.quote.text}”</blockquote>
              <figcaption className="mt-5 text-[15px]">
                <p>{study.quote.author}</p>
                <p className="text-ink-500">{study.quote.role}</p>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>
      <NextLink to={`/work/${next.slug}`} label="Next case study" title={next.client} />
      <CtaBanner title="Want results like these?" />
    </>
  );
}
