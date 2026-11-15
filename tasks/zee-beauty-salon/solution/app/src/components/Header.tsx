import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "../content";
import { Logo } from "./Logo";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled || open ? "border-b border-champagne/30 bg-ivory/85 backdrop-blur-md" : "border-b border-transparent bg-ivory"
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#home" aria-label="ZEE Beauty Saloon, back to top" onClick={() => setOpen(false)}>
          <Logo />
        </a>
        <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.98rem] text-charcoal/80 underline-offset-[6px] transition hover:text-charcoal hover:underline hover:decoration-champagne"
            >
              {link.label}
            </a>
          ))}
          <a href="#booking" className="btn btn-dark">
            Book Now
          </a>
        </nav>
        <button
          type="button"
          className="grid size-11 place-items-center rounded text-charcoal transition hover:bg-blush lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            className="overflow-hidden border-t border-champagne/30 lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="px-5 pb-8 pt-4 sm:px-8">
              {NAV_LINKS.map((link, i) => (
                <motion.li key={link.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i + 0.1 }}>
                  <a href={link.href} onClick={() => setOpen(false)} className="block py-2.5 font-display text-3xl">
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="px-5 pb-8 sm:px-8">
              <a href="#booking" onClick={() => setOpen(false)} className="btn btn-dark w-full">
                Book Now
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
