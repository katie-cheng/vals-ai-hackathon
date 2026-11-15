import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "../components/shared";

const STEPS = ["Your details", "Your goals", "Schedule"];
const REVENUE_OPTIONS = ["< $5k/mo", "$5–10k/mo", "$10–25k/mo", "$25k+/mo"];
const SERVICE_OPTIONS = ["Growth Strategy", "Revenue Operations", "Brand & Positioning", "Performance Marketing", "Sales Enablement", "Analytics", "Not sure yet"];
const SLOTS = ["Tue 10:00", "Tue 14:30", "Wed 09:00", "Wed 15:00", "Thu 11:00", "Thu 16:30"];
const NEXT_STEPS = [
  { title: "We reply within 24 hours", desc: "A partner, not a bot, confirms your slot." },
  { title: "30-minute teardown call", desc: "Live funnel review and three shippable moves." },
  { title: "Proposal in 48 hours", desc: "Fixed scope, fixed price, start date included." },
];
const EMPTY_FORM = { name: "", email: "", company: "", revenue: "", services: [] as string[], message: "", slot: "" };

const optionClass = (selected: boolean, invalid = false) =>
  `flex h-11 items-center justify-center rounded-md border px-3 text-[15px] whitespace-nowrap transition-colors ${
    selected ? "border-ink-900 bg-ink-900 text-cream-50" : `${invalid ? "border-[#b3261e]" : "border-ink-900/20"} bg-white text-ink-900 hover:border-ink-900`
  }`;

function Field({ label, error, optional, children }: any) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[15px] text-ink-700">
        {label}
        {optional && <span className="text-ink-500"> (optional)</span>}
      </span>
      {children}
      {error && (
        <span role="alert" className="mt-1.5 block text-sm text-[#b3261e]">
          {error}
        </span>
      )}
    </label>
  );
}

