import React from "react";
import { Facebook, Instagram, MessageCircle, Music2 } from "lucide-react";
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
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${r}`;
  const tel = `tel:${data.settings.phone.replace(/\s/g, "")}`;
  const socials = [
    { label: "Instagram", href: data.settings.instagram, icon: Instagram },
    { label: "Facebook", href: data.settings.facebook, icon: Facebook },
    { label: "TikTok", href: data.settings.tiktok, icon: Music2 },
  ];
  return (
    <>
      <PageHero title={data.content.contactHeroTitle} text={data.content.contactHeroText} image={data.images.contact} />
      <section className="section bg-cream">
        <div className="container-site">
          <Reveal className="grid gap-x-8 md:grid-cols-3">
            <div className="border-t border-black/15 py-5">
              <h2 className="card-title">Visit the Campus</h2>
              <p className="mt-2 text-[15px] leading-7">{data.settings.address}</p>
              <a href={directions} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-brand-dark underline-offset-4 hover:underline">
                Get directions
              </a>
            </div>
            <div className="border-t border-black/15 py-5">
              <h2 className="card-title">Call us</h2>
              <p className="mt-2 text-[15px] leading-7">
                <a href={tel} className="hover:text-brand-dark">
                  {data.settings.phone}
                </a>
                <br />
                <a href={`mailto:${data.settings.email}`} className="hover:text-brand-dark">
                  {data.settings.email}
                </a>
              </p>
            </div>
            <div className="border-t border-black/15 py-5">
              <h2 className="card-title">Opening hours</h2>
              <p className="mt-2 text-[15px] leading-7">
                {data.settings.hoursWeek}
                <br />
                {data.settings.hoursSunday}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="section bg-white">
        <div className="container-site">
          <Reveal className="grid items-stretch gap-8 lg:grid-cols-12">
            <div className="skeleton relative min-h-[420px] overflow-hidden rounded-lg lg:col-span-7">
              <iframe
                title="Google Map of Rocksteady Campus, 1563 Makapane Street, Rockville"
                src={`https://www.google.com/maps?q=${r}&output=embed`}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="flex flex-col rounded-lg bg-black p-7 text-white sm:p-8 lg:col-span-5">
              <h2 className="display-title">{data.content.contactWhatsappTitle}</h2>
              <p className="mt-3 text-[15px] leading-7 text-white/75">{data.content.contactWhatsappText}</p>
              <a
                href={`https://wa.me/${data.settings.whatsapp}?text=Hi%20Rocksteady%20Campus!`}
                target="_blank"
                rel="noreferrer"
                className="btn mt-6 self-start bg-[#25D366] text-black hover:bg-[#1fbd5a]"
              >
                <MessageCircle size={17} />
                Chat on WhatsApp
              </a>
              <div className="mt-auto pt-8">
                <h3 className="text-sm font-semibold">Follow the flavour</h3>
                <div className="mt-3 flex gap-2">
                  {socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="icon-btn border border-white/20 text-white/80 hover:border-white hover:text-white"
                      aria-label={social.label}
                      title={social.label}
                    >
                      <social.icon size={17} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="section bg-cream">
        <div className="container-site grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <h2 className="display-title">{data.content.contactFormTitle}</h2>
            <p className="mt-3 text-[15px] leading-7 text-neutral-600">{data.content.contactFormText}</p>
          </div>
          <form onSubmit={u} noValidate className="card p-6 sm:p-8 lg:col-span-7">
            {g && (
              <div role="status" className="mb-6 rounded-md bg-green-50 p-4 text-sm font-medium text-green-800">
                Message received. We will be in touch soon.
              </div>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <label>
                <span className="field-label">Name (required)</span>
                <input
                  className="field"
                  value={t.name}
                  onChange={(a) => c({ ...t, name: a.target.value })}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </label>
              <label>
                <span className="field-label">Mobile number (required)</span>
                <input
                  type="tel"
                  className="field"
                  value={t.phone}
                  onChange={(a) => c({ ...t, phone: a.target.value })}
                  placeholder="072 123 4567"
                  autoComplete="tel"
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
                  autoComplete="email"
                />
              </label>
              <label className="sm:col-span-2">
                <span className="field-label">Message (required)</span>
                <textarea
                  className="field min-h-32 resize-none"
                  value={t.message}
                  onChange={(a) => c({ ...t, message: a.target.value })}
                  placeholder="How can we help?"
                />
              </label>
            </div>
            {n && (
              <p role="alert" className="mt-3 text-sm text-brand-dark">
                {n}
              </p>
            )}
            <button className="btn-primary mt-6">Send enquiry</button>
          </form>
        </div>
      </section>
    </>
  );
}
