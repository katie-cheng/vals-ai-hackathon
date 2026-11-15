import { ArrowUpRight } from "lucide-react";
import { SERVICES, WHATSAPP_URL } from "../content";
import { Reveal } from "./Reveal";

export function Services() {
  return (
    <section id="services" className="section">
      <div className="wrap">
        <Reveal className="max-w-2xl">
          <span className="rule" aria-hidden="true" />
          <h2 className="section-title mt-6">Our services</h2>
          <p className="mt-6 text-muted">Ten services for brides, special occasions and everyday care. Prices depend on the look and the time it takes, so we share them when you enquire.</p>
        </Reveal>
        <ul className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <li key={s.name}>
              <Reveal>
                <article className="group">
                  <div className="aspect-[4/3] overflow-hidden bg-beige">
                    <img
                      src={`/images/${s.image}`}
                      alt={s.alt}
                      width={800}
                      height={600}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.04]"
                    />
                  </div>
                  <h3 className="mt-6 border-b border-ink/15 pb-3 text-[1.75rem] transition-colors duration-300 group-hover:border-gold">{s.name}</h3>
                  <p className="mt-3 text-[1rem] text-muted">{s.text}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
        <Reveal className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-ink/15 pt-8">
          <p className="text-muted">Not sure what to choose? Tell us about your occasion and we will suggest a plan.</p>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium whitespace-nowrap text-gold-deep underline-offset-4 hover:underline">
            Ask on WhatsApp <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
