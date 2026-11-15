export const COLS = 7;
export const ROWS = 8;

export const PEBBLE_COLORS = ["orange", "blue", "purple", "green", "red", "yellow", "pink"] as const;
export type PebbleColor = (typeof PEBBLE_COLORS)[number];

export type BoosterId = "hammer" | "swap" | "bomb";

export interface Pos {
  col: number;
  row: number;
}

export type Cell =
  | { kind: "pebble"; id: number; color: PebbleColor; frozen: boolean }
  | { kind: "stone"; id: number; hp: 1 | 2 }
  | { kind: "flower"; id: number }
  | { kind: "lock"; id: number }
  | null;

/** board[col][row], row 0 is the bottom of the jar. */
export type Board = Cell[][];

export type Objective =
  | { type: "collect"; color: PebbleColor; target: number }
  | { type: "frozen"; target: number }
  | { type: "flowers"; target: number }
  | { type: "stones"; target: number }
  | { type: "locks"; target: number }
  | { type: "score"; target: number };

export type Difficulty = "Gentle" | "Easy" | "Medium" | "Hard" | "Expert";

export interface LevelConfig {
  id: number;
  chapter: 1 | 2 | 3 | 4;
  colors: PebbleColor[];
  moves: number;
  objectives: Objective[];
  /** Eight rows, top to bottom, seven characters each. See board.ts for the legend. */
  board: string[];
  difficulty: Difficulty;
  stars: [number, number, number];
  rewards: { acorns: number; crystals?: number; booster?: BoosterId };
  seed: number;
  tip?: string;
}

export type HitResult = "thawed" | "cracked" | "removed" | "unlocked";

export interface ClearedItem extends Pos {
  id: number;
  kind: "pebble" | "stone" | "flower" | "lock";
  color?: PebbleColor;
  frozen?: boolean;
}

export interface HitItem extends Pos {
  id: number;
  kind: "pebble" | "stone" | "flower" | "lock";
  result: HitResult;
}

export interface Fall {
  id: number;
  col: number;
  fromRow: number;
  toRow: number;
}

export interface Wave {
  chain: number;
  groups: { color: PebbleColor; cells: Pos[] }[];
  cleared: ClearedItem[];
  hits: HitItem[];
  points: number;
  falls: Fall[];
}

export interface Placed extends Pos {
  id: number;
  color: PebbleColor;
}

export interface Recovery {
  cleared: ClearedItem[];
  falls: Fall[];
}

export type MoveOutcome =
  | {
      ok: true;
      placed?: Placed;
      booster?: { id: BoosterId; targets: Pos[]; cleared: ClearedItem[]; hits: HitItem[]; falls: Fall[]; swapped?: [Pos, Pos] };
      waves: Wave[];
      recovery?: Recovery;
    }
  | { ok: false; reason: "full" | "busy" | "invalid" | "empty-inventory" };
