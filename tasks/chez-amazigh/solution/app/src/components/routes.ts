import type { Dict } from "../i18n/en";

export type PageKey = keyof Dict["meta"]["pages"];

export const ROUTES: { key: Exclude<PageKey, "home">; path: string }[] = [
  { key: "story", path: "/story" },
  { key: "stay", path: "/accommodation" },
  { key: "table", path: "/gastronomy" },
  { key: "experiences", path: "/experiences" },
  { key: "gallery", path: "/gallery" },
  { key: "location", path: "/location" },
  { key: "contact", path: "/contact" },
];

export const pathOf = (key: PageKey) => (key === "home" ? "/" : ROUTES.find((r) => r.key === key)!.path);
