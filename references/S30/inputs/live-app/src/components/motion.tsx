import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export const EASE = [0.22, 1, 0.36, 1];
export function Reveal({ children: s, delay: n = 0, y: l = 44, className: r, once: d = !0 }) {
  return (
    <motion.div
      className={r}
      initial={{
        opacity: 0,
        y: l,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: d,
        margin: "-12% 0px",
      }}
      transition={{
        duration: 0.9,
        delay: n,
        ease: EASE,
      }}
    >
      {s}
    </motion.div>
  );
}
export function Stagger({ children: s, className: n, delay: l = 0, gap: r = 0.09 }) {
  const d = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: r,
        delayChildren: l,
      },
    },
  };
  return (
    <motion.div
      className={n}
      variants={d}
      initial="hidden"
      whileInView="show"
      viewport={{
        once: !0,
        margin: "-10% 0px",
      }}
    >
      {s}
    </motion.div>
  );
}
export function StaggerItem({ children: s, className: n, y: l = 36 }) {
  const r = {
    hidden: {
      opacity: 0,
      y: l,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.85,
        ease: EASE,
      },
    },
  };
  return (
    <motion.div className={n} variants={r}>
      {s}
    </motion.div>
  );
}
export function SplitText({
  text: s,
  className: n,
  as: l = "span",
  delay: r = 0,
  stagger: d = 0.035,
  once: f = !0,
}) {
  const h = s.split(" "),
    m = {
      hidden: {},
      show: {
        transition: {
          staggerChildren: d,
          delayChildren: r,
        },
      },
    },
    g = {
      hidden: {
        y: "115%",
        rotate: 3,
      },
      show: {
        y: "0%",
        rotate: 0,
        transition: {
          duration: 0.9,
          ease: EASE,
        },
      },
    },
    x = motion[l] ?? motion.span;
  return (
    <x
      className={n}
      variants={m}
      initial="hidden"
      whileInView="show"
      viewport={{
        once: f,
        margin: "-8% 0px",
      }}
      aria-label={s}
    >
      {h.map((y, v) => (
        <span
          key={v}
          className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom"
          aria-hidden={!0}
        >
          <motion.span className="inline-block will-change-transform" variants={g}>
            {y}
            {v < h.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </x>
  );
}
export function CountUp({
  value: s,
  decimals: n = 0,
  prefix: l = "",
  suffix: r = "",
  duration: d = 1.8,
  className: f,
}) {
  const h = useRef(null),
    [m, g] = useState("0"),
    x = useRef(!1);
  return (
    useEffect(() => {
      const y = h.current;
      if (!y) return;
      const v = new IntersectionObserver(
        (S) => {
          if (S[0].isIntersecting && !x.current) {
            x.current = !0;
            const T = performance.now(),
              j = (O) => {
                const A = Math.min((O - T) / (d * 1e3), 1),
                  R = 1 - Math.pow(1 - A, 4);
                (g((s * R).toFixed(n)), A < 1 && requestAnimationFrame(j));
              };
            requestAnimationFrame(j);
          }
        },
        {
          threshold: 0.4,
        },
      );
      return (v.observe(y), () => v.disconnect());
    }, [s, n, d]),
    (
      <span ref={h} className={f}>
        {l}
        {m}
        {r}
      </span>
    )
  );
}
export function Magnetic({ children: s, strength: n = 0.35, className: l }) {
  const r = useRef(null),
    [d, f] = useState({
      x: 0,
      y: 0,
    });
  return (
    <motion.div
      ref={r}
      className={l}
      animate={{
        x: d.x,
        y: d.y,
      }}
      transition={{
        type: "spring",
        stiffness: 180,
        damping: 14,
        mass: 0.4,
      }}
      onMouseMove={(h) => {
        const m = r.current?.getBoundingClientRect();
        m &&
          f({
            x: (h.clientX - (m.left + m.width / 2)) * n,
            y: (h.clientY - (m.top + m.height / 2)) * n,
          });
      }}
      onMouseLeave={() =>
        f({
          x: 0,
          y: 0,
        })
      }
    >
      {s}
    </motion.div>
  );
}
export function ParallaxImage({ src: s, alt: n, className: l, imgClassName: r }) {
  return (
    <motion.div
      className={l}
      initial={{
        clipPath: "inset(12% 8% 12% 8% round 32px)",
        opacity: 0.3,
      }}
      whileInView={{
        clipPath: "inset(0% 0% 0% 0% round 28px)",
        opacity: 1,
      }}
      viewport={{
        once: !0,
        margin: "-10% 0px",
      }}
      transition={{
        duration: 1.25,
        ease: EASE,
      }}
      style={{
        overflow: "hidden",
      }}
    >
      <motion.img
        src={s}
        alt={n}
        loading="lazy"
        className={r ?? "h-full w-full object-cover"}
        initial={{
          scale: 1.18,
        }}
        whileInView={{
          scale: 1,
        }}
        viewport={{
          once: !0,
          margin: "-10% 0px",
        }}
        transition={{
          duration: 1.5,
          ease: EASE,
        }}
      />
    </motion.div>
  );
}
export function SectionTag({ children: s, dark: n = !1 }) {
  return (
    <Reveal y={20}>
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold tracking-[0.18em] uppercase ${n ? "border-cream-50/20 bg-cream-50/5 text-mint-200" : "border-ink-900/15 bg-white/70 text-pine-700"}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full animate-pulse-dot ${n ? "bg-mint-300" : "bg-pine-600"}`} />
        {s}
      </span>
    </Reveal>
  );
}
