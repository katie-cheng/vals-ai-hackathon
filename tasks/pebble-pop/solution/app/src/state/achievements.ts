import type { StringKey } from "./i18n.ts";
import type { SaveData } from "./store.ts";

export interface Achievement {
  id: string;
  title: StringKey;
  text: StringKey;
  reward: number;
  progress: (s: SaveData) => [number, number];
}

const stars = (s: SaveData) => Object.values(s.stars);
const cleared = (s: SaveData, a: number, b: number) => Object.keys(s.stars).filter((k) => +k >= a && +k <= b).length;

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first", title: "ach_first", text: "ach_firstText", reward: 25, progress: (s) => [Math.min(1, s.stats.levelsCompleted), 1] },
  { id: "three", title: "ach_three", text: "ach_threeText", reward: 30, progress: (s) => [stars(s).some((n) => n >= 3) ? 1 : 0, 1] },
  { id: "chain", title: "ach_chain", text: "ach_chainText", reward: 35, progress: (s) => [Math.min(3, s.stats.bestChain), 3] },
  { id: "ch1", title: "ach_ch1", text: "ach_ch1Text", reward: 50, progress: (s) => [cleared(s, 1, 10), 10] },
  { id: "ch2", title: "ach_ch2", text: "ach_ch2Text", reward: 60, progress: (s) => [Math.min(30, s.stats.frozenFreed), 30] },
  { id: "ch3", title: "ach_ch3", text: "ach_ch3Text", reward: 70, progress: (s) => [Math.min(30, s.stats.flowersCleared), 30] },
  { id: "ch4", title: "ach_ch4", text: "ach_ch4Text", reward: 80, progress: (s) => [Math.min(20, s.stats.stonesBroken), 20] },
  { id: "boost", title: "ach_boost", text: "ach_boostText", reward: 45, progress: (s) => [Math.min(10, s.stats.boostersUsed), 10] },
  { id: "daily", title: "ach_daily", text: "ach_dailyText", reward: 40, progress: (s) => [Math.min(1, s.stats.dailyWins), 1] },
  { id: "all", title: "ach_all", text: "ach_allText", reward: 150, progress: (s) => [cleared(s, 1, 40), 40] },
];
