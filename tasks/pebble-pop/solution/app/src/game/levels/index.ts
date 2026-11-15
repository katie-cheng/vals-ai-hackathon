import type { LevelConfig } from "../logic/types.ts";
import { mossyGrove } from "./chapter1.ts";
import { frostHollow } from "./chapter2.ts";
import { blossomCreek } from "./chapter3.ts";
import { autumnRidge } from "./chapter4.ts";

export interface ChapterInfo {
  id: 1 | 2 | 3 | 4;
  key: "mossyGrove" | "frostHollow" | "blossomCreek" | "autumnRidge";
  first: number;
  last: number;
  levels: LevelConfig[];
}

export const CHAPTERS: ChapterInfo[] = [
  { id: 1, key: "mossyGrove", first: 1, last: 10, levels: mossyGrove },
  { id: 2, key: "frostHollow", first: 11, last: 20, levels: frostHollow },
  { id: 3, key: "blossomCreek", first: 21, last: 30, levels: blossomCreek },
  { id: 4, key: "autumnRidge", first: 31, last: 40, levels: autumnRidge },
];

export const LEVELS: LevelConfig[] = CHAPTERS.flatMap((c) => c.levels);
export const LEVEL_COUNT = LEVELS.length;

export function getLevel(id: number): LevelConfig | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function chapterOf(levelId: number): ChapterInfo {
  return CHAPTERS.find((c) => levelId >= c.first && levelId <= c.last) ?? CHAPTERS[0];
}
