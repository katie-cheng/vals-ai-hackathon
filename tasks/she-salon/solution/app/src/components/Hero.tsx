import { motion } from "motion/react";
import { WHATSAPP_URL } from "../content";
import { EASE } from "./Reveal";

export function Hero() {
  return (
    <section id="home" className="relative grid min-h-[100svh] bg-ivory lg:grid-cols-[1.05fr_1fr]">
      <div className="relative order-2 flex items-center px-5 pt-12 pb-20 sm:px-8 lg:order-1 lg:pt-[4.5rem] lg:pb-12 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE }} className="max-w-xl">
          <h1 className="text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-[4.4rem]">Beauty is an art. Let us make you the masterpiece.</h1>
          <p className="mt-7 max-w-md text-lg text-muted">Discover your beauty with expert care, professional styling, and a touch of luxury.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
              Book your appointment
            </a>
            <a href="#services" className="btn btn-outline">
              Explore our services
            </a>
          </div>
          <p className="mt-12 max-w-md border-t border-ink/15 pt-6 text-[0.95rem] text-muted">
            SHE Salon &amp; Make-up Studio is a women-only salon in Jhusi, Prayagraj, for bridal and occasion makeup, hair, brows, lashes and skin care.
          </p>
        </motion.div>
      </div>
      <div className="relative order-1 h-[58svh] min-h-80 overflow-hidden lg:order-2 lg:h-auto">
        <motion.img
          src="/images/hero.jpg"
          alt="Woman with soft pink and gold glam makeup and traditional kundan jewellery, eyes closed"
          width={1067}
          height={1600}
          fetchPriority="high"
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
          className="absolute inset-0 size-full object-cover object-[50%_30%]"
        />
      </div>
    </section>
  );
}
