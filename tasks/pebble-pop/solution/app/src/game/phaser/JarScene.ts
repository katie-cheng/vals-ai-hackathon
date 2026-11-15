import Phaser from "phaser";
import { COLS, ROWS, PEBBLE_COLORS, type Board, type Cell, type ClearedItem, type Fall, type HitItem, type PebbleColor, type Placed, type Pos, type Wave } from "../logic/types.ts";
import { boosterImg, effectImg, jarImg, pebbleImg, spriteImg } from "../assets.ts";
import { BASE, GHOST_Y, GRID, JAR, WORLD, cellX, cellY } from "./layout.ts";

const PIECE = 94;
const TINT: Record<PebbleColor, number> = {
  orange: 0xe9822f, blue: 0x3f8fc4, purple: 0x8a5cc2, green: 0x5f9a3c, red: 0xd2453b, yellow: 0xf0c23a, pink: 0xe882b4,
};

type Piece = Phaser.GameObjects.Container;

/** Renders the jar and replays the outcomes of the pure GameSession as animations. It never decides game rules. */
export class JarScene extends Phaser.Scene {
  ready: Promise<void>;
  private resolveReady!: () => void;
  private pieces = new Map<number, Piece>();
  private posOf = new Map<number, Pos>();
  private ghost!: Phaser.GameObjects.Image;
  private guide!: Phaser.GameObjects.Graphics;
  private marks!: Phaser.GameObjects.Graphics;
  private emitters!: Record<"sparkle" | "leaf" | "petal" | "snow", Phaser.GameObjects.Particles.ParticleEmitter>;
  private speed = 1;

  constructor() {
    super("jar");
    this.ready = new Promise((r) => (this.resolveReady = r));
  }

  preload() {
    for (const c of PEBBLE_COLORS) this.load.image(`pebble-${c}`, pebbleImg(c));
    for (const s of ["frozen", "stone", "stone-cracked", "flower", "lock", "star"] as const) this.load.image(s, spriteImg(s));
    for (const e of ["sparkle", "leaf", "petal", "snow", "ring"] as const) this.load.image(e, effectImg(e));
    for (const j of ["jar-back", "jar-front", "jar-base"] as const) this.load.image(j, jarImg(j));
    for (const b of ["hammer", "bomb", "swap"] as const) this.load.image(b, boosterImg(b));
  }

  create() {
    this.speed = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.45 : 1;
    this.add.image(JAR.x, JAR.y, "jar-back").setOrigin(0).setDepth(0);
    this.guide = this.add.graphics().setDepth(1);
    this.ghost = this.add.image(cellX(3), GHOST_Y, "pebble-orange").setDisplaySize(PIECE, PIECE).setAlpha(0).setDepth(6);
    this.add.image(JAR.x, JAR.y, "jar-front").setOrigin(0).setDepth(4);
    this.add.image(WORLD.width / 2, BASE.y, "jar-base").setOrigin(0.5, 0).setDisplaySize(BASE.width, BASE.height).setDepth(5);
    this.marks = this.add.graphics().setDepth(4.5);
    const burst = (texture: string, extra: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig) =>
      this.add
        .particles(0, 0, texture, {
          lifespan: { min: 450, max: 850 },
          speed: { min: 90, max: 300 },
          angle: { min: 0, max: 360 },
          rotate: { min: 0, max: 360 },
          alpha: { start: 1, end: 0 },
          emitting: false,
          ...extra,
        })
        .setDepth(7);
    this.emitters = {
      sparkle: burst("sparkle", { scale: { start: 0.55, end: 0 }, gravityY: 120 }),
      leaf: burst("leaf", { scale: { start: 0.5, end: 0.2 }, gravityY: 380 }),
      petal: burst("petal", { scale: { start: 0.5, end: 0.2 }, gravityY: 300 }),
      snow: burst("snow", { scale: { start: 0.5, end: 0 }, gravityY: 60 }),
    };
    // Glass shimmer: a faint highlight drifting across the jar now and then.
    const shine = this.add.rectangle(JAR.x + 120, JAR.y + JAR.height / 2, 46, JAR.height - 120, 0xffffff, 0.07).setDepth(4.2).setAngle(8);
    this.tweens.add({ targets: shine, x: JAR.x + JAR.width - 120, duration: 5200, delay: 3000, repeatDelay: 7000, repeat: -1, ease: "Sine.easeInOut", alpha: { from: 0, to: 0.09 }, yoyo: false });
    this.resolveReady();
  }

