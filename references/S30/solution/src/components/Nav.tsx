import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";

const NAV_LINKS = [
  {
    to: "/",
    label: "Home",
  },
  {
    to: "/about",
    label: "About",
  },
  {
    to: "/services",
    label: "Services",
  },
  {
    to: "/work",
    label: "Work",
  },
  {
    to: "/pricing",
    label: "Pricing",
  },
  {
    to: "/insights",
    label: "Insights",
  },
];

export function Logo({ dark = false }: any) {
  return (
    <Link to="/" className={`block w-fit text-[1.375rem] leading-none font-semibold tracking-[-0.03em] ${dark ? "text-cream-50" : "text-ink-900"}`} aria-label="Kora home">
      kora
    </Link>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b bg-cream-50 transition-colors ${scrolled || open ? "border-ink-900/10" : "border-transparent"}`}>
      <div className="container-x flex h-16 items-center justify-between gap-6">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={({ isActive }) => `nav-link text-[15px] whitespace-nowrap ${isActive ? "active" : ""}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/contact" className="btn btn-primary hidden sm:inline-flex">
            Book a call
            <ArrowUpRight className="h-4 w-4" aria-hidden={true} />
          </Link>
          <button onClick={() => setOpen((o) => !o)} className="icon-btn lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-nav">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="container-x flex h-[calc(100dvh-4rem)] flex-col overflow-y-auto border-t border-ink-900/10 bg-cream-50 pt-4 pb-8 lg:hidden">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={({ isActive }) => `border-b border-ink-900/10 py-4 display-md ${isActive ? "text-pine-700" : "text-ink-900"}`}>
              {l.label}
            </NavLink>
          ))}
          <Link to="/contact" className="btn btn-primary mt-8 self-start">
            Book a call
            <ArrowUpRight className="h-4 w-4" aria-hidden={true} />
          </Link>
        </nav>
      )}
    </header>
  );
}
