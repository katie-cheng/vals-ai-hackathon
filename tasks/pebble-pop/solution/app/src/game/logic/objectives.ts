import type { ClearedItem, HitItem, Objective } from "./types.ts";

export function emptyProgress(objectives: Objective[]): number[] {
  return objectives.map(() => 0);
}

/** Credit clears and obstacle hits to each objective. Progress is capped at the target. */
export function trackProgress(
  objectives: Objective[],
  progress: number[],
  cleared: ClearedItem[],
  hits: HitItem[],
  score: number,
): number[] {
  return objectives.map((obj, i) => {
    let gained = 0;
    switch (obj.type) {
      case "collect":
        gained = cleared.filter((c) => c.kind === "pebble" && c.color === obj.color).length;
        break;
      case "frozen":
        gained =
          hits.filter((h) => h.result === "thawed").length +
          cleared.filter((c) => c.kind === "pebble" && c.frozen).length;
        break;
      case "flowers":
        gained = [...hits, ...cleared].filter((h) => h.kind === "flower").length;
        break;
      case "stones":
        gained =
          hits.filter((h) => h.kind === "stone" && h.result === "removed").length +
          cleared.filter((c) => c.kind === "stone").length;
        break;
      case "locks":
        gained = [...hits, ...cleared].filter((h) => h.kind === "lock").length;
        break;
      case "score":
        return Math.min(obj.target, score);
    }
    return Math.min(obj.target, progress[i] + gained);
  });
}

export function objectivesMet(objectives: Objective[], progress: number[]): boolean {
  return objectives.every((obj, i) => progress[i] >= obj.target);
}