  private ms(n: number) {
    return Math.max(16, n * this.speed);
  }

  private tween(config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
    return new Promise((resolve) => this.tweens.add({ ...config, onComplete: (tween, targets) => { config.onComplete?.(tween, targets); resolve(); } }));
  }

  private wait(ms: number) {
    return new Promise<void>((r) => this.time.delayedCall(this.ms(ms), r));
  }

  private makePiece(cell: NonNullable<Cell>, x: number, y: number): Piece {
    const c = this.add.container(x, y).setDepth(2);
    if (cell.kind === "pebble") {
      c.add(this.add.image(0, 0, `pebble-${cell.color}`).setDisplaySize(PIECE, PIECE));
      if (cell.frozen) c.add(this.add.image(0, 0, "frozen").setDisplaySize(PIECE + 4, PIECE + 4).setName("ice"));
    } else if (cell.kind === "stone") {
      c.add(this.add.image(0, 0, cell.hp === 2 ? "stone" : "stone-cracked").setDisplaySize(PIECE, PIECE).setName("stone"));
    } else {
      c.add(this.add.image(0, 0, cell.kind).setDisplaySize(PIECE, PIECE));
    }
    return c;
  }

  /** Puts every piece exactly where the model says, creating or removing sprites as needed. */
  sync(board: Board) {
    const seen = new Set<number>();
    for (let col = 0; col < COLS; col++)
      for (let row = 0; row < ROWS; row++) {
        const cell = board[col][row];
        if (!cell) continue;
        seen.add(cell.id);
        let piece = this.pieces.get(cell.id);
        if (!piece) {
          piece = this.makePiece(cell, cellX(col), cellY(row));
          this.pieces.set(cell.id, piece);
        }
        piece.setPosition(cellX(col), cellY(row)).setScale(1).setAlpha(1).setAngle(0);
        if (cell.kind === "pebble" && !cell.frozen) piece.getByName("ice")?.destroy();
        if (cell.kind === "stone") (piece.getByName("stone") as Phaser.GameObjects.Image | null)?.setTexture(cell.hp === 2 ? "stone" : "stone-cracked");
        this.posOf.set(cell.id, { col, row });
      }
    for (const [id, piece] of this.pieces)
      if (!seen.has(id)) {
        piece.destroy();
        this.pieces.delete(id);
        this.posOf.delete(id);
      }
  }

  showGuide(col: number | null, color: PebbleColor, landing: number) {
    this.guide.clear();
    if (col === null) {
      this.ghost.setAlpha(0);
      return;
    }
    this.ghost.setTexture(`pebble-${color}`).setDisplaySize(PIECE, PIECE).setPosition(cellX(col), GHOST_Y).setAlpha(landing >= 0 ? 0.95 : 0.35);
    if (landing < 0) {
      this.guide.fillStyle(0xb8432f, 0.16).fillRoundedRect(GRID.x + col * GRID.cell + 6, GRID.y + 6, GRID.cell - 12, GRID.rows * GRID.cell - 12, 14);
      return;
    }
    this.guide.fillStyle(0xfff4d6, 0.13).fillRoundedRect(GRID.x + col * GRID.cell + 6, GRID.y + 6, GRID.cell - 12, GRID.rows * GRID.cell - 12, 14);
    this.guide.lineStyle(4, 0xfff4d6, 0.7).strokeRoundedRect(cellX(col) - 44, cellY(landing) - 44, 88, 88, 18);
  }

  showTargets(cells: Pos[], selected: Pos | null) {
    this.marks.clear();
    for (const p of cells) this.marks.fillStyle(0xffe6a3, 0.28).fillRoundedRect(cellX(p.col) - 47, cellY(p.row) - 47, 94, 94, 16);
    if (selected) this.marks.lineStyle(6, 0xffd166, 1).strokeRoundedRect(cellX(selected.col) - 48, cellY(selected.row) - 48, 96, 96, 18);
  }

  async drop(placed: Placed) {
    this.guide.clear();
    this.ghost.setAlpha(0);
    const cell = { kind: "pebble" as const, id: placed.id, color: placed.color, frozen: false };
    const piece = this.makePiece(cell, cellX(placed.col), GHOST_Y);
    this.pieces.set(placed.id, piece);
    this.posOf.set(placed.id, { col: placed.col, row: placed.row });
    const rows = ROWS - placed.row;
    await this.tween({ targets: piece, y: cellY(placed.row), duration: this.ms(170 + rows * 45), ease: "Bounce.easeOut" });
    await this.tween({ targets: piece, scaleY: 0.9, scaleX: 1.08, duration: this.ms(60), yoyo: true });
  }