export function Contact() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<any>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");

  const set = (key: string, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e: any) => ({ ...e, [key]: false }));
  };
  const toggleService = (s: string) => set("services", form.services.includes(s) ? form.services.filter((x) => x !== s) : [...form.services, s]);
  const validate = () => {
    const e: any = {};
    if (step === 0) {
      if (form.name.trim().length < 2) e.name = true;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = true;
      if (form.company.trim().length < 2) e.company = true;
    }
    if (step === 1) {
      if (!form.revenue) e.revenue = true;
      if (form.services.length === 0) e.services = true;
    }
    if (step === 2 && !form.slot) e.slot = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const submit = (ev: any) => {
    ev.preventDefault();
    if (!validate()) return;
    if (step < 2) return setStep(step + 1);
    setStatus("sending");
    setTimeout(() => setStatus("success"), 600);
  };

  return (
    <>
      <PageHero title="Book your free growth call." copy="Thirty minutes, zero pitch. We'll tear down your funnel live and hand you three moves you can ship this month." />
      <section className="container-x pb-[clamp(4rem,7vw,6.5rem)]">
        <div className="grid gap-x-8 gap-y-14 lg:grid-cols-12">
          <div className="min-h-[34rem] lg:col-span-7">
            {status === "success" ? (
              <div role="status">
                <h2 className="display-md">You're booked in.</h2>
                <p className="mt-4 max-w-md text-[17px] leading-relaxed text-ink-700">
                  Thanks {form.name.split(" ")[0]}, your slot on {form.slot} is held. A calendar invite and a short prep form are on their way to {form.email}.
                </p>
                <button
                  onClick={() => {
                    setStatus("idle");
                    setStep(0);
                    setForm(EMPTY_FORM);
                  }}
                  className="btn btn-secondary mt-8"
                >
                  Book another call
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate={true}>
                <ol className="grid grid-cols-3 gap-x-4 text-[15px]">
                  {STEPS.map((s, i) => (
                    <li key={s} aria-current={i === step ? "step" : undefined} className={`border-t pt-3 ${i <= step ? "border-ink-900 text-ink-900" : "border-ink-900/15 text-ink-500"}`}>
                      {i < step ? (
                        <button type="button" onClick={() => setStep(i)} className="text-link">
                          {s}
                        </button>
                      ) : (
                        s
                      )}
                    </li>
                  ))}
                </ol>
                {step === 0 && (
                  <div className="mt-8 flex flex-col gap-5">
                    <h2 className="display-sm">First, the basics.</h2>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Full name" error={errors.name && "Please enter your name."}>
                        <input className={`field ${errors.name ? "field-error" : ""}`} autoComplete="name" value={form.name} aria-invalid={!!errors.name} onChange={(e) => set("name", e.target.value)} />
                      </Field>
                      <Field label="Work email" error={errors.email && "That email doesn't look right."}>
                        <input type="email" className={`field ${errors.email ? "field-error" : ""}`} autoComplete="email" value={form.email} aria-invalid={!!errors.email} onChange={(e) => set("email", e.target.value)} />
                      </Field>
                    </div>
                    <Field label="Company" error={errors.company && "Please enter your company."}>
                      <input className={`field ${errors.company ? "field-error" : ""}`} autoComplete="organization" value={form.company} aria-invalid={!!errors.company} onChange={(e) => set("company", e.target.value)} />
                    </Field>
                    <Field label="What's the #1 growth challenge?" optional={true}>
                      <textarea rows={3} className="field resize-none" value={form.message} onChange={(e) => set("message", e.target.value)} />
                    </Field>
                  </div>
                )}
                {step === 1 && (
                  <div className="mt-8 flex flex-col gap-6">
                    <h2 className="display-sm">Where should we aim?</h2>
                    <fieldset>
                      <legend className="mb-2 text-[15px] text-ink-700">Monthly growth budget</legend>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {REVENUE_OPTIONS.map((o) => (
                          <button key={o} type="button" aria-pressed={form.revenue === o} onClick={() => set("revenue", o)} className={optionClass(form.revenue === o, errors.revenue)}>
                            {o}
                          </button>
                        ))}
                      </div>
                      {errors.revenue && (
                        <span role="alert" className="mt-1.5 block text-sm text-[#b3261e]">
                          Pick the closest range.
                        </span>
                      )}
                    </fieldset>
                    <fieldset>
                      <legend className="mb-2 text-[15px] text-ink-700">What do you need help with?</legend>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                        {SERVICE_OPTIONS.map((o) => (
                          <button key={o} type="button" aria-pressed={form.services.includes(o)} onClick={() => toggleService(o)} className={optionClass(form.services.includes(o), errors.services)}>
                            {o}
                          </button>
                        ))}
                      </div>
                      {errors.services && (
                        <span role="alert" className="mt-1.5 block text-sm text-[#b3261e]">
                          Choose at least one.
                        </span>
                      )}
                    </fieldset>
                  </div>
                )}
                {step === 2 && (
                  <div className="mt-8 flex flex-col gap-6">
                    <h2 className="display-sm">Pick your slot.</h2>
                    <fieldset>
                      <legend className="mb-2 text-[15px] text-ink-700">Next week, Eastern Time</legend>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {SLOTS.map((o) => (
                          <button key={o} type="button" aria-pressed={form.slot === o} onClick={() => set("slot", o)} className={`${optionClass(form.slot === o, errors.slot)} tabular-nums`}>
                            {o}
                          </button>
                        ))}
                      </div>
                      {errors.slot && (
                        <span role="alert" className="mt-1.5 block text-sm text-[#b3261e]">
                          Pick a time that suits you.
                        </span>
                      )}
                    </fieldset>
                    <dl className="border-t border-ink-900/15 text-[15px]">
                      {[
                        ["Name", form.name],
                        ["Company", form.company],
                        ["Budget", form.revenue],
                        ["Help with", form.services.join(", ")],
                      ].map(([k, v]) => (
                        <div key={k} className="grid grid-cols-[6rem_1fr] gap-x-4 border-b border-ink-900/15 py-2.5">
                          <dt className="text-ink-500">{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
                <div className="mt-8 flex items-center gap-3">
                  <button type="submit" disabled={status === "sending"} className="btn btn-primary">
                    {status === "sending" ? "Booking…" : step < 2 ? "Continue" : "Confirm booking"}
                    {step === 2 && status !== "sending" && <ArrowUpRight className="h-4 w-4" aria-hidden={true} />}
                  </button>
                  {step > 0 && (
                    <button type="button" onClick={() => setStep(step - 1)} className="btn btn-secondary">
                      Back
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <h2 className="display-sm">What happens next</h2>
            <ol className="mt-4 border-t border-ink-900/15">
              {NEXT_STEPS.map((s) => (
                <li key={s.title} className="border-b border-ink-900/15 py-4">
                  <p className="text-[15px]">{s.title}</p>
                  <p className="mt-1 text-[15px] text-ink-500">{s.desc}</p>
                </li>
              ))}
            </ol>
            <h2 className="display-sm mt-10">Prefer email or foot traffic?</h2>
            <address className="mt-4 text-[15px] leading-relaxed text-ink-700 not-italic">
              <a href="mailto:hello@kora.agency" className="text-link">
                hello@kora.agency
              </a>
              <p className="mt-3">
                48 Mercer Street, SoHo
                <br />
                New York, NY 10013
              </p>
              <p className="mt-3">Monday to Friday, 9:00 to 18:00 ET</p>
            </address>
          </aside>
        </div>
      </section>
    </>
  );
}
