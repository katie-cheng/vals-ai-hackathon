import type { LevelConfig } from "../logic/types.ts";
import { LEVELS } from "./index.ts";

function hash(s: string): number {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}

/** The daily jar reuses a verified level layout from chapters one to three with a date-seeded pebble order and extra moves. */
export function dailyLevel(date: string): LevelConfig {
  const h = hash(date);
  const pool = LEVELS.filter((l) => l.id >= 4 && l.id <= 28);
  const base = pool[h % pool.length];
  return { ...base, seed: base.seed, moves: base.moves + 6, rewards: { acorns: 60, crystals: 1 } , tip: base.tip };
}
