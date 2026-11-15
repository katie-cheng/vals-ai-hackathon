import { useState, type FormEvent } from "react";
import { Clock, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { BUSINESS, whatsappLink } from "../content";
import { Reveal } from "./Reveal";

function ContactForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError("Please add your name and a message.");
      return;
    }
    setError("");
    window.open(whatsappLink(`Hello ZEE Beauty Saloon, this is ${name.trim()}.\n\n${message.trim()}`), "_blank", "noopener,noreferrer");
  };

  return (
    <form noValidate onSubmit={submit} aria-label="Send the salon a message" className="rounded-lg bg-white p-6 sm:p-8">
      <h3 className="text-3xl">Send a message</h3>
      <p className="mt-2 text-charcoal/75">Questions about a service or timing? Your message opens in WhatsApp.</p>
      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="contact-name" className="field-label">
            Your name
          </label>
          <input id="contact-name" autoComplete="name" className="field" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="contact-message" className="field-label">
            Message
          </label>
          <textarea id="contact-message" rows={4} className="field resize-y" value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        {error && (
          <p role="alert" className="field-error">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-dark w-full">
          <MessageCircle size={18} aria-hidden="true" />
          Send on WhatsApp
        </button>
      </div>
    </form>
  );
}

export function Contact() {
  return (
    <section id="contact" className="bg-blush/50 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <Reveal>
            <h2 className="section-title">Visit ZEE Beauty Saloon</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <dl className="mt-10 space-y-7">
              <div className="flex gap-4">
                <MapPin size={22} className="mt-1 shrink-0 text-rose-deep" aria-hidden="true" />
                <div>
                  <dt className="font-medium">ZEE Beauty Saloon</dt>
                  <dd className="mt-1 text-charcoal/80">{BUSINESS.address}.</dd>
                </div>
              </div>
              <div className="flex gap-4">
                <Phone size={22} className="mt-1 shrink-0 text-rose-deep" aria-hidden="true" />
                <div>
                  <dt className="font-medium">Phone</dt>
                  <dd className="mt-1">
                    <a href={`tel:${BUSINESS.phoneTel}`} className="text-charcoal/80 underline decoration-champagne underline-offset-4 hover:text-charcoal">
                      {BUSINESS.phoneDisplay}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-4">
                <Clock size={22} className="mt-1 shrink-0 text-rose-deep" aria-hidden="true" />
                <div>
                  <dt className="font-medium">Listed hours</dt>
                  <dd className="mt-1 text-charcoal/80">{BUSINESS.hours} daily. Please call to confirm before you visit.</dd>
                </div>
              </div>
            </dl>
          </Reveal>
          <Reveal delay={0.2} className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={`tel:${BUSINESS.phoneTel}`} className="btn btn-dark">
              <Phone size={18} aria-hidden="true" />
              Call the salon
            </a>
            <a href={whatsappLink("Hello ZEE Beauty Saloon,")} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              <MessageCircle size={18} aria-hidden="true" />
              WhatsApp
            </a>
            <a href={BUSINESS.directionsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              <Navigation size={18} aria-hidden="true" />
              Get directions
            </a>
          </Reveal>
        </div>
        <Reveal delay={0.15} className="lg:col-span-5 lg:col-start-8">
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
