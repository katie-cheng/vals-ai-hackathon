import { GameSession } from "./logic/session.ts";
import { landingRow } from "./logic/placement.ts";
import { trackProgress } from "./logic/objectives.ts";
import { hitPoints } from "./logic/scoring.ts";
import { bombArea, bombTargetValid, hammerTargetValid, swapFirstValid, swapTargetsValid, type Inventory } from "./logic/boosters.ts";
import type { BoosterId, ClearedItem, HitItem, LevelConfig, MoveOutcome, PebbleColor, Pos } from "./logic/types.ts";
import type { JarScene } from "./phaser/JarScene.ts";
import { audio } from "../audio/audio.ts";
import type { StringKey } from "../state/i18n.ts";

export type MachineState = "READY" | "DROPPING" | "MATCHING" | "CLEARING" | "CASCADING" | "LEVEL_COMPLETE" | "LEVEL_FAILED" | "PAUSED";

export interface Notice {
  key: StringKey;
  vars?: Record<string, number | string>;
  id: number;
}

export interface Snapshot {
  state: MachineState;
  score: number;
  movesLeft: number;
  progress: number[];
  current: PebbleColor;
  next: PebbleColor;
  inventory: Inventory;
  booster: BoosterId | null;
  swapFirst: Pos | null;
  notice: Notice | null;
  /** board[col][row] summary for the accessible grid: color letter, kind or empty. */
  cells: string[][];
}

export interface RunStats {
  pebblesCleared: number;
  frozenFreed: number;
  flowersCleared: number;
  stonesBroken: number;
  bestChain: number;
}

interface Hooks {
  onBoosterUsed(id: BoosterId): void;
  onEnd(result: "complete" | "failed", session: GameSession, stats: RunStats): void;
  cascadeLabel(chain: number): string;
}

let noticeId = 0;

/** The game state machine. React calls it for input, it asks the model for an outcome and replays that through the scene. */
export class JarController {
  readonly session: GameSession;
  private scene: JarScene | null = null;
  private listeners = new Set<() => void>();
  private snap: Snapshot;
  private pendingPause = false;
  private hovered: number | null = null;
  private stats: RunStats = { pebblesCleared: 0, frozenFreed: 0, flowersCleared: 0, stonesBroken: 0, bestChain: 0 };
  private hooks: Hooks;

  constructor(level: LevelConfig, inventory: Inventory, hooks: Hooks) {
    this.session = new GameSession(level, inventory);
    this.hooks = hooks;
    this.snap = this.build("READY", this.session.score, this.session.progress, null, null, null);
  }

  attach(scene: JarScene) {
    this.scene = scene;
    scene.sync(this.session.board);
  }

  subscribe = (l: () => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };

  getSnapshot = () => this.snap;

  private build(state: MachineState, score: number, progress: number[], booster: BoosterId | null, swapFirst: Pos | null, notice: Notice | null): Snapshot {
    const s = this.session;
    return {
      state,
      score,
      progress,
      booster,
      swapFirst,
      notice,
      movesLeft: s.movesLeft,
      current: s.current,
      next: s.next,
      inventory: s.inventory,
      cells: s.board.map((col) =>
        col.map((c) => (!c ? "empty" : c.kind === "pebble" ? `${c.color}${c.frozen ? "-frozen" : ""}` : c.kind === "stone" ? `stone-${c.hp}` : c.kind)),
      ),
    };
  }

  private set(patch: Partial<Snapshot>) {
    this.snap = { ...this.snap, ...patch };
    this.listeners.forEach((l) => l());
  }

  private refresh(patch: Partial<Snapshot> = {}) {
    const b = this.build(this.snap.state, this.snap.score, this.snap.progress, this.snap.booster, this.snap.swapFirst, this.snap.notice);
    this.set({ ...b, ...patch });
  }

  private notify(key: StringKey, vars?: Record<string, number | string>) {
    this.set({ notice: { key, vars, id: ++noticeId } });
  }

  get state() {
    return this.snap.state;
  }

  hover(col: number | null) {
    this.hovered = col;
    if (!this.scene || this.snap.state !== "READY" || this.snap.booster) return this.scene?.showGuide(null, this.session.current, -1);
    this.scene.showGuide(col, this.session.current, col === null ? -1 : landingRow(this.session.board, col));
  }

  async tapColumn(col: number) {
    if (this.snap.state !== "READY" || !this.scene) return;
    if (this.snap.booster) return;
    if (!this.session.canDrop(col)) {
      audio.vibrate(30);
      this.notify("columnFull");
      return;
    }
    this.set({ state: "DROPPING", notice: null });
    const outcome = this.session.drop(col);
    await this.play(outcome);
  }

  tapCell(p: Pos) {
    if (this.snap.state !== "READY") return;
    const id = this.snap.booster;
    if (!id) return void this.tapColumn(p.col);
    const board = this.session.board;
    if (id === "hammer") {
      if (!hammerTargetValid(board, p)) return this.notify("hammerHelp");
      return void this.fire("hammer", [p]);
    }
    if (id === "bomb") {
      if (!bombTargetValid(board, p)) return this.notify("bombHelp");
      return void this.fire("bomb", [p]);
    }
    const first = this.snap.swapFirst;
    if (first && first.col === p.col && first.row === p.row) return this.setTargets(id, null);
    if (first && swapTargetsValid(board, first, p)) return void this.fire("swap", [first, p]);
    if (swapFirstValid(board, p)) {
      this.setTargets(id, p);
      return this.notify("swapHelp2");
    }
    this.notify("swapHelp");
  }

