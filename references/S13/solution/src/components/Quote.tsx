import * as React from "react";
import { SITE, quoteOptions } from "../data/content";
import { EASE, Reveal, SplitWords } from "../lib/anim";
import { submitQuote } from "../lib/api";
import { AnimatePresence, motion } from "framer-motion";
import { Check, LoaderCircle, Phone, Send } from "lucide-react";

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  address: "",
  town: "",
  zip: "",
  services: [],
  preferredContact: "call",
  stories: "",
  notes: "",
  companyWebsite: "",
};

function Field({ label: a, error: i, children: r, htmlFor: l, required: u }) {
  return (
    <motion.label
      htmlFor={l}
      className={`group/field block ${i ? "has-error" : ""}`}
      whileFocus={{
        scale: 1.005,
      }}
    >
      <span className="mb-1.5 flex items-center justify-between text-[13.5px] font-semibold text-sky-100/85">
        {a} {u && <b className="text-cyan-300">*</b>}
      </span>
      {r}
      <AnimatePresence>
        {i && (
          <motion.small
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="mt-1 block text-[12.5px] font-semibold text-rose-300"
          >
            {i}
          </motion.small>
        )}
      </AnimatePresence>
    </motion.label>
  );
}

const inputClass = (a?: unknown) =>
  `w-full rounded-lg border bg-white/[0.06] px-4 py-2.5 text-[15px] font-medium text-white placeholder:text-sky-200/30 outline-none transition-all duration-300 focus:scale-[1.01] ${a ? "border-rose-400/70 focus:border-rose-300 focus:ring-4 focus:ring-rose-400/15" : "border-white/15 hover:border-white/30 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/15"}`;

