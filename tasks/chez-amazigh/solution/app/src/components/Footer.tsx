import { Link } from "react-router-dom";
import { site } from "../config/site";
import { useLang } from "../i18n/LanguageContext";
import { ROUTES } from "./routes";

export default function Footer() {
  const { t } = useLang();
  const a = site.address;
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <p className="footer-name">Gîte chez l'habitant Amazigh</p>
          <p>{t.footer.tagline}</p>
        </div>
        <nav aria-label={t.footer.explore}>
          <h2 className="footer-title">{t.footer.explore}</h2>
          <ul>
            {ROUTES.map((r) => (
              <li key={r.key}>
                <Link to={r.path}>{t.nav[r.key]}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="footer-title">{t.footer.book}</h2>
          <ul>
            <li><a href={site.links.booking} target="_blank" rel="noopener noreferrer">Booking.com</a></li>
            <li><a href={site.links.airbnb} target="_blank" rel="noopener noreferrer">Airbnb</a></li>
          </ul>
          <p className="footer-note">{t.footer.contactNote}</p>
        </div>
        <div>
          <h2 className="footer-title">{t.footer.find}</h2>
          <address>
            {a.locality}
            <br />
            {a.city}, {a.postalCode}, {a.country}
          </address>
          <a href={site.links.maps} target="_blank" rel="noopener noreferrer">Google Maps</a>
        </div>
      </div>
      <p className="footer-legal">© {new Date().getFullYear()} {t.footer.rights}</p>
    </footer>
  );
}
