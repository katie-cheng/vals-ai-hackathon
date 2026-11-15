import * as React from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1],
  REDUCED =
    typeof window < "u" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function SplitWords({
  text: a,
  className: i = "",
  delay: r = 0,
  stagger: l = 0.055,
  as: u = "span",
}) {
  const h = a.split(" "),
    d = React.useRef(null),
    p = useInView(d, {
      once: true,
      margin: "-8% 0px",
    }),
    y = (
      <>
        {h.map((b, v) => (
          <span
            key={v}
            className="inline-block"
            aria-hidden
          >
            <motion.span
              className="inline-block will-change-transform"
              initial={{
                y: "0.35em",
                opacity: 0,
              }}
              animate={
                p
                  ? {
                      y: "0em",
                      opacity: 1,
                    }
                  : {}
              }
              transition={{
                duration: 0.85,
                ease: EASE,
                delay: r + v * l,
              }}
            >
              {b}
            </motion.span>
            {v < h.length - 1 ? <span>{" "}</span> : null}
          </span>
        ))}
      </>
    );
  return u === "h1" ? (
    <h1 ref={d} className={i} aria-label={a}>
      {y}
    </h1>
  ) : u === "h2" ? (
    <h2 ref={d} className={i} aria-label={a}>
      {y}
    </h2>
  ) : u === "p" ? (
    <p ref={d} className={i} aria-label={a}>
      {y}
    </p>
  ) : (
    <span ref={d} className={i} aria-label={a}>
      {y}
    </span>
  );
}

function Reveal({
  children: a,
  delay: i = 0,
  y: r = 44,
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
        duration: 0.9,
        ease: EASE,
        delay: i,
      }}
    >
      {a}
    </motion.div>
  );
}

function Magnetic({ children: a, strength: i = 0.35, className: r = "" }) {
  const l = React.useRef(null),
    u = useMotionValue(0),
    h = useMotionValue(0),
    d = useSpring(u, {
      stiffness: 220,
      damping: 16,
      mass: 0.4,
    }),
    p = useSpring(h, {
      stiffness: 220,
      damping: 16,
      mass: 0.4,
    });
  return (
    <motion.div
      ref={l}
      className={r}
      style={{
        x: d,
        y: p,
      }}
      onMouseMove={(y) => {
        const b = l.current?.getBoundingClientRect();
        b &&
          (u.set((y.clientX - b.left - b.width / 2) * i),
          h.set((y.clientY - b.top - b.height / 2) * i));
      }}
      onMouseLeave={() => {
        (u.set(0), h.set(0));
      }}
    >
      {a}
    </motion.div>
  );
}

function Tilt({ children: a, className: i = "", max: r = 10 }) {
  const l = React.useRef(null),
    u = useMotionValue(0),
    h = useMotionValue(0),
    d = useSpring(u, {
      stiffness: 180,
      damping: 18,
    }),
    p = useSpring(h, {
      stiffness: 180,
      damping: 18,
    });
  return (
    <motion.div
      ref={l}
      className={`card-3d ${i}`}
      style={{
        rotateX: d,
        rotateY: p,
      }}
      onMouseMove={(y) => {
        const b = l.current?.getBoundingClientRect();
        if (!b) return;
        const v = (y.clientX - b.left) / b.width - 0.5,
          g = (y.clientY - b.top) / b.height - 0.5;
        (u.set(-g * r), h.set(v * r));
      }}
      onMouseLeave={() => {
        (u.set(0), h.set(0));
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

export { EASE, REDUCED, SplitWords, Reveal, Magnetic, Tilt, CountUp };
