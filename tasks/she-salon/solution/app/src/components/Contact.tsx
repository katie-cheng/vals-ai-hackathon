import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { BUSINESS, DIRECTIONS_URL, MAP_EMBED_URL, WHATSAPP_URL } from "../content";
import { Reveal } from "./Reveal";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function Contact() {
  return (
    <section id="contact" className="section bg-beige">
      <div className="wrap grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <Reveal>
          <span className="rule" aria-hidden="true" />
          <h2 className="section-title mt-6">Visit the studio</h2>
          <p className="mt-6 max-w-md text-muted">Book by phone or WhatsApp, and tell us the service and the day you have in mind.</p>
          <dl className="mt-10 space-y-7">
            <div className="grid grid-cols-[1.75rem_1fr] gap-4">
              <MapPin className="mt-1 size-5 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <dt className="font-medium">Address</dt>
                <dd className="mt-1 text-muted">
                  <address className="not-italic">{BUSINESS.name}, {BUSINESS.address}.</address>
                </dd>
              </div>
            </div>
            <div className="grid grid-cols-[1.75rem_1fr] gap-4">
              <Phone className="mt-1 size-5 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <dt className="font-medium">Phone and WhatsApp</dt>
                <dd className="mt-1 text-muted">{BUSINESS.phoneDisplay}</dd>
              </div>
            </div>
            <div className="grid grid-cols-[1.75rem_1fr] gap-4">
              <Clock className="mt-1 size-5 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <dt className="font-medium">Opening hours</dt>
                <dd className="mt-1 text-muted">Our full weekly schedule is being confirmed. Please call or message us to confirm the day and time before you visit.</dd>
              </div>
            </div>
          </dl>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={BUSINESS.phoneHref} className="btn btn-dark">
              <Phone className="size-4" aria-hidden="true" /> Call {BUSINESS.phoneDisplay}
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              <WhatsAppIcon className="size-4" /> Book on WhatsApp
            </a>
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              <Navigation className="size-4" aria-hidden="true" /> Get directions
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="min-h-[22rem] bg-ivory">
          <iframe
            title="Map showing SHE Salon & Make-up Studio in Jhusi, Prayagraj"
            src={MAP_EMBED_URL}
            className="size-full min-h-[22rem] border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Reveal>
      </div>
    </section>
  );
}
