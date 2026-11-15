import { useId, useRef, useState, type FormEvent } from "react";
import { Minus, Plus } from "lucide-react";
import { hasChannel, site, whatsappUrl } from "../config/site";
import { useLang } from "../i18n/LanguageContext";
import { channelForReply, clean, nights, today, validate, type Inquiry, type InquiryErrors } from "../lib/inquiry";

const EMPTY: Inquiry = { arrival: "", departure: "", guests: 2, name: "", reply: "", channel: "whatsapp", message: "", website: "" };

/**
 * Reservation inquiry. Nothing is booked here: the form composes a message for the family's configured channel
 * (WhatsApp or email from config/site.ts) and, while none is configured, points to the platforms' messaging.
 */
export default function InquiryForm() {
  const { t, lang } = useLang();
  const c = t.contact;
  const id = useId();
  const [data, setData] = useState<Inquiry>(EMPTY);
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [sent, setSent] = useState<Inquiry | null>(null);
  const [copied, setCopied] = useState(false);
  const summaryRef = useRef<HTMLParagraphElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Inquiry>(k: K, v: Inquiry[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const fmtDate = (s: string) => new Date(`${s}T12:00:00`).toLocaleDateString(lang === "ar" ? "ar-MA" : lang, { day: "numeric", month: "long", year: "numeric" });

  const compose = (i: Inquiry) =>
    [
      c.messageIntro,
      `${c.arrival}: ${fmtDate(i.arrival)}`,
      `${c.departure}: ${fmtDate(i.departure)} (${nights(i)} ${c.nights})`,
      `${c.guests}: ${i.guests}`,
      `${c.name}: ${i.name}`,
      `${c.reply}: ${i.reply} (${c.channels[i.channel as keyof typeof c.channels]})`,
      i.message && `${c.message.replace(/\s*\(.*\)$/, "")}: ${i.message}`,
    ]
      .filter(Boolean)
      .join("\n");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (data.website) return; // Honeypot field: only bots fill it.
    const cleaned = clean(data);
    const found = validate(cleaned);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSent(cleaned);
    setCopied(false);
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  const err = (k: keyof Inquiry) => (errors[k] ? `${id}-${k}-error` : undefined);
  const errorText = (k: keyof Inquiry) => errors[k] && <p className="field-error" id={`${id}-${k}-error`}>{c.errors[errors[k]!]}</p>;

  if (sent) {
    const text = compose(sent);
    const wa = whatsappUrl(text);
    const mail = hasChannel("email") ? `mailto:${site.contact.email}?subject=${encodeURIComponent(t.contact.formTitle)}&body=${encodeURIComponent(text)}` : null;
    return (
      <div className="inquiry-result" ref={resultRef} tabIndex={-1} role="status">
        <h2>{c.readyTitle}</h2>
        <p>{c.readyBody}</p>
        <pre className="inquiry-message">{text}</pre>
        <div className="inquiry-actions">
          {wa && <a className="button" href={wa} target="_blank" rel="noopener noreferrer">{c.sendWhatsapp}</a>}
          {mail && <a className="button button-quiet" href={mail}>{c.sendEmail}</a>}
          <button
            type="button"
            className={wa || mail ? "button button-quiet" : "button"}
            onClick={() => navigator.clipboard?.writeText(text).then(() => setCopied(true), () => setCopied(false))}
          >
            {copied ? c.copied : c.copyMessage}
          </button>
          <button type="button" className="text-button" onClick={() => setSent(null)}>{c.edit}</button>
        </div>
        {!wa && !mail && (
          <p className="note">
            {c.noChannel}{" "}
            <a href={site.links.booking} target="_blank" rel="noopener noreferrer">Booking.com</a>,{" "}
            <a href={site.links.airbnb} target="_blank" rel="noopener noreferrer">Airbnb</a>.
          </p>
        )}
      </div>
    );
  }

  const hasErrors = Object.values(errors).some(Boolean);
  return (
    <form className="inquiry" onSubmit={submit} noValidate aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>{c.formTitle}</h2>
      <p className="form-summary" ref={summaryRef} tabIndex={-1} role="alert">{hasErrors ? c.errors.summary : ""}</p>
      <div className="field-row">
        <div className="field">
          <label htmlFor={`${id}-arrival`}>{c.arrival}</label>
          <input id={`${id}-arrival`} name="arrival" type="date" required min={today()} value={data.arrival}
            aria-invalid={!!errors.arrival} aria-describedby={err("arrival")} onChange={(e) => set("arrival", e.target.value)} />
          {errorText("arrival")}
        </div>
        <div className="field">
          <label htmlFor={`${id}-departure`}>{c.departure}</label>
          <input id={`${id}-departure`} name="departure" type="date" required min={data.arrival || today()} value={data.departure}
            aria-invalid={!!errors.departure} aria-describedby={err("departure")} onChange={(e) => set("departure", e.target.value)} />
          {errorText("departure")}
        </div>
      </div>
      <div className="field">
        <label htmlFor={`${id}-guests`}>{c.guests}</label>
        <div className="stepper">
          <button type="button" aria-label={c.decrease} onClick={() => set("guests", Math.max(1, data.guests - 1))}><Minus size={18} aria-hidden="true" /></button>
          <input id={`${id}-guests`} name="guests" type="number" inputMode="numeric" min={1} max={30} required value={data.guests}
            aria-invalid={!!errors.guests} aria-describedby={err("guests")} onChange={(e) => set("guests", e.target.value === "" ? 0 : Number(e.target.value))} />
          <button type="button" aria-label={c.increase} onClick={() => set("guests", Math.min(30, data.guests + 1))}><Plus size={18} aria-hidden="true" /></button>
        </div>
        {errorText("guests")}
      </div>
      <div className="field">
        <label htmlFor={`${id}-name`}>{c.name}</label>
        <input id={`${id}-name`} name="name" type="text" autoComplete="name" required maxLength={80} value={data.name}
          aria-invalid={!!errors.name} aria-describedby={err("name")} onChange={(e) => set("name", e.target.value)} />
        {errorText("name")}
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor={`${id}-reply`}>{c.reply}</label>
          <input id={`${id}-reply`} name="email" type="text" autoComplete="email" required maxLength={120} value={data.reply}
            aria-invalid={!!errors.reply} aria-describedby={err("reply")} onChange={(e) => { set("reply", e.target.value); set("channel", channelForReply(e.target.value, data.channel)); }} />
          {errorText("reply")}
        </div>
        <div className="field">
          <label htmlFor={`${id}-channel`}>{c.channel}</label>
          <select id={`${id}-channel`} name="channel" value={data.channel} onChange={(e) => set("channel", e.target.value)}>
            {Object.entries(c.channels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor={`${id}-message`}>{c.message}</label>
        <textarea id={`${id}-message`} name="message" rows={4} maxLength={1000} value={data.message} aria-describedby={`${id}-hint`}
          onChange={(e) => set("message", e.target.value)} />
        <p className="field-hint" id={`${id}-hint`}>{c.messageHint}</p>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => set("website", e.target.value)} />
      </div>
      <p className="note">{c.privacy}</p>
      <button type="submit" className="button">{c.submit}</button>
    </form>
  );
}
