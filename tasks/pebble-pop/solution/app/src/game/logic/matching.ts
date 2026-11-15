import { COLS, ROWS, type Board, type PebbleColor, type Pos } from "./types.ts";

export const MIN_MATCH = 3;
const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

export function neighbours(col: number, row: number): Pos[] {
  return DIRS.map(([dc, dr]) => ({ col: col + dc, row: row + dr })).filter(
    (p) => p.col >= 0 && p.col < COLS && p.row >= 0 && p.row < ROWS,
  );
}

function matchable(board: Board, col: number, row: number): PebbleColor | null {
  const cell = board[col][row];
  return cell && cell.kind === "pebble" && !cell.frozen ? cell.color : null;
}

/** Orthogonally connected groups of identical free pebbles. Diagonals never connect. */
export function connectedComponents(board: Board): { color: PebbleColor; cells: Pos[] }[] {
  const seen = new Set<number>();
  const groups: { color: PebbleColor; cells: Pos[] }[] = [];
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const color = matchable(board, col, row);
      if (!color || seen.has(col * ROWS + row)) continue;
      const cells: Pos[] = [];
      const stack: Pos[] = [{ col, row }];
      seen.add(col * ROWS + row);
      while (stack.length) {
        const p = stack.pop()!;
        cells.push(p);
        for (const n of neighbours(p.col, p.row)) {
          const key = n.col * ROWS + n.row;
          if (!seen.has(key) && matchable(board, n.col, n.row) === color) {
            seen.add(key);
            stack.push(n);
          }
        }
      }
      groups.push({ color, cells });
    }
  }
  return groups;
}

export function findMatches(board: Board): { color: PebbleColor; cells: Pos[] }[] {
  return connectedComponents(board).filter((g) => g.cells.length >= MIN_MATCH);
}
