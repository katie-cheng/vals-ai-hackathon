import { MessageCircle } from "lucide-react";
import { hasChannel, site, whatsappUrl, type Channel } from "../config/site";
import { useLang } from "../i18n/LanguageContext";
import PageIntro from "../components/PageIntro";
import PageMeta from "../components/PageMeta";
import InquiryForm from "../components/InquiryForm";
import BookingLinks from "../components/BookingLinks";

const CHANNELS: Channel[] = ["whatsapp", "phone", "email"];

export default function Contact() {
  const { t } = useLang();
  const c = t.contact;
  const href = (ch: Channel) => (ch === "whatsapp" ? whatsappUrl(c.messageIntro) : ch === "phone" ? `tel:${site.contact.phone}` : `mailto:${site.contact.email}`);
  const wa = whatsappUrl(c.messageIntro);
  return (
    <>
      <PageMeta page="contact" />
      <PageIntro title={c.title} lead={c.lead} />
      <section className="section contact">
        <InquiryForm />
        <aside className="contact-aside">
          <h2>{c.detailsTitle}</h2>
          <dl className="contact-channels">
            {CHANNELS.map((ch) => (
              <div key={ch}>
                <dt>{c[ch]}</dt>
                <dd>{hasChannel(ch) ? <a href={href(ch) ?? undefined} dir="ltr">{site.contact[ch]}</a> : <span className="pending">{c.pending}</span>}</dd>
              </div>
            ))}
          </dl>
          {wa ? (
            <a className="button whatsapp" href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" /> {c.whatsappButton}</a>
          ) : (
            <>
              <button type="button" className="button whatsapp" disabled aria-describedby="wa-pending"><MessageCircle size={18} aria-hidden="true" /> {c.whatsappButton}</button>
              <p className="note" id="wa-pending">{c.whatsappPending}</p>
            </>
          )}
          <h2>{c.platformsTitle}</h2>
          <p>{c.platformsBody}</p>
          <BookingLinks className="stacked" />
        </aside>
      </section>
    </>
  );
}
