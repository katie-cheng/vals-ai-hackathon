import { useEffect, useState } from "react";
import { motion } from "motion/react";

export function Cursor() {
  const [s, n] = useState({
      x: -100,
      y: -100,
    }),
    [l, r] = useState({
      x: -100,
      y: -100,
    }),
    [d, f] = useState(!1),
    [h, m] = useState(!1);
  return (
    useEffect(() => {
      if (!window.matchMedia("(pointer: fine)").matches) return;
      (m(!0), document.documentElement.classList.add("custom-cursor-on"));
      let g = 0;
      const x = {
          x: -100,
          y: -100,
        },
        y = {
          x: -100,
          y: -100,
        },
        v = (T) => {
          ((x.x = T.clientX),
            (x.y = T.clientY),
            n({
              x: T.clientX,
              y: T.clientY,
            }));
          const j = T.target;
          f(!!j.closest("a, button, [data-cursor]"));
        },
        S = () => {
          ((y.x += (x.x - y.x) * 0.16),
            (y.y += (x.y - y.y) * 0.16),
            r({
              x: y.x,
              y: y.y,
            }),
            (g = requestAnimationFrame(S)));
        };
      return (
        window.addEventListener("mousemove", v, {
          passive: !0,
        }),
        (g = requestAnimationFrame(S)),
        () => {
          (window.removeEventListener("mousemove", v),
            cancelAnimationFrame(g),
            document.documentElement.classList.remove("custom-cursor-on"));
        }
      );
    }, []),
    h ? (
      <>
        <motion.div
          className="pointer-events-none fixed top-0 left-0 z-[100] h-2 w-2 rounded-full bg-pine-600"
          animate={{
            x: s.x - 4,
            y: s.y - 4,
            scale: d ? 0.5 : 1,
          }}
          transition={{
            duration: 0,
          }}
        />
        <motion.div
          className="pointer-events-none fixed top-0 left-0 z-[100] rounded-full border-2 border-pine-600/70"
          animate={{
            x: l.x - (d ? 28 : 18),
            y: l.y - (d ? 28 : 18),
            width: d ? 56 : 36,
            height: d ? 56 : 36,
            opacity: d ? 1 : 0.6,
            backgroundColor: d ? "rgba(39,101,60,0.08)" : "rgba(39,101,60,0)",
          }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 24,
          }}
        />
      </>
    ) : null
  );
}
