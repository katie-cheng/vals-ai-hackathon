import { useSyncExternalStore } from "react";
import type { BoosterId } from "../game/logic/types.ts";
import type { Inventory } from "../game/logic/boosters.ts";
import { LEVEL_COUNT } from "../game/levels/index.ts";

export type Language = "en" | "es" | "fr";

export interface Settings {
  music: boolean;
  sound: boolean;
  vibration: boolean;
  language: Language;
}

export interface Stats {
  levelsCompleted: number;
  pebblesCleared: number;
  frozenFreed: number;
  flowersCleared: number;
  stonesBroken: number;
  boostersUsed: number;
  bestChain: number;
  dailyWins: number;
}

export interface SaveData {
  version: 1;
  unlocked: number;
  stars: Record<number, number>;
  best: Record<number, number>;
  acorns: number;
  crystals: number;
  boosters: Inventory;
  settings: Settings;
  stats: Stats;
  claimed: string[];
  dailyDone: string | null;
}

const KEY = "pebble-pop/save";

export const DEFAULT_SAVE: SaveData = {
  version: 1,
  unlocked: 1,
  stars: {},
  best: {},
  acorns: 150,
  crystals: 0,
  boosters: { hammer: 2, swap: 2, bomb: 1 },
  settings: { music: true, sound: true, vibration: true, language: "en" },
  stats: { levelsCompleted: 0, pebblesCleared: 0, frozenFreed: 0, flowersCleared: 0, stonesBroken: 0, boostersUsed: 0, bestChain: 0, dailyWins: 0 },
  claimed: [],
  dailyDone: null,
};

function load(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SAVE;
    const data = JSON.parse(raw) as Partial<SaveData>;
    return {
      ...DEFAULT_SAVE,
      ...data,
      boosters: { ...DEFAULT_SAVE.boosters, ...data.boosters },
      settings: { ...DEFAULT_SAVE.settings, ...data.settings },
      stats: { ...DEFAULT_SAVE.stats, ...data.stats },
    };
  } catch {
    return DEFAULT_SAVE;
  }
}

let state = load();
const listeners = new Set<() => void>();

export function getSave(): SaveData {
  return state;
}

export function updateSave(fn: (s: SaveData) => SaveData) {
  state = fn(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage can be unavailable in private modes; progress then lasts for the session */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useSave(): SaveData {
  return useSyncExternalStore(subscribe, getSave);
}

export const isUnlocked = (s: SaveData, level: number) => level <= s.unlocked;

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
  updateSave((s) => ({ ...s, settings: { ...s.settings, [key]: value } }));
}

export interface LevelResult {
  level: number;
  score: number;
  stars: number;
  acorns: number;
  crystals: number;
  booster?: BoosterId;
  firstClear: boolean;
  newBest: boolean;
}

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const nextLevelFor = (s: SaveData) => Math.min(s.unlocked, LEVEL_COUNT);
