import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { MapPin } from "lucide-react";
import { EASE } from "./Reveal";

const HEADING_LINES = ["Your Beauty,", "Your Confidence,", "Our Passion."];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);

  return (
    <section id="home" ref={ref} className="relative overflow-hidden">
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:min-h-[calc(100svh-76px)] lg:grid-cols-12 lg:gap-8 lg:py-16">
        <div className="lg:col-span-6">
          <h1 className="text-[3.1rem] leading-[1.02] sm:text-7xl lg:text-[5.4rem]">
            {HEADING_LINES.map((line, i) => (
              <motion.span
                key={line}
                className="block"
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.15 + i * 0.14, ease: EASE }}
              >
                {line}
              </motion.span>
            ))}
          </h1>
          <motion.p
            className="mt-7 max-w-xl text-lg text-charcoal/80 sm:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: EASE }}
          >
            Discover a beautiful experience where elegance meets care. Welcome to ZEE Beauty Saloon, your beauty destination in Mughalpura, Lahore.
          </motion.p>
          <motion.div
            className="mt-9 flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.75, ease: EASE }}
          >
            <a href="#services" className="btn btn-outline">
              Explore Our Services
            </a>
            <a href="#booking" className="btn btn-dark">
              Book Your Appointment
            </a>
          </motion.div>
          <motion.p
            className="mt-8 flex items-center gap-2 text-[0.95rem] text-charcoal/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.95 }}
          >
            <MapPin size={18} className="shrink-0 text-rose-deep" aria-hidden="true" />
            Mian Mir Market, Main Bazar, Mughalpura
          </motion.p>
        </div>

        <div className="relative lg:col-span-6 lg:pl-6">
          <motion.div
            className="relative aspect-[4/5] overflow-hidden rounded-lg bg-blush shadow-[0_30px_60px_-30px_rgba(41,35,41,0.45)] sm:aspect-[5/4] lg:aspect-[4/5]"
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: 1.3, delay: 0.2, ease: EASE }}
          >
            <motion.img
              src="/images/hero.jpg"
              alt="Woman with soft pink and gold glam makeup and traditional kundan jewellery, eyes closed"
              style={{ y: imageY, scale: 1.12 }}
              className="absolute inset-0 size-full object-cover"
              fetchPriority="high"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
