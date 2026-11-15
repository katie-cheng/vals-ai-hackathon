import * as React from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1],
  REDUCED =
    typeof window < "u" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function SplitWords({ text: a, className: i = "", delay: r = 0, as: u = "span" }) {
  const Tag = u === "h1" ? motion.h1 : u === "h2" ? motion.h2 : u === "p" ? motion.p : motion.span;
  return (
    <Tag
      className={i}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.5, ease: EASE, delay: r }}
    >
      {a}
    </Tag>
  );
}

function Reveal({
  children: a,
  delay: i = 0,
  y: r = 0,
  className: l = "",
  once: u = true,
}) {
  return (
    <motion.div
      className={l}
      initial={{
        opacity: 0,
        y: r,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: u,
        margin: "-10% 0px",
      }}
      transition={{
        duration: 0.5,
        ease: EASE,
        delay: i,
      }}
    >
      {a}
    </motion.div>
  );
}

function CountUp({ to: a, suffix: i = "", duration: r = 1.8 }) {
  const l = React.useRef(null),
    u = useInView(l, {
      once: true,
      margin: "-10% 0px",
    }),
    [h, d] = React.useState(0);
  return (
    React.useEffect(() => {
      if (!u) return;
      let p = 0;
      const y = performance.now(),
        b = (v) => {
          const g = Math.min(1, (v - y) / (r * 1e3)),
            S = 1 - Math.pow(1 - g, 4);
          (d(Math.round(S * a)), g < 1 && (p = requestAnimationFrame(b)));
        };
      return ((p = requestAnimationFrame(b)), () => cancelAnimationFrame(p));
    }, [u, a, r]),
    (
      <span ref={l}>
        {h.toLocaleString()}
        {i}
      </span>
    )
  );
}

export { EASE, REDUCED, SplitWords, Reveal, CountUp };
