import * as React from "react";
import { BeforeAfter } from "./components/BeforeAfter";
import { Faq } from "./components/Faq";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { PricingAreas } from "./components/PricingAreas";
import { Process } from "./components/Process";
import { Quote } from "./components/Quote";
import { Services } from "./components/Services";
import { Trust } from "./components/Trust";
import { SITE } from "./data/content";
import { EASE, REDUCED } from "./lib/anim";
import { ScrollProgress, WaveDivider } from "./lib/fx";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import { Droplets } from "lucide-react";

function Preloader({ done: a }) {
  return (
    React.useEffect(() => {
      const i = setTimeout(a, REDUCED ? 100 : 2100);
      return () => clearTimeout(i);
    }, [a]),
    (
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#04141f]"
        exit={{
          opacity: 0,
          scale: 1.06,
          filter: "blur(10px)",
        }}
        transition={{
          duration: 0.7,
          ease: EASE,
        }}
        aria-hidden
      >
        <motion.div
          initial={{
            scale: 0.6,
            opacity: 0,
            rotate: -20,
          }}
          animate={{
            scale: 1,
            opacity: 1,
            rotate: 0,
          }}
          transition={{
            duration: 0.8,
            ease: EASE,
          }}
          className="relative"
        >
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-cyan-300">
            <Droplets className="h-10 w-10 text-[#04141f]" strokeWidth={2.4} />
          </div>
          <span className="absolute inset-0 animate-ping rounded-3xl border-2 border-cyan-300/60" />
        </motion.div>
        <motion.p
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.3,
            duration: 0.6,
            ease: EASE,
          }}
          className="mt-6 text-base font-semibold text-white"
        >
          The Suds Squad
        </motion.p>
        <motion.div
          initial={{
            scaleX: 0,
          }}
          animate={{
            scaleX: 1,
          }}
          transition={{
            delay: 0.35,
            duration: 1.4,
            ease: "easeInOut",
          }}
          className="mt-5 h-[3px] w-52 origin-left rounded-full bg-cyan-300"
        />
        <motion.div
          className="mt-6 flex gap-1.5"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.6,
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-cyan-300"
              animate={{
                y: [0, -8, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.9,
                repeat: 1 / 0,
                delay: i * 0.12,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    )
  );
}

function App() {
  const [a, i] = React.useState(true);
  return (
    React.useEffect(() => {
      if (REDUCED) return;
      const r = new Lenis({
        lerp: 0.09,
        wheelMultiplier: 1,
      });
      let l = 0;
      const u = (d) => {
        (r.raf(d), (l = requestAnimationFrame(u)));
      };
      l = requestAnimationFrame(u);
      const h = (d) => {
        const p = d.target.closest?.('a[href^="#"]');
        if (!p) return;
        const y = document.querySelector(p.getAttribute("href"));
        y &&
          (d.preventDefault(),
          r.scrollTo(y, {
            offset: -70,
            duration: 1.4,
          }));
      };
      return (
        document.addEventListener("click", h),
        () => {
          (cancelAnimationFrame(l),
            document.removeEventListener("click", h),
            r.destroy());
        }
      );
    }, []),
    React.useEffect(
      () => (
        (document.body.style.overflow = a ? "hidden" : ""),
        () => {
          document.body.style.overflow = "";
        }
      ),
      [a],
    ),
    (
      <div className="min-h-screen bg-[#04141f] text-white">
        <a
          href="#services"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-cyan-300 focus:px-5 focus:py-2.5 focus:font-bold focus:text-[#04141f]"
        >
          Skip to main content
        </a>
        <AnimatePresence>
          {a && <Preloader done={() => i(false)} />}
        </AnimatePresence>
        <ScrollProgress />
        <Header />
        <main>
          <Hero />
          <Services />
          <BeforeAfter />
          <Process />
          <Trust />
          <PricingAreas />
          <Faq />
          <Quote />
        </main>
        <Footer />
        <span className="sr-only">{SITE.tagline}</span>
        <WaveDivider color="#06283d" className="hidden" />
      </div>
    )
  );
}

export { Preloader, App };
