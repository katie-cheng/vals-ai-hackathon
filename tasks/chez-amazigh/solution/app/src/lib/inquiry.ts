// Client-side checks for the reservation inquiry. A production backend must repeat them server-side (see README).

export type Inquiry = { arrival: string; departure: string; guests: number; name: string; reply: string; channel: string; message: string; website: string };
export type InquiryErrors = Partial<Record<keyof Inquiry, "required" | "past" | "order" | "guests" | "reply">>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s().-]{7,20}$/;

/** The reply channel that fits what the guest typed: an email address means an email reply. */
export function channelForReply(reply: string, current: string) {
  const r = reply.trim();
  if (EMAIL.test(r)) return "email";
  if (PHONE.test(r) && current === "email") return "whatsapp";
  return current;
}

const LIMITS = { name: 80, reply: 120, message: 1000 };

/** Trims, drops control characters and caps lengths, so the composed message stays plain text. */
export function clean(i: Inquiry): Inquiry {
  const strip = (s: string, max: number) => s.replace(/[\u0000-\u0008\u000B-\u001F\u007F<>]/g, "").trim().slice(0, max);
  return { ...i, name: strip(i.name, LIMITS.name), reply: strip(i.reply, LIMITS.reply), message: strip(i.message, LIMITS.message) };
}

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function validate(i: Inquiry): InquiryErrors {
  const e: InquiryErrors = {};
  if (!i.arrival) e.arrival = "required";
  else if (i.arrival < today()) e.arrival = "past";
  if (!i.departure) e.departure = "required";
  else if (i.arrival && i.departure <= i.arrival) e.departure = "order";
  if (!Number.isInteger(i.guests) || i.guests < 1) e.guests = "guests";
  if (!i.name.trim()) e.name = "required";
  const reply = i.reply.trim();
  if (!reply) e.reply = "required";
  else if (!(i.channel === "email" ? EMAIL : PHONE).test(reply)) e.reply = "reply";
  return e;
}

export function nights(i: Inquiry) {
  return Math.round((Date.parse(i.departure) - Date.parse(i.arrival)) / 86_400_000);
}
