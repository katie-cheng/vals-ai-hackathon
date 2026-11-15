import { BUSINESS, NAV, SERVICES, WHATSAPP_URL } from "../content";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-ink px-5 pt-20 pb-10 text-ivory sm:px-8">
      <div className="wrap grid gap-12 md:grid-cols-2 lg:grid-cols-[1.2fr_0.7fr_1.1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-[0.95rem] text-ivory/75">A women-only beauty salon and make-up studio in Jhusi, Prayagraj.</p>
        </div>
        <nav aria-label="Footer">
          <p className="text-[0.95rem] font-medium text-gold">Explore</p>
          <ul className="mt-4 space-y-2.5 text-[0.95rem]">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="text-ivory/80 transition-colors hover:text-ivory">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="text-[0.95rem] font-medium text-gold">Services</p>
          <ul className="mt-4 space-y-2.5 text-[0.95rem] text-ivory/80">
            {SERVICES.map((s) => (
              <li key={s.name}>{s.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[0.95rem] font-medium text-gold">Contact</p>
          <address className="mt-4 text-[0.95rem] text-ivory/80 not-italic">{BUSINESS.address}</address>
          <ul className="mt-4 space-y-2.5 text-[0.95rem]">
            <li>
              <a href={BUSINESS.phoneHref} className="text-ivory/80 hover:text-ivory">
                {BUSINESS.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-ivory/80 hover:text-ivory">
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="wrap mt-16 border-t border-ivory/15 pt-8 text-[0.9rem] text-ivory/70">
        © {new Date().getFullYear()} {BUSINESS.name}, Jhusi, Prayagraj. All rights reserved.
      </p>
    </footer>
  );
}
