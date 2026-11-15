import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { EASE, Reveal, SplitText, Stagger, StaggerItem } from "../components/motion";
import { ArrowUpRight, AtSign, CalendarCheck, Check, Clock, LoaderCircle, MapPin } from "lucide-react";

const contactSteps = ["Your details", "Your goals", "Schedule"],
  budgets = ["< $5k/mo", "$5–10k/mo", "$10–25k/mo", "$25k+/mo"],
  contactIE = [
    "Growth Strategy",
    "Revenue Operations",
    "Brand & Positioning",
    "Performance Marketing",
    "Sales Enablement",
    "Analytics",
    "Not sure yet",
  ],
  contactE = ["Tue 10:00", "Tue 14:30", "Wed 09:00", "Wed 15:00", "Thu 11:00", "Thu 16:30"],
  emptyForm = {
    name: "",
    email: "",
    company: "",
    revenue: "",
    services: [],
    message: "",
    slot: "",
  };
export function Contact() {
  const [s, n] = useState(0),
    [l, r] = useState(emptyForm),
    [d, f] = useState({}),
    [h, m] = useState("idle"),
    g = useRef(null),
    { scrollYProgress: x } = useScroll({
      target: g,
      offset: ["start start", "end start"],
    }),
    y = useTransform(x, [0, 1], ["0%", "30%"]),
    v = useTransform(x, [0, 0.8], [1, 0]),
    S = (R, V) => {
      (r((L) => ({
        ...L,
        [R]: V,
      })),
        f((L) => ({
          ...L,
          [R]: !1,
        })));
    },
    T = (R) => {
      (r((V) => ({
        ...V,
        services: V.services.includes(R) ? V.services.filter((L) => L !== R) : [...V.services, R],
      })),
        f((V) => ({
          ...V,
          services: !1,
        })));
    },
    j = () => {
      const R = {};
      return (
        s === 0 &&
          (l.name.trim().length < 2 && (R.name = !0),
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l.email) || (R.email = !0),
          l.company.trim().length < 2 && (R.company = !0)),
        s === 1 && (l.revenue || (R.revenue = !0), l.services.length === 0 && (R.services = !0)),
        s === 2 && (l.slot || (R.slot = !0)),
        f(R),
        Object.keys(R).length === 0
      );
    },
    O = (R) => {
      if ((R.preventDefault(), s < 2)) {
        j() && n(s + 1);
        return;
      }
      j() &&
        (m("sending"),
        setTimeout(() => {
          m(Math.random() > 0.12 ? "success" : "error");
        }, 1600));
    },
    A = ((s + 1) / 3) * 100;
  return (
    <>
      <section ref={g} className="relative overflow-hidden pt-36 pb-12 sm:pt-44">
        <div className="dot-grid-dark pointer-events-none absolute inset-0 opacity-60" />
        <motion.div
          style={{
            y,
            opacity: v,
          }}
          className="container-x relative"
        >
          <SplitText text="Book your free growth call." as="h1" className="display-lg mt-6 max-w-4xl" />
          <Reveal delay={0.25}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-500 sm:text-lg">
              Thirty minutes, zero pitch. We'll tear down your funnel live and hand you three moves you can
              ship this month.
            </p>
          </Reveal>
        </motion.div>
      </section>
      <section className="container-x pb-24">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <Stagger className="flex flex-col gap-5" gap={0.1}>
            <StaggerItem>
              <div className="relative overflow-hidden rounded-[1.75rem] bg-pine-800 p-8 text-cream-50">
                <div className="dot-grid absolute inset-0 opacity-60" />
                <div className="relative">
                  <p className="text-xs font-extrabold text-mint-300">
                    What happens next
                  </p>
                  <ul className="mt-5 flex flex-col gap-4">
                    {[
                      {
                        icon: AtSign,
                        t: "We reply within 24 hours",
                        d: "A partner (not a bot) confirms your slot.",
                      },
                      {
                        icon: CalendarCheck,
                        t: "30-minute teardown call",
                        d: "Live funnel review + three shippable moves.",
                      },
                      {
                        icon: Clock,
                        t: "Proposal in 48 hours",
                        d: "Fixed scope, fixed price, start date included.",
                      },
                    ].map((R, V) => (
                      <li key={R.t} className="flex gap-4">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cream-50/10">
                          <R.icon className="h-5 w-5 text-mint-300" />
                        </span>
                        <div>
                          <p className="text-sm font-extrabold">
                            <span className="mr-2 text-mint-300">0{V + 1}</span>
                            {R.t}
                          </p>
                          <p className="mt-1 text-[13px] text-cream-50/60">{R.d}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="rounded-[1.75rem] border border-ink-900/10 bg-white/70 p-8">
                <p className="text-xs font-extrabold text-ink-400">
                  Prefer email or foot traffic?
                </p>
                <a
                  href="mailto:hello@kora.agency"
                  className="mt-3 block text-xl font-extrabold text-pine-800 transition-colors hover:text-pine-600"
                >
                  hello@kora.agency
                </a>
                <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-ink-500">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pine-700" />
                  48 Mercer Street, SoHo
                  <br />
                  New York, NY 10013
                </p>
                <p className="mt-3 flex items-center gap-2 text-sm text-ink-500">
                  <Clock className="h-4 w-4 text-pine-700" />
                  {" Mon–Fri, 9:00–18:00 ET"}
                </p>
              </div>
            </StaggerItem>
          </Stagger>
          <Reveal delay={0.15}>
            <div className="relative overflow-hidden rounded-[1.75rem] border border-ink-900/10 bg-white p-7 shadow-[0_30px_80px_-30px_rgba(14,16,14,0.3)] sm:p-10">
              <AnimatePresence mode="wait">
                {h === "success" ? (
                  <motion.div
                    key={"success"}
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
                    className="flex min-h-105 flex-col items-center justify-center py-10 text-center"
                  >
                    <motion.span
                      initial={{
                        scale: 0,
                      }}
                      animate={{
                        scale: 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 12,
                        delay: 0.15,
                      }}
                      className="grid h-20 w-20 place-items-center rounded-full bg-pine-700 text-cream-50"
                    >
                      <Check className="h-9 w-9" strokeWidth={3} />
                    </motion.span>
                    <h2 className="display-md mt-7">You're booked in.</h2>
                    <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-500">
                      {"Thanks "}
                      {l.name.split(" ")[0] || "there"}
                      {", your slot"}
                      {l.slot ? (
                        <>
                          {" on "}
                          <strong className="text-ink-900">{l.slot}</strong>
                        </>
                      ) : (
                        ""
                      )}
                      {" is held. A calendar invite and a short prep form are on their way to"}{" "}
                      <strong className="text-ink-900">{l.email}</strong>.
                    </p>
                    <button
                      onClick={() => {
                        (m("idle"), n(0), r(emptyForm));
                      }}
                      className="mt-8 rounded-full border border-ink-900/15 px-6 py-3 text-sm font-extrabold transition-colors hover:bg-ink-900 hover:text-cream-50"
                    >
                      Book another call
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key={"form"}
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    onSubmit={O}
                    noValidate={!0}
                  >
                    <div className="flex items-center gap-3">
                      {contactSteps.map((R, V) => (
                        <div key={R} className="flex flex-1 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => V < s && n(V)}
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-extrabold transition-all ${V < s ? "bg-pine-700 text-cream-50" : V === s ? "bg-ink-900 text-cream-50" : "bg-cream-100 text-ink-400"}`}
                          >
                            {V < s ? <Check className="h-4 w-4" strokeWidth={3} /> : V + 1}
                          </button>
                          <span
                            className={`hidden text-xs font-extrabold sm:block ${V === s ? "text-ink-900" : "text-ink-400"}`}
                          >
                            {R}
                          </span>
                          {V < 2 && <span className="h-px flex-1 bg-ink-900/10" />}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-cream-100">
                      <motion.div
                        className="h-full rounded-full bg-pine-600"
                        animate={{
                          width: `${A}%`,
                        }}
                        transition={{
                          duration: 0.5,
                          ease: EASE,
                        }}
                      />
                    </div>
                    <AnimatePresence mode="wait">
                      {s === 0 && (
                        <motion.div
                          key={"s0"}
                          initial={{
                            opacity: 0,
                            x: 40,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: -40,
                          }}
                          transition={{
                            duration: 0.45,
                            ease: EASE,
                          }}
                          className="mt-8 flex flex-col gap-4"
                        >
                          <h2 className="text-2xl font-extrabold tracking-tight">First, the basics.</h2>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block">
                              <span className="mb-1.5 block text-xs font-extrabold text-ink-500">
                                Full name *
                              </span>
                              <input
                                className={`field ${d.name ? "field-error" : ""}`}
                                placeholder="Ada Lovelace"
                                value={l.name}
                                onChange={(R) => S("name", R.target.value)}
                              />
                              {d.name && (
                                <span className="mt-1 block text-xs font-bold text-red-700">
                                  Please enter your name.
                                </span>
                              )}
                            </label>
                            <label className="block">
                              <span className="mb-1.5 block text-xs font-extrabold text-ink-500">
                                Work email *
                              </span>
                              <input
                                type="email"
                                className={`field ${d.email ? "field-error" : ""}`}
                                placeholder="ada@company.com"
                                value={l.email}
                                onChange={(R) => S("email", R.target.value)}
                              />
                              {d.email && (
                                <span className="mt-1 block text-xs font-bold text-red-700">
                                  That email doesn't look right.
                                </span>
                              )}
                            </label>
                          </div>
                          <label className="block">
                            <span className="mb-1.5 block text-xs font-extrabold text-ink-500">
                              Company *
                            </span>
                            <input
                              className={`field ${d.company ? "field-error" : ""}`}
                              placeholder="Analytical Engines Inc."
                              value={l.company}
                              onChange={(R) => S("company", R.target.value)}
                            />
                            {d.company && (
                              <span className="mt-1 block text-xs font-bold text-red-700">
                                Please enter your company.
                              </span>
                            )}
                          </label>
                          <label className="block">
                            <span className="mb-1.5 block text-xs font-extrabold text-ink-500">
                              {"What's the #1 growth challenge? "}
                              <span className="text-ink-400 normal-case">(optional)</span>
                            </span>
                            <textarea
                              rows={3}
                              className="field resize-none"
                              placeholder="e.g. Pipeline stalled at $2M ARR, demos don't convert…"
                              value={l.message}
                              onChange={(R) => S("message", R.target.value)}
                            />
                          </label>
                        </motion.div>
                      )}
                      {s === 1 && (
                        <motion.div
                          key={"s1"}
                          initial={{
                            opacity: 0,
                            x: 40,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: -40,
                          }}
                          transition={{
                            duration: 0.45,
                            ease: EASE,
                          }}
                          className="mt-8 flex flex-col gap-6"
                        >
                          <h2 className="text-2xl font-extrabold tracking-tight">Where should we aim?</h2>
                          <div>
                            <span className="mb-2 block text-xs font-extrabold text-ink-500">
                              Monthly growth budget *
                            </span>
                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                              {budgets.map((R) => (
                                <button
                                  key={R}
                                  type="button"
                                  onClick={() => S("revenue", R)}
                                  className={`rounded-2xl border-2 px-3 py-3.5 text-[13px] font-extrabold transition-all ${l.revenue === R ? "border-pine-700 bg-pine-700 text-cream-50 shadow-lg" : `border-ink-900/10 bg-cream-50 text-ink-700 hover:border-pine-700/50 ${d.revenue ? "border-red-400" : ""}`}`}
                                >
                                  {R}
                                </button>
                              ))}
                            </div>
                            {d.revenue && (
                              <span className="mt-1 block text-xs font-bold text-red-700">
                                Pick the closest range.
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="mb-2 block text-xs font-extrabold text-ink-500">
                              What do you need help with? *
                            </span>
                            <div className="flex flex-wrap gap-2.5">
                              {contactIE.map((R) => {
                                const V = l.services.includes(R);
                                return (
                                  <button
                                    key={R}
                                    type="button"
                                    onClick={() => T(R)}
                                    className={`rounded-full border-2 px-4 py-2.5 text-[13px] font-extrabold transition-all ${V ? "border-ink-900 bg-ink-900 text-cream-50" : `border-ink-900/12 bg-cream-50 text-ink-600 hover:border-ink-900/40 ${d.services ? "border-red-400" : ""}`}`}
                                  >
                                    {V ? "✓ " : "+ "}
                                    {R}
                                  </button>
                                );
                              })}
                            </div>
                            {d.services && (
                              <span className="mt-1 block text-xs font-bold text-red-700">
                                Choose at least one.
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )}
                      {s === 2 && (
                        <motion.div
                          key={"s2"}
                          initial={{
                            opacity: 0,
                            x: 40,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          exit={{
                            opacity: 0,
                            x: -40,
                          }}
                          transition={{
                            duration: 0.45,
                            ease: EASE,
                          }}
                          className="mt-8 flex flex-col gap-6"
                        >
                          <h2 className="text-2xl font-extrabold tracking-tight">Pick your slot.</h2>
                          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                            {contactE.map((R) => (
                              <button
                                key={R}
                                type="button"
                                onClick={() => {
                                  S("slot", R);
                                }}
                                className={`rounded-2xl border-2 px-3 py-4 text-sm font-extrabold transition-all ${l.slot === R ? "border-pine-700 bg-pine-700 text-cream-50 shadow-lg" : `border-ink-900/10 bg-cream-50 text-ink-700 hover:border-pine-700/50 ${d.slot ? "border-red-400" : ""}`}`}
                              >
                                {R}
                              </button>
                            ))}
                          </div>
                          {d.slot && (
                            <span className="-mt-3 block text-xs font-bold text-red-700">
                              Pick a time that suits you.
                            </span>
                          )}
                          <div className="rounded-2xl bg-cream-100/70 p-5 text-sm leading-relaxed text-ink-600">
                            <strong className="text-ink-900">Your booking summary:</strong> {l.name || ", "}
                            {", "}
                            {l.company || ", "}
                            {", "}
                            {l.revenue || ", "}
                            {", "}
                            {l.services.join(", ") || ", "}
                          </div>
                          {h === "error" && (
                            <motion.p
                              initial={{
                                opacity: 0,
                                y: 8,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                              }}
                              className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700"
                            >
                              Something went wrong sending your booking. Please try again, your details are
                              saved.
                            </motion.p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="mt-8 flex items-center justify-between gap-3">
                      {s > 0 ? (
                        <button
                          type="button"
                          onClick={() => n(s - 1)}
                          className="rounded-full border border-ink-900/15 px-6 py-3.5 text-sm font-extrabold transition-colors hover:bg-cream-100"
                        >
                          Back
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-ink-400">Step 1 of 3</span>
                      )}
                      <button
                        type="submit"
                        disabled={h === "sending"}
                        className="group inline-flex items-center gap-2 rounded-full bg-ink-900 px-8 py-3.5 text-sm font-extrabold text-cream-50 transition-all hover:bg-pine-700 disabled:opacity-70"
                      >
                        {h === "sending" ? (
                          <>
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            {" Booking…"}
                          </>
                        ) : s < 2 ? (
                          <>
                            {"Continue "}
                            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </>
                        ) : (
                          <>
                            {"Confirm booking "}
                            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </>
                        )}
                      </button>
                    </div>
                    <p className="mt-5 text-center text-xs font-semibold text-ink-400">
                      No spam, no nurture sequences. Just one useful call.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
