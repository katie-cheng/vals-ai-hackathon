import * as React from "react";
import { SITE } from "../data/content";
import { EASE } from "../lib/anim";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Menu, X } from "lucide-react";

const NAV = [
  {
    label: "Services",
    href: "#services",
  },
  {
    label: "Results",
    href: "#results",
  },
  {
    label: "Process",
    href: "#process",
  },
  {
    label: "Why us",
    href: "#why-us",
  },
  {
    label: "Pricing",
    href: "#pricing",
  },
  {
    label: "Areas",
    href: "#areas",
  },
  {
    label: "FAQ",
    href: "#faq",
  },
];

function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 4.6c0 0-2.6 3-2.6 4.7a2.6 2.6 0 0 0 5.2 0c0-1.7-2.6-4.7-2.6-4.7z" />
      <path d="M11.1 9.6a1 1 0 0 0 .9.8" />
      <path d="M4.5 19.4 20 6.8l15.5 12.6" />
      <path d="M27 12.3V8.2h3.4V15" />
      <path d="M8 17v16h24V17" />
      <path d="M17.5 33v-6.6a2.5 2.5 0 0 1 5 0V33" />
      <rect x="10.8" y="20.6" width="4.8" height="4.8" rx="0.4" />
      <path d="M13.2 20.6v4.8M10.8 23h4.8" />
      <rect x="24.4" y="20.6" width="4.8" height="4.8" rx="0.4" />
      <path d="M26.8 20.6v4.8M24.4 23h4.8" />
      <path d="M17.6 16.4h4.8" />
      <path d="M3.5 33h33" />
    </svg>
  );
}

function Logo({ compact: a = false }) {
  return (
    <a
      href="#top"
      className="group flex shrink-0 items-center gap-2.5 whitespace-nowrap"
      aria-label="The Suds Squad, back to top"
    >
      <LogoMark className="h-10 w-10 text-cyan-300" />
      {!a && (
        <span className="leading-none">
          <span className="block text-[15px] font-semibold tracking-tight text-white">
            {"The Suds "}
            <span className="text-cyan-300">Squad</span>
          </span>
          <span className="block text-[12px] font-medium text-sky-200/70">
            Connecticut
          </span>
        </span>
      )}
    </a>
  );
}

function Header() {
  const [a, i] = React.useState(() => window.scrollY > 40),
    [r, l] = React.useState(false),
    [u, h] = React.useState(0),
    { scrollY: d } = useScroll();
  return (
    React.useEffect(() => {
      const p = () => {
        i(window.scrollY > 40);
        const y = document.documentElement.scrollHeight - window.innerHeight;
        h(y > 0 ? Math.min(1, window.scrollY / y) : 0);
      };
      return (
        p(),
        window.addEventListener("scroll", p, {
          passive: true,
        }),
        () => window.removeEventListener("scroll", p)
      );
    }, []),
    useTransform(d, [400, 520], [0, -110]),
    (
      <>
        <motion.header
          initial={{
            y: -90,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            duration: 1,
            ease: EASE,
            delay: 0.15,
          }}
          className={`fixed inset-x-0 top-0 z-[80] transition-all duration-500 ${a ? "py-2" : "py-4"}`}
        >
          <div
            className={`mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 transition-all duration-500 sm:px-10 lg:px-16 ${a ? "rounded-lg border border-white/10 bg-[#04141f]/80 py-2 backdrop-blur-2xl" : "border border-transparent bg-transparent py-1"}`}
          >
            <Logo />
            <nav
              className="hidden items-center gap-1 xl:flex"
              aria-label="Main navigation"
            >
              {NAV.map((p) => (
                <a
                  key={p.href}
                  href={p.href}
                  className="group relative whitespace-nowrap rounded-md px-3.5 py-2 text-[13.5px] font-semibold text-sky-100/80 transition-colors duration-300 hover:text-white"
                >
                  {p.label}
                  <span className="absolute inset-x-3 -bottom-0.5 h-[2px] origin-left scale-x-0 rounded-full bg-cyan-300 transition-transform duration-300 group-hover:scale-x-100" />
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2.5">
              <a
                href={SITE.phoneHref}
                className="hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-[13px] font-medium text-white backdrop-blur transition-all duration-300 hover:border-cyan-300/50 hover:bg-cyan-300/10 md:flex"
              >
                {SITE.phoneDisplay}
              </a>
              <div>
                <a
                  href="#quote"
                  className="group hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-cyan-300 px-4 py-2 text-[13.5px] font-medium text-[#04141f] transition-all duration-300 sm:inline-flex"
                >
                  Get a free quote
                </a>
              </div>
              <button
                onClick={() => l(!r)}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur transition hover:bg-white/10 xl:hidden"
                aria-label={
                  r ? "Close navigation menu" : "Open navigation menu"
                }
              >
                {r ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div
            className="mx-auto mt-1 h-[2px] max-w-7xl overflow-hidden rounded-md px-6 sm:px-10 lg:px-16"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-cyan-300 transition-[width] duration-150"
              style={{
                width: `${u * 100}%`,
              }}
            />
          </div>
        </motion.header>
        <AnimatePresence>
          {r && (
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
                duration: 0.3,
              }}
              className="fixed inset-0 z-[75] bg-[#04141f]/70 backdrop-blur-xl xl:hidden"
              onClick={() => l(false)}
            >
              <motion.nav
                initial={{
                  x: "100%",
                }}
                animate={{
                  x: 0,
                }}
                exit={{
                  x: "100%",
                }}
                transition={{
                  duration: 0.5,
                  ease: EASE,
                }}
                className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col gap-1 overflow-y-auto border-l border-cyan-300/20 bg-[#06283d] p-7 pt-24"
                onClick={(p) => p.stopPropagation()}
                aria-label="Mobile navigation"
              >
                {NAV.map((p, y) => (
                  <motion.a
                    key={p.href}
                    href={p.href}
                    onClick={() => l(false)}
                    initial={{
                      x: 60,
                      opacity: 0,
                    }}
                    animate={{
                      x: 0,
                      opacity: 1,
                    }}
                    transition={{
                      delay: 0.06 * y + 0.1,
                      duration: 0.5,
                      ease: EASE,
                    }}
                    className="group flex items-center justify-between rounded-lg px-4 py-2.5 text-xl font-medium text-white transition hover:bg-white/5"
                  >
                    {p.label}
                  </motion.a>
                ))}
                <motion.div
                  initial={{
                    y: 30,
                    opacity: 0,
                  }}
                  animate={{
                    y: 0,
                    opacity: 1,
                  }}
                  transition={{
                    delay: 0.55,
                    duration: 0.5,
                    ease: EASE,
                  }}
                  className="mt-5 space-y-3 border-t border-white/10 pt-6"
                >
                  <p className="text-sm font-semibold text-sky-200/70">
                    Prefer to talk it through?
                  </p>
                  <a
                    href={SITE.phoneHref}
                    className="flex items-center justify-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-4 py-2.5 font-medium text-white"
                  >
                    {" Call or text "}
                    {SITE.phoneDisplay}
                  </a>
                  <a
                    href="#quote"
                    onClick={() => l(false)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 font-medium text-[#04141f]"
                  >
                    {"Request a free quote "}
                  </a>
                </motion.div>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
        {null}
      </>
    )
  );
}

export { NAV, Logo, Header };
