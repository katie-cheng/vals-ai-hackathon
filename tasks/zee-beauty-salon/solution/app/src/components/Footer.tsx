import { MessageCircle } from "lucide-react";
import { BUSINESS, NAV_LINKS, whatsappLink } from "../content";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-charcoal text-ivory">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo tone="light" />
          <p className="mt-5 max-w-sm text-ivory/70">A beauty salon in Mughalpura, Lahore, for makeup, hair, skin and nail care.</p>
          <a href={whatsappLink("Hello ZEE Beauty Saloon,")} target="_blank" rel="noopener noreferrer" className="btn btn-light mt-7">
            <MessageCircle size={18} aria-hidden="true" />
            Chat on WhatsApp
          </a>
        </div>
        <nav aria-label="Footer" className="lg:col-span-2 lg:col-start-6">
          <h2 className="font-sans text-base font-medium">Explore</h2>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-ivory/70 hover:text-ivory">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="lg:col-span-3">
          <h2 className="font-sans text-base font-medium">Find us</h2>
          <p className="mt-4 text-ivory/70">{BUSINESS.address}</p>
          <a href={`tel:${BUSINESS.phoneTel}`} className="mt-3 block text-ivory/70 hover:text-ivory">
            {BUSINESS.phoneDisplay}
          </a>
        </div>
        <div className="lg:col-span-2">
          <h2 className="font-sans text-base font-medium">Opening hours</h2>
          <p className="mt-4 text-ivory/70">Daily, {BUSINESS.hours}</p>
          <p className="mt-1 text-ivory/70">Listed hours; please call to confirm.</p>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <p className="mx-auto max-w-7xl px-5 py-6 text-[0.9rem] text-ivory/60 sm:px-8">© {new Date().getFullYear()} ZEE Beauty Saloon, Mughalpura, Lahore.</p>
      </div>
    </footer>
  );
}
