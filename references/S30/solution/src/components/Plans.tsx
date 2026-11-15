import { useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { plans } from "../data/content";
import { Reveal } from "./motion";

/** Billing switch and the three plans as ruled columns. `to` is where each plan's button leads. */
export function Plans({ to, benefitLimit, showSavings }: { to: string; benefitLimit?: number; showSavings?: boolean }) {
  const [quarterly, setQuarterly] = useState(true);
  return (
    <div>
      <div className="inline-flex rounded-md border border-ink-900/20 p-1" role="group" aria-label="Billing period">
        {[
          { label: "Monthly", value: false },
          { label: "Quarterly, 15% off", value: true },
        ].map((o) => (
          <button
            key={o.label}
            onClick={() => setQuarterly(o.value)}
            aria-pressed={quarterly === o.value}
            className={`h-9 rounded-[4px] px-4 text-[15px] whitespace-nowrap transition-colors ${quarterly === o.value ? "bg-ink-900 text-cream-50" : "text-ink-700 hover:text-ink-900"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-x-8 gap-y-12 lg:grid-cols-3">
        {plans.map((p: any) => {
          const price = p.monthly ? (quarterly ? Math.round(p.monthly * 0.85) : p.monthly) : p.oneTime;
          return (
            <Reveal key={p.name} className="flex flex-col border-t border-ink-900/15 pt-6">
              <h3 className="display-sm">{p.name}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-500 lg:min-h-[3.25rem]">{p.blurb}</p>
              <p className="mt-5 flex items-baseline gap-2">
                <span className="figure text-[2.5rem] leading-none tabular-nums">${price.toLocaleString()}</span>
                <span className="text-[15px] text-ink-500">{p.unit}</span>
              </p>
              {showSavings && (
                <p className="mt-2 min-h-6 text-[15px] text-pine-700">
                  {p.monthly && quarterly ? `Billed quarterly, save $${Math.round(p.monthly * 0.15 * 3).toLocaleString()} a quarter` : ""}
                </p>
              )}
              <ul className="mt-6 mb-8 flex flex-col gap-2.5">
                {(benefitLimit ? p.benefits.slice(0, benefitLimit) : p.benefits).map((b: string) => (
                  <li key={b} className="flex items-start gap-2.5 text-[15px] text-ink-700">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-pine-700" aria-hidden={true} />
                    {b}
                  </li>
                ))}
              </ul>
              <Link to={to} className={`btn mt-auto w-full ${p.featured ? "btn-primary" : "btn-secondary"}`}>
                {p.cta}
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
