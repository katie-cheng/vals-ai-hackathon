import { Faq } from "../components/Faq";
import { Heading, Reveal } from "../components/motion";
import { Plans } from "../components/Plans";
import { CtaBanner, PageHero } from "../components/shared";
import { faqs } from "../data/content";

const GUARANTEES = [
  "3× opportunity guarantee on every Sprint",
  "Month-to-month after 90 days",
  "Pause or cancel with 30 days notice",
  "You own every asset, dashboard and playbook",
];

const ALTERNATIVES = [
  { label: "Senior growth hire", cost: "$150k+/yr + equity", note: "One person, a six-month ramp, a single skillset" },
  { label: "Traditional agency", cost: "$8–15k/mo", note: "Junior staff, hourly billing, reports instead of revenue" },
  { label: "Kora Growth Partner", cost: "$5.5k/mo quarterly", note: "Strategist and specialists, shipping in week one, measured on revenue" },
];

export function Pricing() {
  return (
    <>
      <PageHero
        title="Priced like an investment. Because that's what it is."
        copy="Transparent tiers, no hourly billing, no surprise invoices. Pick the intensity that matches your ambition."
      />
      <section className="container-x pb-[clamp(4rem,7vw,6.5rem)]">
        <Plans to="/contact" showSavings={true} />
        <div className="mt-14 grid gap-x-8 gap-y-4 border-t border-ink-900/15 pt-6 lg:grid-cols-12">
          <h2 className="display-sm lg:col-span-4">The Kora guarantee</h2>
          <ul className="grid gap-x-8 gap-y-2 text-[15px] text-ink-700 sm:grid-cols-2 lg:col-span-8">
            {GUARANTEES.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="bg-cream-100">
        <div className="container-x section-pad">
          <div className="grid gap-x-8 gap-y-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Heading text="Do the math with us." className="display-md" />
              <Reveal>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-500">
                  A senior growth hire costs $150k+ and takes six months to ramp, and they're still one person. Here's what the same budget buys at Kora.
                </p>
              </Reveal>
            </div>
            <table className="w-full self-start border-t border-ink-900/15 text-left text-[15px] lg:col-span-7">
              <caption className="sr-only">Kora compared with the alternatives</caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Option</th>
                  <th scope="col">Cost</th>
                  <th scope="col">What you get</th>
                </tr>
              </thead>
              <tbody>
                {ALTERNATIVES.map((a) => (
                  <tr key={a.label} className="grid grid-cols-2 gap-x-8 border-b border-ink-900/15 py-4 sm:grid-cols-[1fr_1fr_1.4fr]">
                    <th scope="row" className="font-normal text-ink-900">
                      {a.label}
                    </th>
                    <td className="tabular-nums whitespace-nowrap">{a.cost}</td>
                    <td className="col-span-2 mt-1 text-ink-500 sm:col-span-1 sm:mt-0">{a.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section id="faq" className="container-x section-pad">
        <div className="grid gap-x-8 gap-y-8 lg:grid-cols-12">
          <Heading text="Fair questions, straight answers." className="display-md lg:col-span-5" />
          <div className="lg:col-span-7">
            <Faq items={faqs} id="pricing-faq" />
          </div>
        </div>
      </section>
      <CtaBanner title="Still deciding? Let's talk it through." />
    </>
  );
}
