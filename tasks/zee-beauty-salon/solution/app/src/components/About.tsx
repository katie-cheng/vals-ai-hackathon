import { ArrowRight } from "lucide-react";
import { ImageReveal, Reveal } from "./Reveal";

export function About() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10">
        <div className="relative lg:col-span-5">
          <div aria-hidden="true" className="absolute -left-4 -top-4 h-full w-full rounded-lg border border-champagne/60 sm:-left-6 sm:-top-6" />
          <ImageReveal className="relative aspect-[4/5] overflow-hidden rounded-lg bg-blush">
            <img src="/images/about.jpg" alt="Stylist pinning a bridal updo with a crystal hair accessory in a warm, softly lit salon" loading="lazy" className="absolute inset-0 size-full object-cover" />
          </ImageReveal>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal>
            <h2 className="section-title">Welcome to ZEE Beauty Saloon</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 text-xl text-charcoal/85">
              At ZEE Beauty Saloon, beauty is all about feeling confident, comfortable, and special. We aim to create a welcoming beauty experience where every
              client feels valued.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 text-charcoal/75">
              Come in for a quick threading appointment or start planning your wedding look. Either way, we begin by listening, so that what you leave with feels
              like you.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <a href="#services" className="group mt-9 inline-flex items-center gap-2 font-medium text-rose-deep">
              See our services
              <ArrowRight size={18} className="transition group-hover:translate-x-1" aria-hidden="true" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
