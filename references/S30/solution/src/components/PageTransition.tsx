import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { DUR, EASE } from "./motion";

/** Route change: jump to the top and fade the new page in. */
export function PageTransition({ children }: any) {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <motion.div key={pathname} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DUR, ease: EASE }}>
      {children}
    </motion.div>
  );
}