function Quote() {
  const [a, i] = React.useState(EMPTY_FORM),
    [r, l] = React.useState<Record<string, string>>({}),
    [u, h] = React.useState("idle"),
    [d, p] = React.useState(""),
    [y, b] = React.useState(""),
    [v, g] = React.useState(""),
    S = React.useRef(Date.now()),
    A = React.useRef(null),
    E = React.useRef(null);
  React.useEffect(() => {
    S.current = Date.now();
  }, []);
  const V = (O, G) => {
      (i((F) => ({
        ...F,
        [O]: G,
      })),
        l((F) => {
          if (!F[O]) return F;
          const K = {
            ...F,
          };
          return (delete K[O], K);
        }),
        u === "error" && h("idle"));
    },
    M = (O) => {
      (i((G) => ({
        ...G,
        services: G.services.includes(O)
          ? G.services.filter((F) => F !== O)
          : [...G.services, O],
      })),
        l((G) => {
          const F = {
            ...G,
          };
          return (delete F.services, F);
        }));
    },
    H = () => {
      const O: Record<string, string> = {};
      return (
        a.name.trim().length < 2 && (O.name = "Tell us your name."),
        a.phone.replace(/\D/g, "").length < 10 &&
          (O.phone = "Enter a valid 10-digit phone number."),
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email) ||
          (O.email = "Enter a valid email address."),
        a.address.trim().length < 5 &&
          (O.address = "Enter the property street address."),
        a.town.trim().length < 2 && (O.town = "Enter your Connecticut town."),
        /^06\d{3}$/.test(a.zip) ||
          (O.zip = "Use a Connecticut ZIP code from 06000 to 06999."),
        a.services.length || (O.services = "Choose at least one service."),
        a.stories || (O.stories = "Select the property height."),
        l(O),
        O
      );
    },
    L = async (O) => {
      O.preventDefault();
      const G = H();
      if (Object.keys(G).length) {
        A.current?.querySelector(`[name="${Object.keys(G)[0]}"]`)?.focus();
        return;
      }
      (h("submitting"), p(""));
      try {
        const F = await submitQuote({
          ...a,
          elapsedMs: Date.now() - S.current,
        });
        (b(F.reference),
          g(
            {
              call: "phone call",
              text: "text message",
              email: "email",
            }[a.preferredContact] ?? "call",
          ),
          h("success"),
          setTimeout(() => E.current?.focus(), 100));
      } catch (F) {
        (p(
          F instanceof Error
            ? F.message
            : "Something interrupted your request. Please try again.",
        ),
          h("error"));
      }
    },
    Y = () => {
      (i(EMPTY_FORM), l({}), b(""), p(""), h("idle"), (S.current = Date.now()));
    };
  return (
    <section id="quote" className="bg-tone-b relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
      </div>
      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 sm:px-10 lg:px-24 grid-12 split-5-7">
        <div>
          <SplitWords
            text="Tell us what needs cleaning."
            as="h2"
            className="font-serif-d block text-[1.9rem] font-normal leading-tight text-white sm:text-[2.6rem]"
          />
          <Reveal delay={0.2}>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-sky-100/75">
              Share the property details and select every service you want to
              discuss. We will review the request, look at the property, and
              confirm the scope and price with you.
            </p>
          </Reveal>
          <div className="mt-8 space-y-3">
            {[
              {
                k: "Call",
                v: SITE.phoneDisplay,
                href: SITE.phoneHref,
              },
              {
                k: "Text",
                v: "Send photos and questions",
                href: SITE.smsHref,
              },
              {
                k: "Email",
                v: SITE.email,
                href: SITE.emailHref,
              },
            ].map((O, G) => (
              <Reveal key={O.k} delay={0.25 + G * 0.08}>
                <motion.a
                  href={O.href}
                  transition={{
                    duration: 0.3,
                    ease: EASE,
                  }}
                  className="group flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.05] p-4 transition-colors duration-300 hover:border-cyan-300/40"
                >
                  <span>
                    <span className="block text-[13px] font-medium text-sky-200/70">
                      {O.k}
                    </span>
                    <span className="block break-all text-[15px] font-medium text-white">
                      {O.v}
                    </span>
                  </span>
                </motion.a>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.5}>
            <p className="mt-6 flex items-start gap-2 text-[12.5px] leading-relaxed text-sky-200/55">
              Your details are used only to respond to this request. Submitting
              the form does not book an appointment.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <div className="glass-strong relative overflow-hidden rounded-lg p-6 sm:p-9">
            <AnimatePresence mode="wait">
              {u === "success" ? (
                <motion.div
                  key={"ok"}
                  ref={E}
                  tabIndex={-1}
                  role="status"
                  initial={{
                    opacity: 0,
                    scale: 0.94,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: EASE,
                  }}
                  className="flex min-h-[480px] flex-col items-center justify-center text-center outline-none"
                >
                  <motion.div
                    initial={{
                      scale: 0,
                      rotate: -120,
                    }}
                    animate={{
                      scale: 1,
                      rotate: 0,
                    }}
                    transition={{
                      delay: 0.15,
                      duration: 0.7,
                      ease: EASE,
                    }}
                    className="grid h-20 w-20 place-items-center rounded-full bg-cyan-300"
                  >
                    <Check
                      className="h-10 w-10 text-[#04141f]"
                      strokeWidth={3}
                    />
                  </motion.div>
                  <motion.h3
                    initial={{
                      opacity: 0,
                      y: 18,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.35,
                      duration: 0.5,
                      ease: EASE,
                    }}
                    className="mt-6 text-3xl font-light text-white"
                  >
                    Request saved
                  </motion.h3>
                  <motion.p
                    initial={{
                      opacity: 0,
                      y: 18,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.45,
                      duration: 0.5,
                      ease: EASE,
                    }}
                    className="mt-3 max-w-sm text-[15px] leading-relaxed text-sky-100/80"
                  >
                    {"We have your quote request. We will follow up by "}
                    {v}.
                  </motion.p>
                  <motion.p
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    transition={{
                      delay: 0.6,
                    }}
                    className="mt-4 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-5 py-2 text-[13px] font-semibold text-cyan-200"
                  >
                    {"Your reference: "}
                    {y}
                  </motion.p>
                  <motion.p
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    transition={{
                      delay: 0.7,
                    }}
                    className="mt-4 text-[13.5px] text-sky-200/70"
                  >
                    Need to add something? Call or text{" "}
                    <a
                      href={SITE.phoneHref}
                      className="font-medium text-cyan-300"
                    >
                      {SITE.phoneDisplay}
                    </a>
                  </motion.p>
                  <motion.button
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    transition={{
                      delay: 0.8,
                    }}
                    onClick={Y}
                    className="mt-7 rounded-md border border-white/20 px-4 py-2 text-[13.5px] font-medium text-white transition hover:border-cyan-300/60 hover:bg-cyan-300/10"
                  >
                    Start another request
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key={"form"}
                  ref={A}
                  onSubmit={L}
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  aria-describedby="quote-privacy"
                  noValidate={false}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      Free quote request
                    </h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Full name"
                      htmlFor="quote-name"
                      error={r.name}
                      required
                    >
                      <input
                        id="quote-name"
                        name="name"
                        autoComplete="name"
                        placeholder="Jane homeowner"
                        className={inputClass(r.name)}
                        value={a.name}
                        onChange={(O) => V("name", O.target.value)}
                        required
                        aria-invalid={!!r.name}
                      />
                    </Field>
                    <Field
                      label="Phone"
                      htmlFor="quote-phone"
                      error={r.phone}
                      required
                    >
                      <input
                        id="quote-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="(860) 555-0123"
                        className={inputClass(r.phone)}
                        value={a.phone}
                        onChange={(O) => V("phone", O.target.value)}
                        required
                        aria-invalid={!!r.phone}
                      />
                    </Field>
                    <Field
                      label="Email"
                      htmlFor="quote-email"
                      error={r.email}
                      required
                    >
                      <input
                        id="quote-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className={inputClass(r.email)}
                        value={a.email}
                        onChange={(O) => V("email", O.target.value)}
                        required
                        aria-invalid={!!r.email}
                      />
                    </Field>
                    <Field
                      label="Property address"
                      htmlFor="quote-address"
                      error={r.address}
                      required
                    >
                      <input
                        id="quote-address"
                        name="address"
                        autoComplete="street-address"
                        placeholder="Street address"
                        className={inputClass(r.address)}
                        value={a.address}
                        onChange={(O) => V("address", O.target.value)}
                        required
                        aria-invalid={!!r.address}
                      />
                    </Field>
                    <Field
                      label="Connecticut town"
                      htmlFor="quote-town"
                      error={r.town}
                      required
                    >
                      <input
                        id="quote-town"
                        name="town"
                        autoComplete="address-level2"
                        placeholder="e.g. Hartford"
                        className={inputClass(r.town)}
                        value={a.town}
                        onChange={(O) => V("town", O.target.value)}
                        required
                        aria-invalid={!!r.town}
                      />
                    </Field>
                    <Field
                      label="Connecticut ZIP"
                      htmlFor="quote-zip"
                      error={r.zip}
                      required
                    >
                      <input
                        id="quote-zip"
                        name="zip"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        placeholder="06___"
                        maxLength={5}
                        className={inputClass(r.zip)}
                        value={a.zip}
                        onChange={(O) => V("zip", O.target.value)}
                        required
                        aria-invalid={!!r.zip}
                      />
                    </Field>
                  </div>
                  <fieldset
                    className="mt-6"
                    aria-describedby={
                      r.services ? "quote-services-error" : void 0
                    }
                  >
                    <legend className="mb-1 text-[13.5px] font-semibold text-sky-100/85">
                      {"What can we clean? "}
                      <b className="text-cyan-300">*</b>
                    </legend>
                    <p className="mb-3 text-[12.5px] text-sky-200/55">
                      Select all that apply.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {quoteOptions.map((O) => {
                        const G = a.services.includes(O);
                        return (
                          <motion.label
                            key={O}
                            className={`flex cursor-pointer items-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-medium transition-all duration-300 ${G ? "bg-cyan-300 text-[#04141f]" : "border border-white/15 bg-white/[0.05] text-sky-100/80 hover:border-cyan-300/50 hover:text-white"}`}
                          >
                            <input
                              type="checkbox"
                              name="services"
                              value={O}
                              checked={G}
                              onChange={() => M(O)}
                              className="sr-only"
                            />
                            <span
                              className={`grid h-5 w-5 place-items-center rounded-full transition-all ${G ? "bg-[#04141f]/20" : "bg-white/10"}`}
                            >
                              {G && <Check className="h-3 w-3" strokeWidth={3} />}
                            </span>
                            {O}
                          </motion.label>
                        );
                      })}
                    </div>
                    <AnimatePresence>
                      {r.services && (
                        <motion.small
                          id="quote-services-error"
                          initial={{
                            opacity: 0,
                          }}
                          animate={{
                            opacity: 1,
                          }}
                          exit={{
                            opacity: 0,
                          }}
                          className="mt-2 block text-[12.5px] font-semibold text-rose-300"
                        >
                          {r.services}
                        </motion.small>
                      )}
                    </AnimatePresence>
                  </fieldset>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Number of stories"
                      htmlFor="quote-stories"
                      error={r.stories}
                      required
                    >
                      <select
                        id="quote-stories"
                        name="stories"
                        value={a.stories}
                        onChange={(O) => V("stories", O.target.value)}
                        required
                        aria-invalid={!!r.stories}
                        className={`${inputClass(r.stories)} appearance-none [&>option]:text-slate-900`}
                      >
                        <option value="">Choose one</option>
                        <option value="1">1 story</option>
                        <option value="2">2 stories</option>
                        <option value="3">3 stories</option>
                        <option value="4+">4 or more stories</option>
                      </select>
                    </Field>
                    <div>
                      <span className="mb-1.5 block text-[13.5px] font-semibold text-sky-100/85">
                        Preferred contact
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            v: "call",
                            t: "Call me",
                          },
                          {
                            v: "text",
                            t: "Text me",
                          },
                          {
                            v: "email",
                            t: "Email me",
                          },
                        ].map((O) => (
                          <button
                            key={O.v}
                            type="button"
                            onClick={() =>
                              i((G) => ({
                                ...G,
                                preferredContact: O.v,
                              }))
                            }
                            className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-3.5 text-[12.5px] font-medium transition-all duration-300 ${a.preferredContact === O.v ? "border-cyan-300 bg-cyan-300/15 text-cyan-200" : "border-white/15 bg-white/[0.05] text-sky-100/70 hover:border-white/30"}`}
                            aria-pressed={a.preferredContact === O.v}
                          > {O.t}
                          </button>
                        ))}
                      </div>
                      <select
                        id="quote-preferredContact"
                        name="preferredContact"
                        value={a.preferredContact}
                        onChange={(O) =>
                          i((G) => ({
                            ...G,
                            preferredContact: O.target.value,
                          }))
                        }
                        className="sr-only"
                        tabIndex={-1}
                        aria-hidden
                      >
                        <option value="call">Call me</option>
                        <option value="text">Text me</option>
                        <option value="email">Email me</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label
                      htmlFor="quote-notes"
                      className="mb-1.5 block text-[13.5px] font-semibold text-sky-100/85"
                    >
                      Notes, access, and trouble spots
                    </label>
                    <textarea
                      id="quote-notes"
                      name="notes"
                      rows={4}
                      maxLength={3e3}
                      placeholder="Gate access, heavy buildup, timing, or anything else we should know."
                      value={a.notes}
                      onChange={(O) => V("notes", O.target.value)}
                      className={`${inputClass()} resize-none`}
                    />
                  </div>
                  <label className="hidden" aria-hidden="true">
                    Company website
                    <input
                      name="companyWebsite"
                      tabIndex={-1}
                      autoComplete="off"
                      value={a.companyWebsite}
                      onChange={(O) => V("companyWebsite", O.target.value)}
                    />
                  </label>
                  <AnimatePresence>
                    {u === "error" && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -8,
                          scale: 0.98,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        role="alert"
                        className="mt-4 flex items-center gap-2.5 rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-[13.5px] font-semibold text-rose-200"
                      > {d}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="mt-6">
                    <motion.button
                      type="submit"
                      disabled={u === "submitting"}
                      className="group flex w-full items-center justify-center gap-3 rounded-lg bg-cyan-300 px-5 py-3 text-[15.5px] font-medium text-[#04141f] transition-all duration-500 hover:bg-right disabled:opacity-70"
                    >
                      {u === "submitting" ? (
                        <>
                          <LoaderCircle className="h-5 w-5 animate-spin" />
                          {" Saving your request..."}
                        </>
                      ) : (
                        <>
                          Send my free quote request
                        </>
                      )}
                    </motion.button>
                  </div>
                  <p
                    id="quote-privacy"
                    className="mt-3 text-center text-[12px] text-sky-200/50"
                  >
                    Your request is saved securely.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export { EMPTY_FORM, Field, inputClass, Quote };
