import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { EASE } from "./motion";

/** Accordion of questions separated by rules; one open at a time. */
export function Faq({ items, id = "faq" }: { items: { q: string; a: string }[]; id?: string }) {
  const [open, setOpen] = useState(0);
  const reduce = useReducedMotion();
  return (
    <ul className="border-t border-ink-900/15">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <li key={f.q} className="border-b border-ink-900/15">
            <h3>
              <button onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} aria-controls={`${id}-${i}`} className="flex w-full items-center justify-between gap-4 py-4 text-left text-[15px] sm:gap-6 sm:text-[17px]">
                {f.q}
                {isOpen ? <Minus className="h-4 w-4 shrink-0" aria-hidden={true} /> : <Plus className="h-4 w-4 shrink-0" aria-hidden={true} />}
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${id}-${i}`}
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-5 text-[15px] leading-relaxed text-ink-500">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
