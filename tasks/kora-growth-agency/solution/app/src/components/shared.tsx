import { motion, useScroll, useSpring } from "motion/react";
import { Reveal, SplitText } from "./motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

export function ScrollProgress() {
  const { scrollYProgress: s } = useScroll(),
    n = useSpring(s, {
      stiffness: 120,
      damping: 28,
      mass: 0.4,
    });
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[55] h-[3px] origin-left bg-pine-600"
      style={{
        scaleX: n,
      }}
    />
  );
}
export function CTASection({
  title: s = "Ready to turn growth into a system?",
}) {
  return (
    <section className="container-x pb-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-ink-900 px-6 py-16 text-center text-cream-50 sm:px-12 sm:py-24">
          <div className="relative mx-auto max-w-2xl">
            <SplitText text={s} as="h2" className="display-md" />
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-cream-50 px-7 py-3.5 text-sm font-bold text-ink-900 transition-colors duration-300 hover:bg-mint-300"
              >
                Book your free call
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                to="/work"
                className="inline-flex items-center gap-2 rounded-full border border-cream-50/25 px-7 py-3.5 text-sm font-bold text-cream-50 transition-colors duration-300 hover:border-cream-50/60"
              >
                See our results
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
export function BackToTop() {
  const [s, n] = useState(!1);
  return (
    useEffect(() => {
      const l = () => n(window.scrollY > 900);
      return (
        window.addEventListener("scroll", l, {
          passive: !0,
        }),
        () => window.removeEventListener("scroll", l)
      );
    }, []),
    (
      <motion.button
        initial={!1}
        animate={{
          opacity: s ? 1 : 0,
          y: s ? 0 : 16,
        }}
        style={{
          pointerEvents: s ? "auto" : "none",
        }}
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
        className="fixed right-5 bottom-5 z-40 grid h-11 w-11 place-items-center rounded-full bg-ink-900 text-lg text-cream-50 shadow-xl transition-colors hover:bg-pine-700"
        aria-label="Back to top"
      >
        ↑
      </motion.button>
    )
  );
}
