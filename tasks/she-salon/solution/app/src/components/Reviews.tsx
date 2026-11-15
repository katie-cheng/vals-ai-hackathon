import { ArrowUpRight, Quote } from "lucide-react";
import { GOOGLE_REVIEWS_URL } from "../content";
import { Reveal } from "./Reveal";

export function Reviews() {
  return (
    <section id="reviews" className="section">
      <div className="wrap grid gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <span className="rule" aria-hidden="true" />
          <h2 className="section-title mt-6">Client reviews</h2>
          <p className="mt-6 max-w-md text-muted">We only publish reviews that our clients have actually written. Until they are added here, you can read what clients say on our Google listing.</p>
          <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-8">
            Read our reviews on Google <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </Reveal>
        <Reveal delay={0.1}>
          <figure className="border border-dashed border-ink/30 p-8 sm:p-10">
            <Quote className="size-8 text-gold" strokeWidth={1.2} aria-hidden="true" />
            <blockquote className="mt-5 font-display text-[1.75rem] leading-snug text-muted">Placeholder: a verified client review will appear here, shared with her permission.</blockquote>
            <figcaption className="mt-6 text-[0.95rem] text-muted">Review placeholder, not a real client quote</figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
