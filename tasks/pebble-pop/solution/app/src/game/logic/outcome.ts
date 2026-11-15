import type { Objective } from "./types.ts";
import { objectivesMet } from "./objectives.ts";

export type Outcome = "playing" | "complete" | "failed";

export function evaluateOutcome(objectives: Objective[], progress: number[], movesLeft: number): Outcome {
  if (objectivesMet(objectives, progress)) return "complete";
  if (movesLeft <= 0) return "failed";
  return "playing";
}

export function failureReason(objectives: Objective[], progress: number[]): string[] {
  return objectives.flatMap((obj, i) => (progress[i] < obj.target ? [`${obj.type}:${obj.target - progress[i]}`] : []));
}
