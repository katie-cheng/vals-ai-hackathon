import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";
import { CountUp, Heading, Reveal, Stagger, StaggerItem } from "../components/motion";
import { CaseCard, CtaBanner, NextLink, PageHero } from "../components/shared";
import { caseStudies, services } from "../data/content";

export function Services() {
  return (
    <>
      <PageHero
        title="Six practices. One growth team."
        copy="Every engagement blends the practices your funnel actually needs, staffed senior-only, run in weekly sprints, measured in revenue."
      />
      <section className="container-x pb-[clamp(4rem,7vw,6.5rem)]">
        <ul className="border-t border-ink-900/15">
          {services.map((s) => (
            <li key={s.slug} className="border-b border-ink-900/15">
              <Reveal>
                <Link to={`/services/${s.slug}`} className="group grid gap-x-8 gap-y-5 py-8 lg:grid-cols-12 lg:items-center">
                  <div className="aspect-[3/2] overflow-hidden rounded-lg bg-cream-200 lg:col-span-4">
                    <img src={s.image} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                  </div>
                  <div className="lg:col-span-7 lg:col-start-6">
                    <h2 className="display-md decoration-1 underline-offset-4 group-hover:underline">{s.name}</h2>
                    <p className="mt-3 text-[17px] leading-relaxed text-ink-700">{s.tagline}</p>
                    <p className="mt-3 text-[15px] text-ink-500">{s.deliverables.slice(0, 3).join(", ")}</p>
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
      <CtaBanner title="Not sure which practice you need?" />
    </>
  );
}

export function ServiceDetail() {
  const { slug } = useParams();
  const service: any = services.find((s) => s.slug === slug);
  if (!service) return <Navigate to="/services" replace={true} />;
  const next = services[(services.indexOf(service) + 1) % services.length];
  const related = caseStudies.filter((c) => c.services.includes(service.name));
  const proof = (related.length ? related : caseStudies).slice(0, 2);
  return (
    <>
      <PageHero title={service.name} copy={service.tagline}>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/contact" className="btn btn-primary">
            Start this engagement
            <ArrowUpRight className="h-4 w-4" aria-hidden={true} />
          </Link>
          <Link to="/pricing" className="btn btn-secondary">
            See pricing
          </Link>
        </div>
      </PageHero>
      <section className="container-x">
        <div className="aspect-[21/9] overflow-hidden rounded-lg bg-cream-200">
          <img src={service.image} alt="" className="h-full w-full object-cover" />
        </div>
        <dl className="grid gap-x-8 gap-y-6 py-10 sm:grid-cols-3">
          {service.outcomes.map((o: any) => (
            <div key={o.label} className="flex flex-col-reverse justify-end justify-end border-t border-ink-900/15 pt-4">
              <dt className="mt-1 text-[15px] text-ink-500">{o.label}</dt>
              <dd className="figure text-[2.5rem] leading-none">
                <CountUp value={o.value} decimals={o.decimals ?? 0} prefix={o.prefix ?? ""} suffix={o.suffix ?? ""} />
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="container-x section-pad">
        <div className="grid gap-x-8 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Heading text="What this actually looks like." className="display-md" />
            <div className="mt-5 space-y-4 text-[17px] leading-relaxed text-ink-700">
              {service.description.map((d: string) => (
                <p key={d}>{d}</p>
              ))}
            </div>
            <h3 className="display-sm mt-12">How we run it</h3>
            <ol className="mt-4 border-t border-ink-900/15">
              {service.process.map((p: any) => (
                <li key={p.title} className="grid gap-x-8 gap-y-1 border-b border-ink-900/15 py-4 sm:grid-cols-7">
                  <h4 className="text-[17px] sm:col-span-2">{p.title}</h4>
                  <p className="text-[15px] leading-relaxed text-ink-500 sm:col-span-5">{p.desc}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <h3 className="display-sm">What's included</h3>
            <ul className="mt-4 flex flex-col gap-3 border-t border-ink-900/15 pt-5">
              {service.deliverables.map((d: string) => (
                <li key={d} className="flex items-start gap-2.5 text-[15px] text-ink-700">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-pine-700" aria-hidden={true} />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section className="container-x pb-[clamp(4rem,7vw,6.5rem)]">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <Heading text="This practice, in the wild." className="display-md" />
          <Link to="/work" className="text-link text-[15px]">
            All case studies
          </Link>
        </div>
        <Stagger className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2">
          {proof.map((c) => (
            <StaggerItem key={c.slug}>
              <CaseCard study={c} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <NextLink to={`/services/${next.slug}`} label="Next service" title={next.name} />
      <CtaBanner />
    </>
  );
}
