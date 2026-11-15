import React from "react";
import {
  ArrowRight,
  Clock3,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Navigation,
  Phone,
  Send,
} from "lucide-react";
import { PageHero, Reveal } from "../components/UI";
import { useStore } from "../lib/store";

export default function ContactPage() {
  const { data, submitEnquiry } = useStore();
  const [t, c] = React.useState({ name: "", phone: "", email: "", message: "" });
  const [n, i] = React.useState("");
  const [g, m] = React.useState(false);
  const r = encodeURIComponent(data.settings.address);
  const u = (a) => {
    if ((a.preventDefault(), !t.name.trim() || !t.phone.trim() || !t.message.trim())) {
      i("Please add your name, phone number and message.");
      return;
    }
    submitEnquiry(t);
    m(true);
    i("");
    c({ name: "", phone: "", email: "", message: "" });
  };
  return (
    <>
      <PageHero
        eyebrow={data.content.contactHeroEyebrow}
        title={data.content.contactHeroTitle}
        text={data.content.contactHeroText}
        image={data.images.contact}
      />
      <section className="bg-cream py-16 sm:py-24">
        <div className="container-site grid gap-5 md:grid-cols-3">
          {[
            {
              icon: MapPin,
              label: "Visit the Campus",
              value: data.settings.address,
              action: `https://www.google.com/maps/dir/?api=1&destination=${r}`,
              actionText: "Get directions",
            },
            {
              icon: Phone,
              label: "Call us",
              value: data.settings.phone,
              action: `tel:${data.settings.phone.replace(/\s/g, "")}`,
              actionText: "Click to call",
            },
            {
              icon: Clock3,
              label: "Opening hours",
              value: `${data.settings.hoursWeek} · ${data.settings.hoursSunday}`,
              action: "/order",
              actionText: "Order online",
            },
          ].map((a, h) => (
            <Reveal key={a.label} delay={h * 0.08}>
              <div className="flex h-full flex-col rounded-3xl bg-white p-7 shadow-sm">
                <a.icon size={25} className="text-brand" />
                <p className="mt-6 text-[10px] font-extrabold tracking-[.16em] text-neutral-400 uppercase">{a.label}</p>
                <p className="mt-3 flex-1 text-sm leading-6 font-semibold">{a.value}</p>
                {a.action.startsWith("/") ? (
                  <a href={a.action} className="mt-6 flex items-center gap-2 text-xs font-bold text-brand uppercase">
                    {a.actionText}
                    <ArrowRight size={14} />
                  </a>
                ) : (
                  <a
                    href={a.action}
                    target={a.action.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="mt-6 flex items-center gap-2 text-xs font-bold text-brand uppercase"
                  >
                    {a.actionText}
                    <ArrowRight size={14} />
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="bg-white py-16 sm:py-24">
        <div className="container-site grid items-stretch gap-8 lg:grid-cols-[1.15fr_.85fr]">
          <Reveal>
            <div className="relative min-h-[520px] overflow-hidden rounded-3xl bg-neutral-200">
              <iframe
                title="Google Map — Rocksteady Campus, 1563 Makapane Street, Rockville"
                src={`https://www.google.com/maps?q=${r}&output=embed`}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${r}`}
                target="_blank"
                rel="noreferrer"
                className="absolute right-5 bottom-5 flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-xs font-bold text-white shadow-xl"
              >
                <Navigation size={16} />
                Open in Google Maps
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex h-full flex-col rounded-3xl bg-black p-7 text-white sm:p-9">
              <p className="text-[10px] font-extrabold tracking-[.18em] text-brand uppercase">Need a quick answer?</p>
              <h2 className="mt-3 font-display text-4xl font-black uppercase">{data.content.contactWhatsappTitle}</h2>
              <p className="mt-4 text-sm leading-6 text-white/50">{data.content.contactWhatsappText}</p>
              <a
                href={`https://wa.me/${data.settings.whatsapp}?text=Hi%20Rocksteady%20Campus!`}
                target="_blank"
                rel="noreferrer"
                className="mt-7 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-xs font-extrabold text-black uppercase"
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>
              <div className="mt-8 space-y-4 border-t border-white/10 pt-7">
                <a
                  href={`mailto:${data.settings.email}`}
                  className="flex items-center gap-3 text-sm text-white/65 hover:text-brand"
                >
                  <Mail size={17} className="text-brand" />
                  {data.settings.email}
                </a>
                <a
                  href={`tel:${data.settings.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 text-sm text-white/65 hover:text-brand"
                >
                  <Phone size={17} className="text-brand" />
                  {data.settings.phone}
                </a>
              </div>
              <div className="mt-auto pt-8">
                <p className="text-[10px] font-bold tracking-wider text-white/35 uppercase">Follow the flavour</p>
                <div className="mt-3 flex gap-2">
                  <a
                    href={data.settings.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 hover:bg-brand"
                    aria-label="Instagram"
                  >
                    <Instagram size={17} />
                  </a>
                  <a
                    href={data.settings.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 hover:bg-brand"
                    aria-label="Facebook"
                  >
                    <Facebook size={17} />
                  </a>
                  <a
                    href={data.settings.tiktok}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 hover:bg-brand"
                    aria-label="TikTok"
                  >
                    <Music2 size={17} />
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="bg-cream py-16 sm:py-24">
        <div className="container-site grid items-start gap-10 lg:grid-cols-[.75fr_1.25fr]">
          <Reveal>
            <div className="eyebrow">GENERAL ENQUIRIES</div>
            <h2 className="display-title mt-5">{data.content.contactFormTitle}</h2>
            <p className="mt-5 text-sm leading-7 text-neutral-500">{data.content.contactFormText}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <form onSubmit={u} className="rounded-3xl bg-white p-6 shadow-sm sm:p-9">
              {g && (
                <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
                  Message received. We will be in touch soon.
                </div>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="field-label">Name *</span>
                  <input
                    className="field"
                    value={t.name}
                    onChange={(a) => c({ ...t, name: a.target.value })}
                    placeholder="Your name"
                  />
                </label>
                <label>
                  <span className="field-label">Mobile number *</span>
                  <input
                    className="field"
                    value={t.phone}
                    onChange={(a) => c({ ...t, phone: a.target.value })}
                    placeholder="072 123 4567"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="field-label">Email address</span>
                  <input
                    type="email"
                    className="field"
                    value={t.email}
                    onChange={(a) => c({ ...t, email: a.target.value })}
                    placeholder="you@example.com"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="field-label">Message *</span>
                  <textarea
                    className="field min-h-32 resize-none"
                    value={t.message}
                    onChange={(a) => c({ ...t, message: a.target.value })}
                    placeholder="How can we help?"
                  />
                </label>
              </div>
              {n && <p className="mt-3 text-xs text-brand">{n}</p>}
              <button className="btn-primary mt-6">
                Send enquiry
                <Send size={15} />
              </button>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
