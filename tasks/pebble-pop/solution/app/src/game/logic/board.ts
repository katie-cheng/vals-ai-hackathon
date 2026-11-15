import { COLS, ROWS, type Board, type Cell, type PebbleColor } from "./types.ts";

/**
 * Board legend (rows are written top to bottom):
 *   o b p g r y k  orange, blue, purple, green, red, yellow, pink pebble
 *   O B P G R Y K  the same pebble, frozen
 *   #  stone obstacle (two hits)   *  flower obstacle   X  lock (restricted space)
 *   .  empty
 */
export const LETTER_TO_COLOR: Record<string, PebbleColor> = {
  o: "orange",
  b: "blue",
  p: "purple",
  g: "green",
  r: "red",
  y: "yellow",
  k: "pink",
};

let nextId = 1;
export const newId = () => nextId++;

export function emptyBoard(): Board {
  return Array.from({ length: COLS }, () => Array<Cell>(ROWS).fill(null));
}

export function parseBoard(rows: string[]): Board {
  if (rows.length !== ROWS || rows.some((r) => r.length !== COLS)) {
    throw new Error(`Board must be ${ROWS} rows of ${COLS} characters`);
  }
  const board = emptyBoard();
  rows.forEach((line, i) => {
    const row = ROWS - 1 - i;
    [...line].forEach((ch, col) => {
      board[col][row] = parseCell(ch);
    });
  });
  return board;
}

function parseCell(ch: string): Cell {
  if (ch === ".") return null;
  if (ch === "#") return { kind: "stone", id: newId(), hp: 2 };
  if (ch === "*") return { kind: "flower", id: newId() };
  if (ch === "X") return { kind: "lock", id: newId() };
  const lower = ch.toLowerCase();
  const color = LETTER_TO_COLOR[lower];
  if (!color) throw new Error(`Unknown board character "${ch}"`);
  return { kind: "pebble", id: newId(), color, frozen: ch !== lower };
}

export function cloneBoard(board: Board): Board {
  return board.map((col) => col.map((cell) => (cell ? { ...cell } : null)));
}

export function inBounds(col: number, row: number): boolean {
  return col >= 0 && col < COLS && row >= 0 && row < ROWS;
}

export function countWhere(board: Board, test: (cell: NonNullable<Cell>) => boolean): number {
  let n = 0;
  for (const col of board) for (const cell of col) if (cell && test(cell)) n++;
  return n;
}
