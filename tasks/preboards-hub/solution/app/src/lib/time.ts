export const DAY = 86_400_000;

/** The next 27 November at 9:00 local time (this year's, unless it has passed). */
export function defaultTarget(now = new Date()) {
  const t = new Date(now.getFullYear(), 10, 27, 9, 0, 0);
  if (t.getTime() <= now.getTime()) t.setFullYear(t.getFullYear() + 1);
  return t.toISOString();
}

export function split(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

export const pad = (n: number) => String(n).padStart(2, "0");

export const todayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Value for an <input type="datetime-local"> in local time. */
export function toLocalInput(iso: string) {
  const d = new Date(iso);
  return `${todayKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const longDate = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" });

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
