import { CalendarCheck, HeartHandshake, Layers, Sparkles, UserRound } from "lucide-react";
import { REASONS } from "../content";
import { Reveal } from "./Reveal";

const ICONS = [UserRound, Sparkles, HeartHandshake, Layers, CalendarCheck];

export function WhyUs() {
  return (
    <section id="why-us" className="section bg-blush">
      <div className="wrap grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal>
          <span className="rule" aria-hidden="true" />
          <h2 className="section-title mt-6">Why choose us</h2>
          <p className="mt-6 max-w-sm text-muted">What you can expect from the moment you book to the moment you leave.</p>
        </Reveal>
        <ul className="border-t border-ink/15">
          {REASONS.map((r, i) => {
            const Icon = ICONS[i];
            return (
              <li key={r.title} className="border-b border-ink/15">
                <Reveal className="grid grid-cols-[2rem_1fr] gap-5 py-7">
                  <Icon className="mt-1 size-6 text-gold-deep" strokeWidth={1.4} aria-hidden="true" />
                  <div>
                    <h3 className="text-[1.6rem]">{r.title}</h3>
                    <p className="mt-2 text-muted">{r.text}</p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
