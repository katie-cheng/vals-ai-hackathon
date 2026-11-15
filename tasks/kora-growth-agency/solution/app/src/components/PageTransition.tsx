import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { HE } from "../data/content";

export function PageTransition({ children: s }) {
  const { pathname: n } = useLocation(),
    [l, r] = useState(!0),
    [d, f] = useState(!0);
  return (
    useEffect(() => {
      if (d) {
        f(!1);
        const m = setTimeout(() => r(!1), 2100);
        return () => clearTimeout(m);
      }
      (r(!0), window.scrollTo(0, 0));
      const h = setTimeout(() => r(!1), 700);
      return () => clearTimeout(h);
    }, [n]),
    (
      <>
        <motion.div
          className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center bg-pine-950"
          initial={!1}
          animate={
            l
              ? {
                  y: "0%",
                }
              : {
                  y: "-100%",
                }
          }
          transition={{
            duration: 0.75,
            ease: HE,
          }}
        >
          <span className="text-2xl font-bold tracking-tight text-cream-50">
            kora<span className="text-mint-300">.</span>
          </span>
        </motion.div>
        {s}
      </>
    )
  );
}
