import * as React from "react";
import { SITE } from "../data/content";
import { Magnetic, Reveal } from "../lib/anim";
import { Bubbles, WaveDivider } from "../lib/fx";
import { Logo } from "./Header";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUp,
  Check,
  Droplets,
  Link2,
  Mail,
  Phone,
} from "lucide-react";

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
    <footer className="relative overflow-hidden">
      <WaveDivider
        color="#06283d"
        className="relative z-10 -mb-px h-16 w-full sm:h-24"
        flip
      />
      <div className="relative bg-[#06283d]">
        <Bubbles count={20} className="opacity-60" />
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="animate-drift absolute -right-32 top-10 h-96 w-96 rounded-full bg-cyan-400/15 blur-[130px]" />
          <div
            className="animate-drift absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-sky-500/15 blur-[120px]"
            style={{
              animationDelay: "-8s",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20">
          <Reveal className="text-center">
            <p className="text-[15px] font-semibold text-cyan-300">
              A clean home starts with a clear plan.
            </p>
            <motion.p
              className="font-serif-d mt-4 text-[11.5vw] font-semibold leading-[0.95] text-white sm:text-7xl lg:text-8xl"
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
              <span className="animate-shine-text bg-gradient-to-r from-cyan-200 via-white to-cyan-200 bg-clip-text text-transparent">
                your home
              </span>{" "}
              is.
            </motion.p>
          </Reveal>
          <Reveal delay={0.2} className="mt-9 flex justify-center">
            <Magnetic>
              <a
                href="#quote"
                className="shine-sweep group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-cyan-300 bg-[length:200%_auto] px-9 py-4 text-base font-black text-[#04141f] shadow-[0_20px_60px_-12px_rgba(34,211,238,.8)] transition-all duration-500 hover:bg-right"
              >
                <Droplets className="h-5 w-5 transition-transform duration-500 group-hover:rotate-[20deg] group-hover:scale-125" />
                Get a free quote
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
              </a>
            </Magnetic>
          </Reveal>
          <div className="mt-14 grid gap-10 border-t border-white/10 pt-10 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <Logo />
              <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-sky-100/65">
                Residential window cleaning, gutter care, house washing, and
                pressure washing throughout Connecticut.
              </p>
              <button
                onClick={r}
                aria-label="Share this website"
                title="Share this website"
                className="group mt-5 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition-all duration-300 hover:border-cyan-300/50 hover:bg-cyan-300/10"
              >
                <Link2 className="h-4 w-4 text-cyan-300 transition-transform duration-300 group-hover:rotate-[25deg]" />
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
                >
                  <Check className="h-3.5 w-3.5" /> {a}
                </motion.p>
              )}
            </div>
            <nav aria-label="Footer">
              <p className="mb-4 text-[14px] font-semibold text-sky-200/60">
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
              <p className="mb-4 text-[14px] font-semibold text-sky-200/60">
                Contact
              </p>
              <ul className="space-y-3 text-[14.5px] font-semibold">
                <li>
                  <a
                    href={SITE.phoneHref}
                    className="group flex items-center gap-2.5 text-sky-100/80 transition hover:text-white"
                  >
                    <Phone className="h-4 w-4 text-cyan-300 transition-transform duration-300 group-hover:scale-125" />
                    {SITE.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={SITE.emailHref}
                    className="group flex items-center gap-2.5 break-all text-sky-100/80 transition hover:text-white"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-cyan-300 transition-transform duration-300 group-hover:scale-125" />
                    {SITE.email}
                  </a>
                </li>
              </ul>
              <p className="mt-5 text-[12.5px] leading-relaxed text-sky-200/50">
                Serving all of Connecticut.
                <br />
                Free estimates for every service.
              </p>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-7 sm:flex-row">
            <p className="text-[12.5px] text-sky-200/50">
              © {new Date().getFullYear()} {SITE.name}
            </p>
            <Magnetic strength={0.3}>
              <a
                href="#top"
                aria-label="Back to top"
                className="group grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition-all duration-300 hover:border-cyan-300/60 hover:bg-cyan-300/15"
              >
                <ArrowUp className="h-5 w-5 text-cyan-300 transition-transform duration-300 group-hover:-translate-y-1" />
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
