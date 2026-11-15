import type { Board, ClearedItem, Wave } from "./types.ts";
import { findMatches } from "./matching.ts";
import { hitAdjacentObstacles } from "./obstacles.ts";
import { applyGravity } from "./placement.ts";
import { wavePoints } from "./scoring.ts";

const MAX_WAVES = 40;

/** Clear every match, damage neighbouring obstacles, settle the jar and repeat until stable. */
export function resolveBoard(board: Board, startChain = 1): Wave[] {
  const waves: Wave[] = [];
  for (let chain = startChain; waves.length < MAX_WAVES; chain++) {
    const groups = findMatches(board);
    if (!groups.length) break;
    const cells = groups.flatMap((g) => g.cells);
    const cleared: ClearedItem[] = cells.map(({ col, row }) => {
      const cell = board[col][row]!;
      return {
        col,
        row,
        id: cell.id,
        kind: "pebble",
        color: cell.kind === "pebble" ? cell.color : undefined,
        frozen: false,
      };
    });
    for (const { col, row } of cells) board[col][row] = null;
    const hits = hitAdjacentObstacles(board, cells);
    const falls = applyGravity(board);
    waves.push({
      chain,
      groups,
      cleared,
      hits,
      points: wavePoints(
        groups.map((g) => g.cells.length),
        hits,
        chain,
      ),
      falls,
    });
  }
  return waves;
}