  hoverCell(p: Pos | null) {
    if (!this.scene || this.snap.booster !== "bomb") return;
    this.scene.showTargets(p ? bombArea(p) : [], null);
  }

  selectBooster(id: BoosterId) {
    if (this.snap.state !== "READY") return;
    if (this.snap.booster === id) return this.cancelBooster();
    if (this.session.inventory[id] <= 0) return this.notify("notEnough");
    audio.play("button", 0.5);
    this.scene?.showGuide(null, this.session.current, -1);
    this.setTargets(id, null);
    this.notify(id === "hammer" ? "hammerHelp" : id === "swap" ? "swapHelp" : "bombHelp");
  }

  cancelBooster() {
    this.scene?.showTargets([], null);
    this.set({ booster: null, swapFirst: null, notice: null });
  }

  private setTargets(id: BoosterId, swapFirst: Pos | null) {
    this.set({ booster: id, swapFirst });
    this.scene?.showTargets([], swapFirst);
  }

  private async fire(id: BoosterId, targets: Pos[]) {
    const outcome = this.session.useBooster(id, targets);
    if (!outcome.ok) return this.notify(id === "swap" ? "swapHelp" : id === "hammer" ? "hammerHelp" : "bombHelp");
    this.hooks.onBoosterUsed(id);
    this.scene?.showTargets([], null);
    this.set({ state: "CLEARING", booster: null, swapFirst: null, notice: null, inventory: this.session.inventory });
    await this.play(outcome);
  }

  pause() {
    if (this.snap.state === "READY") {
      this.scene?.showGuide(null, this.session.current, -1);
      this.set({ state: "PAUSED" });
    } else if (!["LEVEL_COMPLETE", "LEVEL_FAILED", "PAUSED"].includes(this.snap.state)) this.pendingPause = true;
  }

  resume() {
    if (this.snap.state === "PAUSED") this.set({ state: "READY" });
  }

  private credit(score: number, progress: number[], cleared: ClearedItem[], hits: HitItem[], points: number) {
    const s = score + points;
    const p = trackProgress(this.session.level.objectives, progress, cleared, hits, s);
    for (const c of cleared) {
      if (c.kind === "pebble") this.stats.pebblesCleared++;
      if (c.kind === "flower") this.stats.flowersCleared++;
      if (c.kind === "stone") this.stats.stonesBroken++;
    }
    for (const h of hits) {
      if (h.result === "thawed") this.stats.frozenFreed++;
      if (h.result === "removed" && h.kind === "flower") this.stats.flowersCleared++;
      if (h.result === "removed" && h.kind === "stone") this.stats.stonesBroken++;
    }
    return { s, p };
  }

  private async play(outcome: MoveOutcome) {
    const scene = this.scene!;
    if (!outcome.ok) return;
    let score = this.snap.score;
    let progress = this.snap.progress;
    this.refresh({ movesLeft: this.session.movesLeft, current: this.session.current, next: this.session.next });
    if (outcome.placed) {
      audio.play("drop");
      await scene.drop(outcome.placed);
    }
    if (outcome.booster) {
      const b = outcome.booster;
      audio.play("booster");
      if (b.id === "hammer") await scene.hammer(b.targets[0], b.cleared);
      else if (b.id === "bomb") await scene.bomb(b.targets[0], b.cleared, b.hits);
      else await scene.swap(b.swapped![0], b.swapped![1]);
      ({ s: score, p: progress } = this.credit(score, progress, b.cleared, b.hits, b.cleared.length * 10 + hitPoints(b.hits)));
      this.set({ score, progress });
      this.set({ state: "CASCADING" });
      await scene.falls(b.falls);
    }
    for (const wave of outcome.waves) {
      this.set({ state: "MATCHING" });
      await scene.pulse(wave);
      this.set({ state: "CLEARING" });
      audio.play(wave.chain > 1 ? "combo" : "match");
      if (wave.hits.some((h) => h.result === "thawed")) audio.play("thaw", 0.6);
      audio.vibrate(wave.chain > 1 ? [20, 40, 20] : 15);
      ({ s: score, p: progress } = this.credit(score, progress, wave.cleared, wave.hits, wave.points));
      this.set({ score, progress });
      await scene.clear(wave, `+${wave.points}`, wave.chain > 1 ? this.hooks.cascadeLabel(wave.chain) : null);
      this.set({ state: "CASCADING" });
      await scene.falls(wave.falls);
    }
    this.stats.bestChain = Math.max(this.stats.bestChain, outcome.waves.length);
    if (outcome.recovery) {
      this.notify("jarShaken");
      await scene.clearItems(outcome.recovery.cleared);
      await scene.falls(outcome.recovery.falls);
    }
    scene.sync(this.session.board);
    const result = this.session.outcome;
    if (result === "playing") {
      const next: MachineState = this.pendingPause ? "PAUSED" : "READY";
      this.pendingPause = false;
      this.refresh({ state: next, score: this.session.score, progress: this.session.progress });
      if (next === "READY" && this.hovered !== null) this.hover(this.hovered);
      return;
    }
    this.refresh({ state: result === "complete" ? "LEVEL_COMPLETE" : "LEVEL_FAILED", score: this.session.score, progress: this.session.progress });
    if (result === "complete") {
      audio.play("complete");
      void scene.celebrate();
    } else audio.play("fail");
    this.hooks.onEnd(result, this.session, this.stats);
  }
}
