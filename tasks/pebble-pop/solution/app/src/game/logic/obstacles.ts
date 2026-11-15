import type { Board, HitItem, Pos } from "./types.ts";
import { neighbours } from "./matching.ts";

/**
 * A cleared group touches the obstacles beside it once per wave:
 * frozen pebbles thaw, flowers are cleared, stones crack then break, locks open.
 */
export function hitAdjacentObstacles(board: Board, clearedCells: Pos[]): HitItem[] {
  const clearedKeys = new Set(clearedCells.map((p) => `${p.col},${p.row}`));
  const touched = new Map<string, Pos>();
  for (const p of clearedCells) {
    for (const n of neighbours(p.col, p.row)) {
      const key = `${n.col},${n.row}`;
      if (!clearedKeys.has(key)) touched.set(key, n);
    }
  }
  const hits: HitItem[] = [];
  for (const p of touched.values()) {
    const hit = hitCell(board, p, false);
    if (hit) hits.push(hit);
  }
  return hits;
}

/** Apply one hit to a cell. `force` is used by boosters and removes obstacles outright. */
export function hitCell(board: Board, p: Pos, force: boolean): HitItem | null {
  const cell = board[p.col][p.row];
  if (!cell) return null;
  const base = { col: p.col, row: p.row, id: cell.id, kind: cell.kind };
  switch (cell.kind) {
    case "pebble":
      if (!cell.frozen) return null;
      cell.frozen = false;
      return { ...base, result: "thawed" };
    case "flower":
      board[p.col][p.row] = null;
      return { ...base, result: "removed" };
    case "stone":
      if (cell.hp === 2 && !force) {
        cell.hp = 1;
        return { ...base, result: "cracked" };
      }
      board[p.col][p.row] = null;
      return { ...base, result: "removed" };
    case "lock":
      board[p.col][p.row] = null;
      return { ...base, result: "unlocked" };
  }
}

export function isObstacle(board: Board, p: Pos): boolean {
  const cell = board[p.col][p.row];
  return !!cell && (cell.kind !== "pebble" || cell.frozen);
}
