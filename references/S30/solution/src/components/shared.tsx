import { Link } from "react-router-dom";
import { useScroll, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Heading, Reveal } from "./motion";

/** Reading progress along the bottom edge of the header. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return <motion.div className="fixed inset-x-0 top-16 z-[55] h-px origin-left bg-pine-600" style={{ scaleX: scrollYProgress }} aria-hidden={true} />;
}

/** The one closing call to action of each page: a title and the booking button. */
export function CtaBanner({ title = "Ready to turn growth into a system?" }: any) {
  return (
    <section className="grain-surface bg-ink-900 text-cream-50">
      <div className="container-x flex flex-col items-start justify-between gap-8 py-16 md:flex-row md:items-center lg:py-20">
        <Heading text={title} className="display-md max-w-2xl" />
        <Reveal>
          <Link to="/contact" className="btn btn-light">
            Book your free call
            <ArrowUpRight className="h-4 w-4" aria-hidden={true} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/** Article teaser used on Home and Insights: image, category and date on one aligned row, title, excerpt. */
export function InsightCard({ article: a }: any) {
  return (
    <Link to={`/insights/${a.slug}`} className="group block">
      <div className="aspect-[3/2] overflow-hidden rounded-lg bg-cream-200">
        <img src={a.image} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
      </div>
      <p className="mt-5 flex justify-between gap-4 text-sm text-ink-500">
        <span>{a.category}</span>
        <span>{a.date}</span>
      </p>
      <h3 className="display-sm mt-2 decoration-1 underline-offset-4 group-hover:underline">{a.title}</h3>
      <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-ink-500">{a.excerpt}</p>
    </Link>
  );
}

/** Title block of every inner page: the page name as the h1 and one paragraph. */
export function PageHero({ title, copy, children }: any) {
  return (
    <section className="container-x pt-14 pb-12 lg:pt-20 lg:pb-16">
      <div className="grid gap-x-8 gap-y-5 lg:grid-cols-12 lg:items-end">
        <h1 className="display-lg lg:col-span-7">{title}</h1>
        {copy && <p className="lede text-ink-500 lg:col-span-5">{copy}</p>}
      </div>
      {children}
    </section>
  );
}

/** Case-study teaser: image, client and industry on one aligned row, title, then its metrics. */
export function CaseCard({ study: c, metricLimit = 3, meta }: any) {
  return (
    <Link to={`/work/${c.slug}`} className="group block">
      <div className="aspect-[4/3] overflow-hidden rounded-lg bg-cream-200">
        <img src={c.image} alt={`${c.client} team`} className="h-full w-full object-cover" loading="lazy" decoding="async" />
      </div>
      <p className="mt-5 flex justify-between gap-4 text-sm text-ink-500">
        <span>{c.client}</span>
        <span>{meta ?? c.industry}</span>
      </p>
      <h3 className="display-sm mt-2 decoration-1 underline-offset-4 group-hover:underline">{c.title}</h3>
      <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-ink-900/15 pt-4">
        {c.metrics.slice(0, metricLimit).map((m: any) => (
          <div key={m.label} className="flex flex-col-reverse justify-end justify-end">
            <dt className="mt-1 text-sm leading-snug text-ink-500">{m.label}</dt>
            <dd className="figure text-xl leading-none">
              {m.prefix ?? ""}
              {Number(m.value).toFixed(m.decimals ?? 0)}
              {m.suffix ?? ""}
            </dd>
          </div>
        ))}
      </dl>
    </Link>
  );
}

/** Link to the next item in a series, as a ruled row. */
export function NextLink({ to, label, title }: any) {
  return (
    <section className="container-x pb-[clamp(4rem,7vw,6.5rem)]">
      <Link to={to} className="group flex items-baseline justify-between gap-6 border-y border-ink-900/15 py-6">
        <span className="text-[15px] text-ink-500">{label}</span>
        <span className="display-sm text-right decoration-1 underline-offset-4 group-hover:underline">{title}</span>
      </Link>
    </section>
  );
}
