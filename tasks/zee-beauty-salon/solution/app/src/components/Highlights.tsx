import { HIGHLIGHTS } from "../content";
import { Reveal } from "./Reveal";

export function Highlights() {
  return (
    <section className="bg-blush/50 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <Reveal>
            <h2 className="section-title">Why choose ZEE</h2>
          </Reveal>
        </div>
        <ul className="divide-y divide-charcoal/10 border-y border-charcoal/10 lg:col-span-7 lg:col-start-6">
          {HIGHLIGHTS.map((h, i) => (
            <li key={h.title}>
              <Reveal delay={i * 0.05} className="py-7">
                <h3 className="text-[1.75rem]">{h.title}</h3>
                <p className="mt-1.5 text-charcoal/75">{h.text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