  async pulse(wave: Wave) {
    const strong = wave.chain > 1;
    const targets = wave.groups.flatMap((g) => g.cells.map((p) => this.pieceAt(p))).filter((p): p is Piece => !!p);
    await this.tween({ targets, scale: strong ? 1.2 : 1.13, duration: this.ms(strong ? 130 : 110), yoyo: true, repeat: 1, ease: "Sine.easeInOut" });
  }

  async clear(wave: Wave, popup: string, banner: string | null) {
    const strong = wave.chain > 1;
    for (const g of wave.groups) {
      const tint = TINT[g.color];
      for (const p of g.cells) {
        const x = cellX(p.col), y = cellY(p.row);
        this.emitters.sparkle.explode(strong ? 6 : 4, x, y);
        const leaf = g.color === "pink" || g.color === "red" || g.color === "purple" ? this.emitters.petal : this.emitters.leaf;
        leaf.setParticleTint(tint);
        leaf.explode(strong ? 4 : 2, x, y);
      }
    }
    if (strong) {
      this.cameras.main.shake(this.ms(200), 0.004 + 0.002 * Math.min(3, wave.chain));
      const c = this.centroid(wave.groups.flatMap((g) => g.cells));
      const ring = this.add.image(c.x, c.y, "ring").setDepth(7).setScale(0.3).setAlpha(0.9);
      this.tween({ targets: ring, scale: 2.4, alpha: 0, duration: this.ms(520), onComplete: () => ring.destroy() });
    }
    const clears = this.removeItems(wave.cleared);
    const hits = this.applyHits(wave.hits);
    this.scorePopup(wave.groups.flatMap((g) => g.cells), popup, strong);
    if (banner) this.banner(banner);
    await Promise.all([clears, hits]);
  }

  private async removeItems(items: ClearedItem[]) {
    await Promise.all(
      items.map(async (item) => {
        const piece = this.pieces.get(item.id);
        if (!piece) return;
        this.pieces.delete(item.id);
        this.posOf.delete(item.id);
        if (item.kind === "stone") this.emitters.sparkle.explode(6, piece.x, piece.y);
        if (item.kind === "flower") {
          this.emitters.petal.setParticleTint(0xf3a6c8);
          this.emitters.petal.explode(6, piece.x, piece.y);
        }
        await this.tween({ targets: piece, scale: 0, alpha: 0, angle: 25, duration: this.ms(200), ease: "Back.easeIn" });
        piece.destroy();
      }),
    );
  }

  private async applyHits(hits: HitItem[]) {
    await Promise.all(
      hits.map(async (hit) => {
        const piece = this.pieces.get(hit.id);
        if (!piece) return;
        if (hit.result === "thawed") {
          this.emitters.snow.explode(8, piece.x, piece.y);
          const ice = piece.getByName("ice") as Phaser.GameObjects.Image | null;
          if (ice) await this.tween({ targets: ice, alpha: 0, scale: ice.scale * 1.3, duration: this.ms(260), onComplete: () => ice.destroy() });
        } else if (hit.result === "cracked") {
          (piece.getByName("stone") as Phaser.GameObjects.Image | null)?.setTexture("stone-cracked");
          this.emitters.sparkle.explode(5, piece.x, piece.y);
          await this.tween({ targets: piece, angle: { from: -8, to: 8 }, duration: this.ms(60), yoyo: true, repeat: 2 });
          piece.setAngle(0);
        } else {
          await this.removeItems([{ ...hit, kind: hit.kind }]);
        }
      }),
    );
  }

  async falls(falls: Fall[]) {
    if (!falls.length) return;
    await Promise.all(
      falls.map((f) => {
        const piece = this.pieces.get(f.id);
        if (!piece) return Promise.resolve();
        this.posOf.set(f.id, { col: f.col, row: f.toRow });
        return this.tween({ targets: piece, y: cellY(f.toRow), duration: this.ms(150 + (f.fromRow - f.toRow) * 55), ease: "Bounce.easeOut" });
      }),
    );
  }

  async hammer(target: Pos, cleared: ClearedItem[]) {
    const x = cellX(target.col), y = cellY(target.row);
    const tool = this.add.image(x + 60, y - 90, "hammer").setDisplaySize(130, 130).setDepth(8).setAngle(-50);
    await this.tween({ targets: tool, angle: 15, x: x + 30, y: y - 50, duration: this.ms(220), ease: "Back.easeIn" });
    this.cameras.main.shake(this.ms(120), 0.004);
    this.emitters.sparkle.explode(10, x, y);
    await this.removeItems(cleared);
    await this.tween({ targets: tool, alpha: 0, duration: this.ms(160), onComplete: () => tool.destroy() });
  }

