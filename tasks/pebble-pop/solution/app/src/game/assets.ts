import type { BoosterId, PebbleColor } from "./logic/types.ts";

const A = "/assets";
export const pebbleImg = (c: PebbleColor) => `${A}/pebbles/${c}.png`;
export const spriteImg = (n: "frozen" | "stone" | "stone-cracked" | "flower" | "lock" | "crystal" | "star" | "star-empty" | "acorn" | "medal") => `${A}/sprites/${n}.png`;
export const boosterImg = (b: BoosterId) => `${A}/boosters/${b}.png`;
export const effectImg = (e: "sparkle" | "leaf" | "petal" | "snow" | "ring") => `${A}/effects/${e}.png`;
export const jarImg = (j: "jar-back" | "jar-front" | "jar-base") => `${A}/jar/${j}.png`;
export const envImg = (e: "foliage-left" | "foliage-right" | "ferns-bottom") => `${A}/environment/${e}.png`;
export const bgImg = (b: "menu-forest" | "backdrop-wide" | "chapter-mossy" | "chapter-frost" | "chapter-blossom" | "chapter-autumn" | "world-map") => `${A}/backgrounds/${b}.webp`;
export const LOGO = `${A}/ui/logo.png`;
export const APP_ICON = `${A}/ui/app-icon.png`;

export const CHAPTER_BG = ["chapter-mossy", "chapter-frost", "chapter-blossom", "chapter-autumn"] as const;
