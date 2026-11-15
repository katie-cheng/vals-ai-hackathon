export const DAY = 86_400_000;

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIso(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export const todayIso = () => isoDate(new Date());

export function addDays(iso: string, n: number): string {
  const d = parseIso(iso);
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseIso(b).getTime() - parseIso(a).getTime()) / DAY);
}

/** The last `n` dates ending today, oldest first. */
export function lastDays(n: number, end = todayIso()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(end, i - n + 1));
}

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", opts);
const shortFmt = fmt({ month: "short", day: "numeric" });
const longFmt = fmt({ weekday: "long", month: "long", day: "numeric", year: "numeric" });
const weekdayFmt = fmt({ weekday: "short" });
const monthFmt = fmt({ month: "long", year: "numeric" });
const timeFmt = fmt({ hour: "numeric", minute: "2-digit" });

export const shortDate = (iso: string) => shortFmt.format(parseIso(iso));
export const longDate = (d = new Date()) => longFmt.format(d);
export const weekday = (iso: string) => weekdayFmt.format(parseIso(iso));
export const monthLabel = (d: Date) => monthFmt.format(d);
export const timeOfDay = (ts: number) => timeFmt.format(new Date(ts));

/** "Today", "Tomorrow", "Yesterday", "In 3 days", "2 days overdue" style label for a due date. */
export function dueLabel(iso: string, done = false): string {
  const diff = daysBetween(todayIso(), iso);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return done ? "Yesterday" : "1 day overdue";
  if (diff < -1) return done ? shortDate(iso) : `${-diff} days overdue`;
  if (diff < 7) return `${weekday(iso)}, ${shortDate(iso)}`;
  return shortDate(iso);
}

export function modifiedLabel(ts: number): string {
  const mins = Math.round((Date.now() - ts) / 60_000);
  if (mins < 1) return "Edited just now";
  if (mins < 60) return `Edited ${mins} min ago`;
  const iso = isoDate(new Date(ts));
  if (iso === todayIso()) return `Edited today at ${timeOfDay(ts)}`;
  if (iso === addDays(todayIso(), -1)) return `Edited yesterday at ${timeOfDay(ts)}`;
  return `Edited ${shortDate(iso)}`;
}

export function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
