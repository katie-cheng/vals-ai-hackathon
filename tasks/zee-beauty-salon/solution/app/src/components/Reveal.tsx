import type { ReactNode } from "react";
import { motion } from "motion/react";

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Fades content up once as it scrolls into view. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const CLIP_VARIANTS = { hidden: { clipPath: "inset(100% 0% 0% 0%)" }, shown: { clipPath: "inset(0% 0% 0% 0%)" } };

/**
 * Uncovers an image from the bottom edge as it scrolls into view.
 * The clip lives on an inner layer: an element clipped to nothing never reports as intersecting on narrow viewports, so it cannot observe itself.
 */
export function ImageReveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} initial="hidden" whileInView="shown" viewport={{ once: true, margin: "-60px" }}>
      <motion.div className="absolute inset-0" variants={CLIP_VARIANTS} transition={{ duration: 1.1, ease: EASE }}>
        {children}
      </motion.div>
    </motion.div>
  );
}
