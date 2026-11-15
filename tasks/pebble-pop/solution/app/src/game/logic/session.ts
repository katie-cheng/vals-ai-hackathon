import { COLS, ROWS, type Board, type BoosterId, type ClearedItem, type HitItem, type LevelConfig, type MoveOutcome, type PebbleColor, type Pos, type Recovery } from "./types.ts";
import { cloneBoard, parseBoard } from "./board.ts";
import { applyGravity, canDrop, hasAnyDrop, placePebble } from "./placement.ts";
import { resolveBoard } from "./cascade.ts";
import { Rng } from "./rng.ts";
import { emptyProgress, trackProgress } from "./objectives.ts";
import { consumeMove, movesLeft, type MoveCounter } from "./moves.ts";
import { evaluateOutcome, type Outcome } from "./outcome.ts";
import { applyBomb, applyHammer, applySwap, bombTargetValid, deduct, hammerTargetValid, swapTargetsValid, type Inventory } from "./boosters.ts";
import { hitPoints, MOVES_LEFT_BONUS, starsFor } from "./scoring.ts";

/** Pure, animation-free model of one level. The Phaser scene replays the outcomes it returns. */
export class GameSession {
  readonly level: LevelConfig;
  board: Board;
  queue: PebbleColor[] = [];
  progress: number[];
  score = 0;
  moves: MoveCounter;
  inventory: Inventory;
  outcome: Outcome = "playing";
  bestChain = 0;
  private rng: Rng;

  constructor(level: LevelConfig, inventory: Inventory) {
    this.level = level;
    this.board = parseBoard(level.board);
    this.progress = emptyProgress(level.objectives);
    this.moves = { limit: level.moves, used: 0 };
    this.inventory = { ...inventory };
    this.rng = new Rng(level.seed);
    this.queue = [this.draw(), this.draw()];
  }

  get current(): PebbleColor {
    return this.queue[0];
  }

  get next(): PebbleColor {
    return this.queue[1];
  }

  get movesLeft(): number {
    return movesLeft(this.moves);
  }

  get stars(): 1 | 2 | 3 {
    return starsFor(this.score, this.level.stars);
  }

  private draw(): PebbleColor {
    const colors = this.level.colors;
    return colors[Math.floor(this.rng.next() * colors.length)];
  }

  canDrop(col: number): boolean {
    return this.outcome === "playing" && canDrop(this.board, col);
  }

  drop(col: number): MoveOutcome {
    if (this.outcome !== "playing") return { ok: false, reason: "busy" };
    if (col < 0 || col >= COLS) return { ok: false, reason: "invalid" };
    if (!canDrop(this.board, col)) return { ok: false, reason: "full" };
    const placed = placePebble(this.board, col, this.current)!;
    this.queue = [this.queue[1], this.draw()];
    this.moves = consumeMove(this.moves);
    const waves = resolveBoard(this.board);
    for (const w of waves) this.credit(w.cleared, w.hits, w.points);
    this.bestChain = Math.max(this.bestChain, waves.length);
    return { ok: true, placed, waves, recovery: this.finish() };
  }

  useBooster(id: BoosterId, targets: Pos[]): MoveOutcome {
    if (this.outcome !== "playing") return { ok: false, reason: "busy" };
    if (this.inventory[id] <= 0) return { ok: false, reason: "empty-inventory" };
    let cleared: ClearedItem[] = [];
    let hits: HitItem[] = [];
    let swapped: [Pos, Pos] | undefined;
    const [a, b] = targets;
    if (id === "hammer") {
      if (!a || !hammerTargetValid(this.board, a)) return { ok: false, reason: "invalid" };
      ({ cleared, hits } = applyHammer(this.board, a));
    } else if (id === "bomb") {
      if (!a || !bombTargetValid(this.board, a)) return { ok: false, reason: "invalid" };
      ({ cleared, hits } = applyBomb(this.board, a));
    } else {
      if (!a || !b || !swapTargetsValid(this.board, a, b)) return { ok: false, reason: "invalid" };
      applySwap(this.board, a, b);
      swapped = [a, b];
    }
    this.inventory = deduct(this.inventory, id);
    const boosterPoints = cleared.length * 10 + hitPoints(hits);
    this.credit(cleared, hits, boosterPoints);
    const falls = applyGravity(this.board);
    const waves = resolveBoard(this.board);
    for (const w of waves) this.credit(w.cleared, w.hits, w.points);
    return { ok: true, booster: { id, targets, cleared, hits, falls, swapped }, waves, recovery: this.finish() };
  }

  private credit(cleared: ClearedItem[], hits: HitItem[], points: number) {
    this.score += points;
    this.progress = trackProgress(this.level.objectives, this.progress, cleared, hits, this.score);
  }

  /** Settle the outcome; when the jar is jammed with moves left, loosen the top two rows. */
  private finish(): Recovery | undefined {
    this.outcome = evaluateOutcome(this.level.objectives, this.progress, this.movesLeft);
    if (this.outcome === "complete") {
      this.score += this.movesLeft * MOVES_LEFT_BONUS;
      this.progress = trackProgress(this.level.objectives, this.progress, [], [], this.score);
      return undefined;
    }
    if (this.outcome !== "playing" || hasAnyDrop(this.board)) return undefined;
    const cleared: ClearedItem[] = [];
    for (let col = 0; col < COLS; col++) {
      for (let row = ROWS - 2; row < ROWS; row++) {
        const cell = this.board[col][row];
        if (cell && cell.kind !== "lock") {
          cleared.push({ col, row, id: cell.id, kind: cell.kind, color: cell.kind === "pebble" ? cell.color : undefined });
          this.board[col][row] = null;
        }
      }
    }
    return { cleared, falls: applyGravity(this.board) };
  }

  clone(): GameSession {
    const copy = Object.create(GameSession.prototype) as GameSession;
    Object.assign(copy, this);
    copy.board = cloneBoard(this.board);
    copy.queue = [...this.queue];
    copy.progress = [...this.progress];
    copy.moves = { ...this.moves };
    copy.inventory = { ...this.inventory };
    copy.rng = this.rng.clone();
    return copy;
  }
}
