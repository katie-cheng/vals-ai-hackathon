import { ROWS } from "../logic/types.ts";

/** World coordinates of the jar scene. The React overlay uses the same numbers as percentages. */
export const WORLD = { width: 900, height: 1250 };
export const JAR = { x: 20, y: 110, width: 860, height: 1040 };
export const GRID = { x: 100, y: 280, cell: 100, cols: 7, rows: 8 };
export const BASE = { y: 1105, width: 900, height: 143 };
export const GHOST_Y = 58;

export const cellX = (col: number) => GRID.x + col * GRID.cell + GRID.cell / 2;
export const cellY = (row: number) => GRID.y + (ROWS - 1 - row) * GRID.cell + GRID.cell / 2;
export const pct = (v: number, of: number) => `${(v / of) * 100}%`;
