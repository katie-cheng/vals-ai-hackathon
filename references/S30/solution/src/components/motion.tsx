import { motion, useReducedMotion } from "motion/react";
import { useState, useEffect, useRef } from "react";

// One easing and two durations for the whole site (DESIGN-SYSTEM.md, Motion).
export const EASE = [0.22, 1, 0.36, 1];
export const DUR = 0.5;

/** Entrance: a short fade with a 12px rise, once, in document order. */
export function Reveal({ children, delay = 0, className }: any) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: DUR, delay: Math.min(delay, 0.24), ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className }: any) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-8% 0px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: any) {
  return (
    <motion.div className={className} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: DUR, ease: EASE } } }}>
      {children}
    </motion.div>
  );
}

/** A heading that fades in as one block (the original split it into clipped words). */
export function Heading({ text, as = "h2", className }: any) {
  const reduce = useReducedMotion();
  const Tag: any = (motion as any)[as];
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: DUR, ease: EASE }}
    >
      {text}
    </Tag>
  );
}

/** Counts up once when scrolled into view; tabular figures, final value under reduced motion. */
export function CountUp({ value, decimals = 0, prefix = "", suffix = "", duration = 1.2, className }: any) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const final = Number(value).toFixed(decimals);
  const [shown, setShown] = useState(final);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    let raf = 0;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started) return;
        started = true;
        // Start at the smallest number with as many digits as the final one: with tabular figures the width never changes.
        const from = value >= 10 ? Math.pow(10, Math.floor(Math.log10(value))) : 0;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min((t - t0) / (duration * 1000), 1);
          setShown((from + (value - from) * (1 - Math.pow(1 - p, 3))).toFixed(decimals));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, decimals, duration, reduce]);
  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`} aria-label={`${prefix}${final}${suffix}`}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

/** Image in a fixed-ratio frame; fades in, never scales or clips. */
export function RevealImage({ src, alt, className, imgClassName, eager = false }: any) {
  return (
    <Reveal className={`overflow-hidden rounded-lg bg-cream-200 ${className ?? ""}`}>
      <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" className={imgClassName ?? "h-full w-full object-cover"} />
    </Reveal>
  );
}
