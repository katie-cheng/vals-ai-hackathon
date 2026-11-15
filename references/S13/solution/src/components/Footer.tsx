import * as React from "react";
import { SITE } from "../data/content";
import { Reveal } from "../lib/anim";
import { WaveDivider } from "../lib/fx";
import { Logo } from "./Header";
import { motion } from "framer-motion";
import { ArrowUp, Link2 } from "lucide-react";

function Footer() {
  const [a, i] = React.useState(null),
    r = async () => {
      const l = window.location.href;
      try {
        navigator.share
          ? (await navigator.share({
              title: SITE.name,
              url: l,
            }),
            i("Website shared."))
          : (await navigator.clipboard.writeText(l), i("Website link copied."));
      } catch {
        i("Copy the link from your browser address bar.");
      }
      setTimeout(() => i(null), 3200);
    };
  return (
    <footer className="bg-tone-c relative overflow-hidden">
      <WaveDivider
        color="#06283d"
        className="relative z-10 -mb-px h-16 w-full sm:h-24"
        flip
      />
      <div className="relative bg-[#06283d]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
        </div>
        <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-14 sm:px-10 lg:px-16 sm:pt-20">
          <Reveal>
            <motion.p
              className="font-serif-d mt-4 text-[2.2rem] font-medium leading-tight text-white sm:text-5xl"
              initial={{
                opacity: 0,
                y: 60,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              Ready when{" "}
              your home{" "}
              is.
            </motion.p>
          </Reveal>
          <div className="mt-14 grid gap-10 border-t border-white/10 pt-10 md:grid-cols-[2fr_1fr_1fr] grid-12 split-6-3-3">
            <div>
              <Logo />
              <button
                onClick={r}
                aria-label="Share this website"
                title="Share this website"
                className="group mt-5 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition-all duration-300 hover:border-cyan-300/50 hover:bg-cyan-300/10"
              >
                <Link2 className="h-4 w-4 text-cyan-300 transition-transform duration-300" />
              </button>
              {a && (
                <motion.p
                  initial={{
                    opacity: 0,
                    y: 6,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mt-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-cyan-200"
                  role="status"
                > {a}
                </motion.p>
              )}
            </div>
            <nav aria-label="Footer">
              <p className="mb-4 text-[12px] font-medium uppercase tracking-[0.08em] text-sky-200/60">
                Explore
              </p>
              <ul className="space-y-1">
                {[
                  ["Services", "#services"],
                  ["Before and after", "#results"],
                  ["Process", "#process"],
                  ["Pricing", "#pricing"],
                  ["Service area", "#areas"],
                  ["FAQ", "#faq"],
                ].map(([l, u]) => (
                  <li key={u}>
                    <a
                      href={u}
                      className="group inline-flex items-center gap-0 text-[14.5px] font-semibold text-sky-100/75 transition-colors duration-300 hover:text-white"
                    >
                      <span className="h-px w-0 bg-cyan-300 transition-all duration-300 group-hover:mr-2 group-hover:w-5" />
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div>
              <p className="mb-4 text-[12px] font-medium uppercase tracking-[0.08em] text-sky-200/60">
                Contact
              </p>
              <ul className="space-y-3 text-[14.5px] font-semibold">
                <li>
                  <a
                    href={SITE.phoneHref}
                    className="group flex items-center gap-2.5 text-sky-100/80 transition hover:text-white"
                  >
                    {SITE.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={SITE.emailHref}
                    className="group flex items-center gap-2.5 break-all text-sky-100/80 transition hover:text-white"
                  >
                    {SITE.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-7 sm:flex-row">
            <p className="text-[12.5px] text-sky-200/50">
              © {new Date().getFullYear()} {SITE.name}
            </p>
            <div>
              <a
                href="#top"
                aria-label="Back to top"
                className="group grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition-all duration-300 hover:border-cyan-300/60 hover:bg-cyan-300/15"
              >
                <ArrowUp className="h-5 w-5 text-cyan-300 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
