import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useLang } from "../i18n/LanguageContext";
import LanguageSwitch from "./LanguageSwitch";
import { ROUTES } from "./routes";

export default function Header() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="site-header">
      <a className="skip-link" href="#main">{t.nav.skip}</a>
      <div className="header-inner">
        <Link to="/" className="brand" aria-label={`Gîte chez l'habitant Amazigh, ${t.nav.home}`}>
          <span className="brand-mark" aria-hidden="true">ⵣ</span>
          <span className="brand-name">Chez l'habitant Amazigh</span>
        </Link>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? t.nav.close : t.nav.menu}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
        <nav id="site-menu" className={`site-nav ${open ? "is-open" : ""}`} aria-label={t.nav.primary}>
          <ul>
            <li className="nav-home">
              <NavLink to="/" end>{t.nav.home}</NavLink>
            </li>
            {ROUTES.map((r) => (
              <li key={r.key} className={r.key === "contact" ? "nav-reserve" : undefined}>
                <NavLink to={r.path}>{t.nav[r.key]}</NavLink>
              </li>
            ))}
          </ul>
          <LanguageSwitch className="nav-lang" long />
        </nav>
        <LanguageSwitch className="header-lang" />
      </div>
    </header>
  );
}
