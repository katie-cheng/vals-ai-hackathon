/**
 * Plays every level with a greedy two-pebble lookahead bot that never uses boosters,
 * and checks the level data: board shape, settled pebbles, no matches at the start,
 * and that the bot clears every level inside its move limit.
 * Run with `npm run verify-levels` (Node 22.6+ strips the TypeScript types).
 */
import { LEVELS } from "../src/game/levels/index.ts";
import { GameSession } from "../src/game/logic/session.ts";
import { parseBoard, cloneBoard } from "../src/game/logic/board.ts";
import { findMatches } from "../src/game/logic/matching.ts";
import { applyGravity } from "../src/game/logic/placement.ts";
import { COLS } from "../src/game/logic/types.ts";

const START = { hammer: 0, swap: 0, bomb: 0 };

function value(s: GameSession): number {
  const objective = s.level.objectives.reduce((sum, o, i) => sum + s.progress[i] / o.target, 0);
  const heights = s.board.map((col) => col.filter(Boolean).length);
  const crowding = heights.reduce((sum, h) => sum + (h >= 6 ? (h - 5) ** 2 * 4 : 0), 0);
  const wanted = new Set(s.level.objectives.flatMap((o) => (o.type === "collect" ? [o.color] : [])));
  let pairs = 0;
  s.board.forEach((col, c) =>
    col.forEach((cell, r) => {
      if (!cell || cell.kind !== "pebble" || cell.frozen) return;
      for (const [dc, dr] of [[1, 0], [0, 1]]) {
        const n = s.board[c + dc]?.[r + dr];
        if (n && n.kind === "pebble" && !n.frozen && n.color === cell.color) pairs += wanted.has(cell.color) ? 3 : 1;
      }
    }),
  );
  const done = s.outcome === "complete" ? 1e6 : 0;
  return done + objective * 1000 + s.score * 0.2 + pairs * 12 - crowding * 25 - heights.reduce((a, h) => a + h, 0) * 3;
}

function bestColumn(s: GameSession): number {
  let best = -1;
  let bestValue = -Infinity;
  for (let c = 0; c < COLS; c++) {
    if (!s.canDrop(c)) continue;
    const a = s.clone();
    a.drop(c);
    let v = value(a);
    if (a.outcome === "playing") {
      let look = -Infinity;
      for (let d = 0; d < COLS; d++) {
        if (!a.canDrop(d)) continue;
        const b = a.clone();
        b.drop(d);
        look = Math.max(look, value(b));
      }
      if (look > -Infinity) v = v * 0.4 + look * 0.6;
    }
    if (v > bestValue) {
      bestValue = v;
      best = c;
    }
  }
  return best;
}

export function playLevel(id: number, moveLimit?: number) {
  const level = LEVELS.find((l) => l.id === id)!;
  const s = new GameSession(moveLimit ? { ...level, moves: moveLimit } : level, START);
  while (s.outcome === "playing") {
    const col = bestColumn(s);
    if (col < 0) break;
    s.drop(col);
  }
  return { outcome: s.outcome, used: s.moves.used, score: s.score };
}

const problems: string[] = [];
const report: Record<string, { moves: number; botMoves: number; botScore: number; stars: number[] }> = {};
LEVELS.forEach((level, i) => {
  if (level.id !== i + 1) problems.push(`level ${i + 1}: id is ${level.id}`);
  const board = parseBoard(level.board);
  if (findMatches(board).length) problems.push(`level ${level.id}: starts with a match`);
  if (applyGravity(cloneBoard(board)).length) problems.push(`level ${level.id}: floating pieces`);
  const run = playLevel(level.id);
  if (run.outcome !== "complete") problems.push(`level ${level.id}: bot ${run.outcome} after ${run.used} of ${level.moves} moves`);
  if (!(level.stars[0] < level.stars[1] && level.stars[1] < level.stars[2])) problems.push(`level ${level.id}: star thresholds must increase`);
  report[level.id] = { moves: level.moves, botMoves: run.used, botScore: run.score, stars: level.stars };
});

if (process.argv.includes("--json")) {
  const free = Object.fromEntries(LEVELS.map((l) => [l.id, playLevel(l.id, 99)]));
  console.log(JSON.stringify(free));
} else {
  for (const [id, r] of Object.entries(report)) console.log(`level ${id.padStart(2)}  limit ${r.moves}  bot ${r.botMoves}  score ${r.botScore}  stars ${r.stars.join("/")}`);
  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log(`All ${LEVELS.length} levels verified.`);
}
