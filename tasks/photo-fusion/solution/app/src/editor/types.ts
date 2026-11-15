export type LayoutKind = "horizontal" | "vertical" | "grid" | "collage";
export type Fit = "fill" | "fit";
export type Shape = "original" | "square" | "landscape" | "portrait";
export type Format = "png" | "jpg";

export type Background =
  | { kind: "color"; color: string }
  | { kind: "gradient"; id: GradientId }
  | { kind: "transparent" };

export type GradientId = "violet" | "midnight" | "lilac";

export interface Photo {
  id: string;
  name: string;
  url: string;
  source: CanvasImageSource;
  width: number;
  height: number;
}

export interface Settings {
  layout: LayoutKind;
  size: number;
  columns: number | "auto";
  shape: Shape;
  fit: Fit;
  spacing: number;
  margin: number;
  border: number;
  borderColor: string;
  radius: number;
  background: Background;
  format: Format;
  quality: number;
}

export const DEFAULT_SETTINGS: Settings = {
  layout: "horizontal",
  size: 3000,
  columns: "auto",
  shape: "original",
  fit: "fill",
  spacing: 24,
  margin: 24,
  border: 0,
  borderColor: "#ffffff",
  radius: 0,
  background: { kind: "color", color: "#ffffff" },
  format: "png",
  quality: 0.92,
};

export const GRADIENTS: Record<GradientId, { label: string; stops: [string, string]; angle: number }> = {
  violet: { label: "Violet gradient", stops: ["#5b3df5", "#b25cf6"], angle: 135 },
  midnight: { label: "Midnight gradient", stops: ["#0b1838", "#4b2aa8"], angle: 160 },
  lilac: { label: "Lilac gradient", stops: ["#f3efff", "#d9ccff"], angle: 180 },
};

export const SOLID_COLORS = [
  { color: "#ffffff", label: "White" },
  { color: "#f1f3f9", label: "Mist" },
  { color: "#0b1838", label: "Dark blue" },
  { color: "#111114", label: "Black" },
];

export const SIZES = [1200, 2000, 3000, 4000];
