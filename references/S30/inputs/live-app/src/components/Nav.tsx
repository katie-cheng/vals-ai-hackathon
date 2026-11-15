import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE, Magnetic } from "./motion";
import { ArrowUpRight, Menu, X } from "lucide-react";

const navLinks = [
  {
    to: "/",
    label: "Home",
  },
  {
    to: "/about",
    label: "About",
  },
  {
    to: "/services",
    label: "Services",
  },
  {
    to: "/work",
    label: "Work",
  },
  {
    to: "/pricing",
    label: "Pricing",
  },
  {
    to: "/insights",
    label: "Insights",
  },
];
export function Logo({ dark: s = !1, compact: n = !1 }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Kora home">
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-pine-700 text-cream-50 transition-transform duration-500 group-hover:rotate-[10deg]">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
        >
          <path d="M12 21c-5 0-8-3.5-8-8 0-5 4-9 10-10-.5 6-1.5 12-6 14" />
          <path d="M12 21c5 0 8-3.5 8-8" opacity={0.5} />
        </svg>
      </span>
      {!n && (
        <span className={`text-xl font-extrabold tracking-tight ${s ? "text-cream-50" : "text-ink-900"}`}>
          kora<span className="text-pine-500">.</span>
        </span>
      )}
    </Link>
  );
}
export function Nav() {
  const [s, n] = useState(!1),
    [l, r] = useState(!1),
    [d, f] = useState(!1),
    h = useLocation();
  return (
    useEffect(() => {
      let m = window.scrollY;
      const g = () => {
        const x = window.scrollY;
        (n(x > 24), f(x > 420 && x > m + 4 && !l), (m = x));
      };
      return (
        g(),
        window.addEventListener("scroll", g, {
          passive: !0,
        }),
        () => window.removeEventListener("scroll", g)
      );
    }, [l]),
    useEffect(() => {
      r(!1);
    }, [h.pathname]),
    useEffect(
      () => (
        (document.body.style.overflow = l ? "hidden" : ""),
        () => {
          document.body.style.overflow = "";
        }
      ),
      [l],
    ),
    (
      <>
        <motion.header
          initial={{
            y: -80,
            opacity: 0,
          }}
          animate={{
            y: d ? "-110%" : "0%",
            opacity: 1,
          }}
          transition={{
            duration: 0.7,
            ease: EASE,
          }}
          className="fixed inset-x-0 top-0 z-50"
        >
          <div
            className={`mx-auto flex max-w-6xl items-center justify-between gap-4 transition-all duration-500 ${s ? "mt-3 max-w-5xl rounded-2xl border border-ink-900/10 bg-cream-50/85 px-4 py-3 shadow-[0_12px_40px_-16px_rgba(14,16,14,0.35)] backdrop-blur-xl sm:mx-4 lg:mx-auto" : "bg-transparent px-5 py-5 sm:px-8"}`}
          >
            <Logo />
            <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
              {navLinks.map((m) => (
                <NavLink
                  key={m.to}
                  to={m.to}
                  className={({ isActive: g }) =>
                    `nav-link text-[13.5px] font-bold tracking-wide transition-colors ${g ? "active text-pine-700" : "text-ink-900/70 hover:text-ink-900"}`
                  }
                >
                  {m.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <Magnetic strength={0.25} className="hidden sm:block">
                <Link
                  to="/contact"
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-ink-900 px-5 py-2.5 text-[13.5px] font-bold text-cream-50"
                >
                  <span className="absolute inset-0 translate-y-full rounded-full bg-pine-600 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
                  <span className="relative">Book a call</span>
                  <ArrowUpRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Magnetic>
              <button
                onClick={() => r(!0)}
                className="grid h-10 w-10 place-items-center rounded-full border border-ink-900/15 bg-white/60 text-ink-900 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.header>
        <AnimatePresence>
          {l && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.35,
              }}
              className="fixed inset-0 z-[60] flex flex-col bg-pine-950 text-cream-50"
            >
              <div className="dot-grid pointer-events-none absolute inset-0 opacity-60" />
              <div className="relative flex items-center justify-between px-5 py-5 sm:px-8">
                <Logo dark={!0} />
                <button
                  onClick={() => r(!1)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-cream-50/20"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav
                className="relative flex flex-1 flex-col justify-center gap-1 overflow-y-auto px-6 sm:px-10"
                aria-label="Mobile"
              >
                {navLinks.map((m, g) => (
                  <span key={m.to} className="overflow-hidden">
                    <motion.span
                      className="block"
                      initial={{
                        y: "110%",
                      }}
                      animate={{
                        y: "0%",
                      }}
                      exit={{
                        y: "110%",
                        transition: {
                          duration: 0.3,
                          delay: 0,
                        },
                      }}
                      transition={{
                        duration: 0.7,
                        delay: 0.08 + g * 0.06,
                        ease: EASE,
                      }}
                    >
                      <NavLink
                        to={m.to}
                        className={({ isActive: x }) =>
                          `group flex items-baseline gap-4 py-1.5 text-5xl font-extrabold tracking-tight sm:text-6xl ${x ? "text-mint-300" : "text-cream-50"}`
                        }
                      >
                        <span className="text-sm font-bold text-cream-50/40">0{g + 1}</span>
                        <span className="transition-transform duration-500 group-hover:translate-x-3">
                          {m.label}
                        </span>
                      </NavLink>
                    </motion.span>
                  </span>
                ))}
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.5,
                    duration: 0.6,
                    ease: EASE,
                  }}
                  className="mt-8"
                >
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-full bg-mint-300 px-7 py-3.5 text-sm font-extrabold text-pine-950"
                  >
                    {"Book a call "}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </nav>
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 0.6,
                }}
                className="relative flex items-center justify-between border-t border-cream-50/10 px-6 py-5 text-xs font-semibold text-cream-50/50 sm:px-10"
              >
                <span>hello@kora.agency</span>
                <span>© 2026 Kora</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  );
}