  async bomb(target: Pos, cleared: ClearedItem[], hits: HitItem[]) {
    const x = cellX(target.col), y = cellY(target.row);
    const b = this.add.image(x, y, "bomb").setDisplaySize(100, 100).setDepth(8);
    await this.tween({ targets: b, scale: b.scale * 1.25, duration: this.ms(120), yoyo: true, repeat: 1 });
    b.destroy();
    const ring = this.add.image(x, y, "ring").setDepth(7).setScale(0.4);
    this.tween({ targets: ring, scale: 3.2, alpha: 0, duration: this.ms(480), onComplete: () => ring.destroy() });
    this.cameras.main.shake(this.ms(220), 0.008);
    this.emitters.sparkle.explode(18, x, y);
    this.emitters.leaf.setParticleTint(0xc98a3a);
    this.emitters.leaf.explode(10, x, y);
    await Promise.all([this.removeItems(cleared), this.applyHits(hits)]);
  }

  async swap(a: Pos, b: Pos) {
    const pa = this.pieceAt(a), pb = this.pieceAt(b);
    const ida = this.idAt(a), idb = this.idAt(b);
    if (!pa || !pb || ida === null || idb === null) return;
    pa.setDepth(3);
    await Promise.all([
      this.tween({ targets: pa, x: cellX(b.col), y: cellY(b.row), duration: this.ms(240), ease: "Sine.easeInOut" }),
      this.tween({ targets: pb, x: cellX(a.col), y: cellY(a.row), duration: this.ms(240), ease: "Sine.easeInOut" }),
    ]);
    pa.setDepth(2);
    this.posOf.set(ida, b);
    this.posOf.set(idb, a);
  }

  async clearItems(items: ClearedItem[]) {
    await this.removeItems(items);
  }

  async celebrate() {
    for (let i = 0; i < 4; i++) {
      this.emitters.sparkle.explode(14, GRID.x + Math.random() * GRID.cols * GRID.cell, GRID.y + Math.random() * 400);
      await this.wait(140);
    }
  }

  private idAt(p: Pos): number | null {
    for (const [id, q] of this.posOf) if (q.col === p.col && q.row === p.row) return id;
    return null;
  }

  private pieceAt(p: Pos): Piece | undefined {
    const id = this.idAt(p);
    return id === null ? undefined : this.pieces.get(id);
  }

  private centroid(cells: Pos[]) {
    const x = cells.reduce((s, p) => s + cellX(p.col), 0) / Math.max(1, cells.length);
    const y = cells.reduce((s, p) => s + cellY(p.row), 0) / Math.max(1, cells.length);
    return { x, y };
  }

  private scorePopup(cells: Pos[], text: string, strong: boolean) {
    if (!cells.length) return;
    const c = this.centroid(cells);
    const label = this.add
      .text(c.x, c.y, text, { fontFamily: "Fraunces, Georgia, serif", fontSize: strong ? "58px" : "46px", fontStyle: "700", color: "#fff6dc", stroke: "#5b3a1c", strokeThickness: 10 })
      .setOrigin(0.5)
      .setDepth(9);
    this.tween({ targets: label, y: c.y - 90, alpha: { from: 1, to: 0 }, duration: this.ms(900), ease: "Cubic.easeOut", onComplete: () => label.destroy() });
  }

  private banner(text: string) {
    const label = this.add
      .text(WORLD.width / 2, GRID.y + 140, text, { fontFamily: "Fraunces, Georgia, serif", fontSize: "70px", fontStyle: "700", color: "#ffd77a", stroke: "#4a2c12", strokeThickness: 12 })
      .setOrigin(0.5)
      .setDepth(9)
      .setScale(0.4);
    this.tween({ targets: label, scale: 1, duration: this.ms(260), ease: "Back.easeOut" }).then(() =>
      this.tween({ targets: label, alpha: 0, y: label.y - 40, delay: this.ms(450), duration: this.ms(350), onComplete: () => label.destroy() }),
    );
  }
}

export function createJarGame(parent: HTMLElement, scene: JarScene): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.CANVAS,
    parent,
    width: WORLD.width,
    height: WORLD.height,
    transparent: true,
    banner: false,
    audio: { noAudio: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene,
  });
}
