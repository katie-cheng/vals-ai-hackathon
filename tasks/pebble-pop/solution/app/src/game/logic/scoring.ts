import type { HitItem } from "./types.ts";

export const POINTS_PER_PEBBLE = 10;
export const EXTRA_PEBBLE_BONUS = 15;
export const MOVES_LEFT_BONUS = 40;

const HIT_POINTS: Record<HitItem["result"], number> = {
  thawed: 20,
  cracked: 20,
  removed: 40,
  unlocked: 30,
};

export function groupPoints(size: number): number {
  return size * POINTS_PER_PEBBLE + Math.max(0, size - 3) * EXTRA_PEBBLE_BONUS;
}

export function hitPoints(hits: HitItem[]): number {
  return hits.reduce((sum, h) => sum + HIT_POINTS[h.result], 0);
}

/** Cascades multiply everything cleared in the wave by its chain number. */
export function wavePoints(groupSizes: number[], hits: HitItem[], chain: number): number {
  const base = groupSizes.reduce((s, n) => s + groupPoints(n), 0) + hitPoints(hits);
  return base * chain;
}

export function starsFor(score: number, thresholds: [number, number, number]): 1 | 2 | 3 {
  if (score >= thresholds[2]) return 3;
  if (score >= thresholds[1]) return 2;
  return 1;
}
