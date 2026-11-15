export type RoofForm = "flat" | "gable" | "hip" | "mono";
export type WindowStyle = "casement" | "picture" | "arched" | "slot";
export type WallMaterial = "render" | "timber" | "brick" | "concrete";
export type FloorFinish = "oak" | "limestone" | "concrete" | "terrazzo";

export interface Opening {
  id: string;
  kind: "window" | "door";
  /** Left edge and sill height in metres from the bottom-left corner of the front façade. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Config {
  roof: RoofForm;
  pitch: number;
  roofCovering: string;
  windowStyle: WindowStyle;
  frame: string;
  wall: WallMaterial;
  floor: FloorFinish;
  storeys: number;
  storeyHeight: number;
  width: number;
  depth: number;
  paint: string;
  openings: Opening[];
}

export const ROOF_FORMS: { id: RoofForm; label: string }[] = [
  { id: "flat", label: "Flat" },
  { id: "gable", label: "Gable" },
  { id: "hip", label: "Hip" },
  { id: "mono", label: "Mono-pitch" },
];
export const ROOF_COVERINGS = [
  { id: "#6f7479", label: "Zinc" },
  { id: "#3b3f44", label: "Slate" },
  { id: "#9a6a55", label: "Clay tile" },
];
export const WINDOW_STYLES: { id: WindowStyle; label: string }[] = [
  { id: "casement", label: "Casement" },
  { id: "picture", label: "Picture" },
  { id: "arched", label: "Arched" },
  { id: "slot", label: "Slot" },
];
export const FRAMES = [
  { id: "#2a2c2f", label: "Black" },
  { id: "#7a6a58", label: "Bronze" },
  { id: "#b08d63", label: "Oak" },
  { id: "#f2f1ee", label: "White" },
];
export const WALLS: { id: WallMaterial; label: string }[] = [
  { id: "render", label: "Lime render" },
  { id: "timber", label: "Timber boards" },
  { id: "brick", label: "Brick" },
  { id: "concrete", label: "Concrete panel" },
];
export const FLOORS: { id: FloorFinish; label: string; color: string }[] = [
  { id: "oak", label: "Oak", color: "#b8946a" },
  { id: "limestone", label: "Limestone", color: "#d9d2c3" },
  { id: "concrete", label: "Polished concrete", color: "#a9a8a3" },
  { id: "terrazzo", label: "Terrazzo", color: "#cfc8bd" },
];
export const PAINTS = [
  { id: "#ebe8e1", label: "Chalk" },
  { id: "#d8d1c4", label: "Limestone" },
  { id: "#c9b9a1", label: "Sand" },
  { id: "#b59a86", label: "Clay" },
  { id: "#a7ad9d", label: "Sage" },
  { id: "#8f989e", label: "Slate" },
  { id: "#5d6166", label: "Graphite" },
];

export const LIMITS = {
  width: [6, 16] as const,
  depth: [6, 14] as const,
  storeyHeight: [2.6, 3.6] as const,
  storeys: [1, 3] as const,
  pitch: [15, 45] as const,
};

export const DEFAULT_CONFIG: Config = {
  roof: "gable",
  pitch: 30,
  roofCovering: "#6f7479",
  windowStyle: "casement",
  frame: "#2a2c2f",
  wall: "render",
  floor: "oak",
  storeys: 2,
  storeyHeight: 3,
  width: 11,
  depth: 9,
  paint: "#ebe8e1",
  openings: [
    { id: "d1", kind: "door", x: 4.9, y: 0, w: 1.2, h: 2.3 },
    { id: "w1", kind: "window", x: 1.4, y: 0.9, w: 1.8, h: 1.4 },
    { id: "w2", kind: "window", x: 7.8, y: 0.9, w: 1.8, h: 1.4 },
    { id: "w3", kind: "window", x: 1.4, y: 3.9, w: 1.8, h: 1.4 },
    { id: "w4", kind: "window", x: 4.6, y: 3.9, w: 1.8, h: 1.4 },
    { id: "w5", kind: "window", x: 7.8, y: 3.9, w: 1.8, h: 1.4 },
  ],
};

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const round1 = (v: number) => Math.round(v * 10) / 10;

export const wallHeight = (c: Config) => c.storeys * c.storeyHeight;

/** Rise of the roof above the eaves, in metres. */
export function roofRise(c: Config) {
  const t = Math.tan((c.pitch * Math.PI) / 180);
  if (c.roof === "flat") return 0.35;
  // Mono and gable slopes run front to back; a hip's shorter span sets its ridge.
  if (c.roof === "mono") return c.depth * t;
  if (c.roof === "gable") return c.depth * 0.5 * t;
  return Math.min(c.width, c.depth) * 0.5 * t;
}

export const overallHeight = (c: Config) => wallHeight(c) + roofRise(c);

/** Keeps every opening inside the façade after the façade is resized. */
export function fitOpenings(c: Config): Opening[] {
  const H = wallHeight(c);
  return c.openings.map((o) => {
    const w = Math.min(o.w, c.width - 0.4);
    const h = Math.min(o.h, H - 0.4);
    return { ...o, w, h, x: clamp(o.x, 0.2, c.width - w - 0.2), y: o.kind === "door" ? 0 : clamp(o.y, 0.3, H - h - 0.2) };
  });
}

export function summary(c: Config) {
  const roof = ROOF_FORMS.find((r) => r.id === c.roof)!.label;
  const wall = WALLS.find((w) => w.id === c.wall)!.label;
  const floor = FLOORS.find((f) => f.id === c.floor)!.label;
  const paint = PAINTS.find((p) => p.id === c.paint)?.label ?? c.paint;
  const style = WINDOW_STYLES.find((s) => s.id === c.windowStyle)!.label;
  const windows = c.openings.filter((o) => o.kind === "window").length;
  return `${roof} roof${c.roof === "flat" ? "" : ` at ${c.pitch}°`}, ${wall.toLowerCase()} in ${paint}, ${windows} ${style.toLowerCase()} windows, ${floor.toLowerCase()} floor, ${c.storeys} storey${c.storeys > 1 ? "s" : ""} of ${c.storeyHeight.toFixed(1)} m, ${c.width.toFixed(1)} by ${c.depth.toFixed(1)} m`;
}

export function shade(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(clamp(f >= 0 ? v + (255 - v) * f : v * (1 + f), 0, 255)));
  return "#" + ch.map((v) => v.toString(16).padStart(2, "0")).join("");
}
