import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV, WHATSAPP_URL } from "../content";
import { Logo } from "./Logo";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`fixed inset-x-0 top-0 z-30 border-b bg-ivory transition-colors duration-300 ${scrolled || open ? "border-ink/10" : "border-transparent"}`}>
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-7 min-[1100px]:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="text-[0.95rem] whitespace-nowrap text-ink transition-colors duration-300 hover:text-gold-deep">
              {item.label}
            </a>
          ))}
        </nav>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-dark hidden py-2.5 min-[1100px]:inline-flex">
          Book on WhatsApp
        </a>
        <button
          type="button"
          className="grid size-11 place-items-center text-ink min-[1100px]:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>
      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="max-h-[calc(100svh-4.5rem)] overflow-y-auto overscroll-contain border-t border-ink/10 bg-ivory px-5 pt-2 pb-6 sm:px-8 min-[1100px]:hidden">
          <ul>
            {NAV.map((item) => (
              <li key={item.href} className="border-b border-ink/10">
                <a href={item.href} onClick={() => setOpen(false)} className="block py-3.5 font-display text-2xl">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-dark mt-6 w-full">
            Book on WhatsApp
          </a>
        </nav>
      )}
    </header>
  );
}
