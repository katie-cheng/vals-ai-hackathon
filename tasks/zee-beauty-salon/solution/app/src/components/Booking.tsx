import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CircleCheck, MessageCircle, Phone } from "lucide-react";
import { BUSINESS, SERVICES, TIME_SLOTS, whatsappLink } from "../content";
import { Reveal } from "./Reveal";

type Fields = { name: string; phone: string; service: string; date: string; time: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { name: "", phone: "", service: "", date: "", time: "", message: "" };

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function validate(f: Fields): Errors {
  const errors: Errors = {};
  if (f.name.trim().length < 2) errors.name = "Please enter your name.";
  const digits = f.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) errors.phone = "Please enter a phone number we can reach you on, for example 0300 1234567.";
  if (!f.service) errors.service = "Please choose a service.";
  if (!f.date) errors.date = "Please choose a date.";
  else if (f.date < today()) errors.date = "Please choose today or a later date.";
  if (!f.time) errors.time = "Please choose a time.";
  return errors;
}

function bookingMessage(f: Fields): string {
  const date = new Date(`${f.date}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return [
    "Hello ZEE Beauty Saloon, I would like to request an appointment.",
    "",
    `Name: ${f.name.trim()}`,
    `Phone: ${f.phone.trim()}`,
    `Service: ${f.service}`,
    `Preferred date: ${date}`,
    `Preferred time: ${f.time}`,
    ...(f.message.trim() ? [`Message: ${f.message.trim()}`] : []),
  ].join("\n");
}

export function Booking({ selectedService }: { selectedService: { name: string; nonce: number } | null }) {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sentLink, setSentLink] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (selectedService) setFields((f) => ({ ...f, service: selectedService.name }));
  }, [selectedService]);

  const set = (key: keyof Fields) => (value: string) => {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const link = whatsappLink(bookingMessage(fields));
    window.open(link, "_blank", "noopener,noreferrer");
    setSentLink(link);
  };

  const errorProps = (key: keyof Fields) => ({
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });
  const errorText = (key: keyof Fields) =>
    errors[key] && (
      <p id={`${key}-error`} className="field-error">
        {errors[key]}
      </p>
    );

  return (
    <section id="booking" className="py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Reveal>
            <h2 className="section-title">Book your appointment</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg text-charcoal/80">
              Choose a service and a time that suits you. Your request opens in WhatsApp, ready to send to the salon.
            </p>
            <p className="mt-4 text-charcoal/75">
              The salon will reply to confirm or suggest another time. Your appointment is confirmed once they reply.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="mt-10 space-y-4">
            <a
              href={whatsappLink("Hello ZEE Beauty Saloon, I would like to book an appointment.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 font-medium text-rose-deep"
            >
              <MessageCircle size={20} aria-hidden="true" />
              Prefer to chat? Message us on WhatsApp
            </a>
            <a href={`tel:${BUSINESS.phoneTel}`} className="flex items-center gap-3 font-medium text-rose-deep">
              <Phone size={20} aria-hidden="true" />
              Or call {BUSINESS.phoneDisplay}
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:col-span-7">
          <form
            ref={formRef}
            noValidate
            onSubmit={submit}
            aria-label="Appointment request"
            className="rounded-lg border border-champagne/30 bg-white p-6 shadow-[0_30px_60px_-40px_rgba(41,35,41,0.35)] max-sm:p-5 sm:p-10"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="field-label">
                  Customer name
                </label>
                <input id="name" name="name" autoComplete="name" className="field" value={fields.name} onChange={(e) => set("name")(e.target.value)} {...errorProps("name")} />
                {errorText("name")}
              </div>
              <div>
                <label htmlFor="phone" className="field-label">
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="0300 1234567"
                  className="field"
                  value={fields.phone}
                  onChange={(e) => set("phone")(e.target.value)}
                  {...errorProps("phone")}
                />
                {errorText("phone")}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="service" className="field-label">
                  Desired service
                </label>
                <select id="service" name="service" className="field" value={fields.service} onChange={(e) => set("service")(e.target.value)} {...errorProps("service")}>
                  <option value="">Choose a service</option>
                  {SERVICES.map((s) => (
                    <option key={s.name}>{s.name}</option>
                  ))}
                </select>
                {errorText("service")}
              </div>
              <div>
                <label htmlFor="date" className="field-label">
                  Preferred date
                </label>
                <input id="date" name="date" type="date" min={today()} className="field" value={fields.date} onChange={(e) => set("date")(e.target.value)} {...errorProps("date")} />
                {errorText("date")}
              </div>
              <div>
                <label htmlFor="time" className="field-label">
                  Preferred time
                </label>
                <select id="time" name="time" className="field" value={fields.time} onChange={(e) => set("time")(e.target.value)} {...errorProps("time")}>
                  <option value="">Choose a time</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                {errorText("time")}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="message" className="field-label">
                  Additional message <span className="font-normal text-charcoal/60">(optional)</span>
                </label>
                <textarea id="message" name="message" rows={4} className="field resize-y" value={fields.message} onChange={(e) => set("message")(e.target.value)} />
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {sentLink ? (
                <motion.div
                  key="sent"
                  role="status"
                  className="mt-8 rounded-md border border-champagne/50 bg-ivory p-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="flex items-center gap-2 font-display text-2xl">
                    <CircleCheck size={22} className="text-rose-deep" aria-hidden="true" />
                    Your request is ready in WhatsApp
                  </p>
                  <p className="mt-2 text-charcoal/80">
                    Press send in WhatsApp, and the salon will reply to confirm your time. Nothing is booked until they do.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                    <a href={sentLink} target="_blank" rel="noopener noreferrer" className="font-medium text-rose-deep">
                      Open WhatsApp again
                    </a>
                    <button type="button" onClick={() => setSentLink(null)} className="font-medium text-charcoal/70 hover:text-charcoal">
                      Edit request
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="submit" className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.button type="submit" className="btn btn-dark group w-full py-4 text-base" whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}>
                    Book Your Appointment
                    <ArrowRight size={18} className="transition group-hover:translate-x-1 max-[359px]:hidden" aria-hidden="true" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
