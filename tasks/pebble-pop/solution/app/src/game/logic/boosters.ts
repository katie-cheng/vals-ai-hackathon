import type { Board, BoosterId, ClearedItem, HitItem, Pos } from "./types.ts";
import { inBounds } from "./board.ts";
import { hitCell } from "./obstacles.ts";

export type Inventory = Record<BoosterId, number>;

export const BOOSTERS: BoosterId[] = ["hammer", "swap", "bomb"];

export function canUse(inventory: Inventory, id: BoosterId): boolean {
  return inventory[id] > 0;
}

export function deduct(inventory: Inventory, id: BoosterId): Inventory {
  if (!canUse(inventory, id)) throw new Error(`No ${id} left`);
  return { ...inventory, [id]: inventory[id] - 1 };
}

export function award(inventory: Inventory, id: BoosterId, amount = 1): Inventory {
  return { ...inventory, [id]: inventory[id] + amount };
}

function toCleared(board: Board, p: Pos): ClearedItem | null {
  const cell = board[p.col][p.row];
  if (!cell) return null;
  return {
    ...p,
    id: cell.id,
    kind: cell.kind,
    color: cell.kind === "pebble" ? cell.color : undefined,
    frozen: cell.kind === "pebble" ? cell.frozen : undefined,
  };
}

/** Hammer: removes one pebble, frozen pebble, flower or stone. Locks cannot be hammered. */
export function hammerTargetValid(board: Board, p: Pos): boolean {
  const cell = inBounds(p.col, p.row) ? board[p.col][p.row] : null;
  return !!cell && cell.kind !== "lock";
}

export function applyHammer(board: Board, p: Pos): { cleared: ClearedItem[]; hits: HitItem[] } {
  const item = toCleared(board, p);
  if (!item || item.kind === "lock") return { cleared: [], hits: [] };
  board[p.col][p.row] = null;
  return { cleared: [item], hits: [] };
}

/** Swap: exchanges two orthogonally adjacent free pebbles. */
export function swapTargetsValid(board: Board, a: Pos, b: Pos): boolean {
  if (Math.abs(a.col - b.col) + Math.abs(a.row - b.row) !== 1) return false;
  const ca = board[a.col]?.[a.row];
  const cb = board[b.col]?.[b.row];
  const free = (c: typeof ca) => !!c && c.kind === "pebble" && !c.frozen;
  return free(ca) && free(cb);
}

export function swapFirstValid(board: Board, p: Pos): boolean {
  const cell = inBounds(p.col, p.row) ? board[p.col][p.row] : null;
  return !!cell && cell.kind === "pebble" && !cell.frozen;
}

export function applySwap(board: Board, a: Pos, b: Pos): void {
  const tmp = board[a.col][a.row];
  board[a.col][a.row] = board[b.col][b.row];
  board[b.col][b.row] = tmp;
}

/** Bomb: clears the 3 x 3 area around the target. Stones break outright and locks open. */
export function bombArea(p: Pos): Pos[] {
  const area: Pos[] = [];
  for (let dc = -1; dc <= 1; dc++)
    for (let dr = -1; dr <= 1; dr++) if (inBounds(p.col + dc, p.row + dr)) area.push({ col: p.col + dc, row: p.row + dr });
  return area;
}

export function bombTargetValid(board: Board, p: Pos): boolean {
  return inBounds(p.col, p.row) && bombArea(p).some((q) => board[q.col][q.row]);
}

export function applyBomb(board: Board, p: Pos): { cleared: ClearedItem[]; hits: HitItem[] } {
  const cleared: ClearedItem[] = [];
  const hits: HitItem[] = [];
  for (const q of bombArea(p)) {
    const cell = board[q.col][q.row];
    if (!cell) continue;
    if (cell.kind === "lock") {
      const hit = hitCell(board, q, true);
      if (hit) hits.push(hit);
      continue;
    }
    const item = toCleared(board, q)!;
    cleared.push(item);
    board[q.col][q.row] = null;
  }
  return { cleared, hits };
}
