export interface Item {
  id: string;
  name: string;
  price: number;
  kind: "cloak" | "decor";
  color?: string;
  about: string;
}

export const DEFAULT_CLOAK = "#7d8a96";

export const ITEMS: Item[] = [
  { id: "cloak-sea", name: "Sea-grey cloak", price: 80, kind: "cloak", color: "#5f8f8b", about: "Wool cloak dyed the colour of the harbour" },
  { id: "cloak-ember", name: "Ember cloak", price: 120, kind: "cloak", color: "#c0703f", about: "Rust-red, easy to spot across the plaza" },
  { id: "cloak-moss", name: "Moss cloak", price: 90, kind: "cloak", color: "#6f8550", about: "Blends in with the meadow" },
  { id: "lantern", name: "Paper lantern", price: 40, kind: "decor", about: "Hangs by the door of your home" },
  { id: "bench", name: "Cedar bench", price: 60, kind: "decor", about: "Seats two in front of your home" },
  { id: "fern", name: "Fern in a clay pot", price: 25, kind: "decor", about: "Grows a little every day you visit" },
];

export const itemById = (id: string) => ITEMS.find((i) => i.id === id);

export interface Plot {
  id: string;
  name: string;
  x: number;
  z: number;
}

export const PLOTS: Plot[] = [
  { id: "hill-1", name: "Hillside 1", x: -14, z: -24 },
  { id: "hill-2", name: "Hillside 2", x: -5, z: -27 },
  { id: "hill-3", name: "Hillside 3", x: 4, z: -27 },
  { id: "hill-4", name: "Hillside 4", x: 13, z: -24 },
  { id: "shore-1", name: "Shore 1", x: -27, z: 8 },
  { id: "shore-2", name: "Shore 2", x: -24, z: 18 },
];

export const FIRST_PLOT_PRICE = 0;
export const PLOT_PRICE = 150;
export const MAX_PLOTS = 2;

export interface Mote {
  id: string;
  x: number;
  z: number;
}

export const MOTES: Mote[] = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2 + 0.3;
  const r = 13 + (i % 3) * 7;
  return { id: `mote-${i}`, x: Math.round(Math.cos(a) * r * 10) / 10, z: Math.round(Math.sin(a) * r * 10) / 10 };
});

export const MOTE_VALUE = 5;
export const MOTE_RESPAWN_MS = 3 * 60_000;
export const START_BALANCE = 200;

export interface Place {
  id: string;
  name: string;
  x: number;
  z: number;
}

export const ANCHORS: Place[] = [
  { id: "plaza", name: "Lantern Plaza", x: 0, z: 4 },
  { id: "market", name: "Market Row", x: 20, z: 2 },
  { id: "hillside", name: "Hillside homes", x: 0, z: -18 },
  { id: "pier", name: "Old Pier", x: 0, z: 30 },
];

export function placeAt(x: number, z: number): string {
  if (z > 33) return "Old Pier";
  if (Math.hypot(x, z) < 11) return "Lantern Plaza";
  if (x > 13 && Math.abs(z) < 14) return "Market Row";
  if (z < -15) return "Hillside homes";
  if (x < -18) return "West shore";
  return "The meadow";
}

export const PLACES = ["Lantern Plaza", "Market Row", "Hillside homes", "Old Pier", "West shore", "The meadow"];

export interface WorldEvent {
  id: string;
  name: string;
  place: string;
  about: string;
  day: number | "daily";
  hour: number;
  minutes: number;
}

export const EVENTS: WorldEvent[] = [
  { id: "lantern-release", name: "Lantern release", place: "Old Pier", about: "Everyone on the pier lets a lantern go over the water.", day: "daily", hour: 20, minutes: 30 },
  { id: "market-morning", name: "Market morning", place: "Market Row", about: "Stalls restock and listings are free to post for the hour.", day: "daily", hour: 9, minutes: 60 },
  { id: "open-homes", name: "Open homes", place: "Hillside homes", about: "Residents leave their doors open for visitors.", day: 6, hour: 15, minutes: 120 },
  { id: "story-circle", name: "Story circle", place: "Lantern Plaza", about: "Sit by the lantern tree and trade stories in world chat.", day: 3, hour: 19, minutes: 60 },
];

export function nextStart(e: WorldEvent, now = Date.now()): number {
  const d = new Date(now);
  for (let i = 0; i < 8; i++) {
    const c = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i, e.hour, 0, 0, 0);
    if ((e.day === "daily" || c.getDay() === e.day) && c.getTime() + e.minutes * 60_000 > now) return c.getTime();
  }
  return now;
}
