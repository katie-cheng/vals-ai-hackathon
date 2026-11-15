import { ROWS, type Board, type Fall, type PebbleColor, type Placed } from "./types.ts";
import { newId } from "./board.ts";

/** Row where a pebble dropped into this column would come to rest, or -1 when the column is full. */
export function landingRow(board: Board, col: number): number {
  const column = board[col];
  for (let row = ROWS - 1; row >= 0; row--) {
    if (column[row]) return row + 1 < ROWS ? row + 1 : -1;
  }
  return 0;
}

export function canDrop(board: Board, col: number): boolean {
  return col >= 0 && col < board.length && landingRow(board, col) >= 0;
}

export function hasAnyDrop(board: Board): boolean {
  return board.some((_, col) => canDrop(board, col));
}

export function placePebble(board: Board, col: number, color: PebbleColor): Placed | null {
  const row = landingRow(board, col);
  if (row < 0) return null;
  const id = newId();
  board[col][row] = { kind: "pebble", id, color, frozen: false };
  return { id, col, row, color };
}

/** Compact every column downward. Locks are fixed in place and hold up what rests on them. */
export function applyGravity(board: Board): Fall[] {
  const falls: Fall[] = [];
  board.forEach((column, col) => {
    let floor = 0;
    for (let row = 0; row < ROWS; row++) {
      const cell = column[row];
      if (!cell) continue;
      if (cell.kind === "lock") {
        floor = row + 1;
        continue;
      }
      if (row !== floor) {
        column[floor] = cell;
        column[row] = null;
        falls.push({ id: cell.id, col, fromRow: row, toRow: floor });
      }
      floor++;
    }
  });
  return falls;
}
