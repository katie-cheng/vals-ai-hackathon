import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { navigate } from "../router.tsx";
import { Scenery } from "../components/Shell.tsx";
import { Button, Counter, LinkButton, Modal, ProgressBar, Stars, objectiveIcon, objectiveText } from "../components/ui.tsx";
import { CloseIcon, GearIcon, HomeIcon, MapIcon, NextIcon, PauseIcon, PlayIcon, RestartIcon } from "../components/icons.tsx";
import { SettingsPanel } from "./Settings.tsx";
import { JarController, type RunStats } from "../game/controller.ts";
import { JarScene, createJarGame } from "../game/phaser/JarScene.ts";
import { GRID, WORLD, pct } from "../game/phaser/layout.ts";
import { CHAPTER_BG, boosterImg, pebbleImg, spriteImg } from "../game/assets.ts";
import { chapterOf, getLevel, LEVEL_COUNT } from "../game/levels/index.ts";
import { dailyLevel } from "../game/levels/daily.ts";
import { COLS, ROWS, type BoosterId, type LevelConfig } from "../game/logic/types.ts";
import type { GameSession } from "../game/logic/session.ts";
import { getSave, todayKey, updateSave } from "../state/store.ts";
import { useT, type StringKey, type T } from "../state/i18n.ts";

interface Result {
  kind: "complete" | "failed";
  score: number;
  stars: number;
  best: number;
  newBest: boolean;
  rewards: { acorns: number; crystals: number; booster?: BoosterId };
  remaining: { index: number; left: number }[];
}

const BOOSTERS: BoosterId[] = ["hammer", "swap", "bomb"];

function cellLabel(t: T, code: string): string {
  if (code === "empty") return "empty";
  if (code.startsWith("stone")) return `${t("stoneName")}${code.endsWith("1") ? ", cracked" : ""}`;
  if (code === "flower") return t("flowerName");
  if (code === "lock") return t("lockName");
  const [color, frozen] = code.split("-");
  return `${t(color as StringKey)}${frozen ? `, ${t("frozenName").toLowerCase()}` : ""}`;
}

function finish(level: LevelConfig, daily: boolean, result: "complete" | "failed", session: GameSession, stats: RunStats): Result {
  const before = getSave();
  const prevBest = daily ? 0 : (before.best[level.id] ?? 0);
  const remaining = level.objectives.map((o, index) => ({ index, left: Math.max(0, o.target - session.progress[index]) })).filter((r) => r.left > 0);
  const rewards = result === "complete" ? { acorns: level.rewards.acorns, crystals: level.rewards.crystals ?? 0, booster: level.rewards.booster } : { acorns: 0, crystals: 0 };
  const stars = result === "complete" ? session.stars : 0;
  updateSave((s) => {
    const st = s.stats;
    const firstClear = result === "complete" && !daily && !s.stars[level.id];
    const next = {
      ...s,
      acorns: s.acorns + rewards.acorns,
      crystals: s.crystals + rewards.crystals,
      boosters: rewards.booster ? { ...s.boosters, [rewards.booster]: s.boosters[rewards.booster] + 1 } : s.boosters,
      stats: {
        ...st,
        pebblesCleared: st.pebblesCleared + stats.pebblesCleared,
        frozenFreed: st.frozenFreed + stats.frozenFreed,
        flowersCleared: st.flowersCleared + stats.flowersCleared,
        stonesBroken: st.stonesBroken + stats.stonesBroken,
        bestChain: Math.max(st.bestChain, stats.bestChain),
        levelsCompleted: st.levelsCompleted + (firstClear ? 1 : 0),
        dailyWins: st.dailyWins + (daily && result === "complete" && s.dailyDone !== todayKey() ? 1 : 0),
      },
    };
    if (result !== "complete") return next;
    if (daily) return { ...next, dailyDone: todayKey() };
    return {
      ...next,
      stars: { ...s.stars, [level.id]: Math.max(s.stars[level.id] ?? 0, stars) },
      best: { ...s.best, [level.id]: Math.max(s.best[level.id] ?? 0, session.score) },
      unlocked: Math.min(LEVEL_COUNT, Math.max(s.unlocked, level.id + 1)),
    };
  });
  return { kind: result, score: session.score, stars, best: Math.max(prevBest, result === "complete" ? session.score : 0), newBest: result === "complete" && !daily && session.score > prevBest, rewards, remaining };
}

export function Gameplay({ param }: { param: string }) {
  const [attempt, setAttempt] = useState(0);
  const daily = param === "daily";
  const level = daily ? dailyLevel(todayKey()) : (getLevel(Number(param)) ?? getLevel(1)!);
  const unlocked = daily || level.id <= getSave().unlocked;
  useEffect(() => {
    if (!unlocked) navigate(`/level/${level.id}`, true);
  }, [unlocked, level.id]);
  if (!unlocked) return null;
  return <Round key={`${param}-${attempt}`} level={level} daily={daily} restart={() => setAttempt((a) => a + 1)} />;
}

function Round({ level, daily, restart }: { level: LevelConfig; daily: boolean; restart: () => void }) {
  const t = useT();
  const tRef = useRef(t);
  tRef.current = t;
  const [result, setResult] = useState<Result | null>(null);
  const [menu, setMenu] = useState<"pause" | "settings" | "confirm-restart" | "confirm-exit" | null>(null);
  const controller = useMemo(
    () =>
      new JarController(level, { ...getSave().boosters }, {
        onBoosterUsed: (id) => updateSave((s) => ({ ...s, boosters: { ...s.boosters, [id]: Math.max(0, s.boosters[id] - 1) }, stats: { ...s.stats, boostersUsed: s.stats.boostersUsed + 1 } })),
        onEnd: (kind, session, stats) => {
          const r = finish(level, daily, kind, session, stats);
          setTimeout(() => setResult(r), kind === "complete" ? 900 : 500);
        },
        cascadeLabel: (n) => tRef.current("cascade", { n }),
      }),
    [level, daily],
  );
  const snap = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new JarScene();
    const game = createJarGame(host.current!, scene);
    let live = true;
    void scene.ready.then(() => live && controller.attach(scene));
    return () => {
      live = false;
      game.destroy(true);
    };
  }, [controller]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (snap.booster) controller.cancelBooster();
      else if (!menu && !result) openPause();
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  });

  const openPause = () => {
    controller.pause();
    setMenu("pause");
  };
  const closeMenu = () => {
    setMenu(null);
    controller.resume();
  };
  const exitTo = daily ? "/daily" : `/chapter/${chapterOf(level.id).id}`;
  const busy = snap.state !== "READY";
  const title = daily ? t("daily") : t("levelN", { n: level.id });
  const helpText = snap.notice ? t(snap.notice.key, snap.notice.vars) : snap.state === "READY" ? t("dropHelp") : "\u00a0";

  return (
    <div className={`screen game-screen chapter-${chapterOf(level.id).id}`}>
      <Scenery bg={CHAPTER_BG[chapterOf(level.id).id - 1]} />
      <header className="hud">
        <div className="hud-top">
          <button type="button" className="icon-btn" aria-label={t("pause")} onClick={openPause} disabled={!!result}>
            <PauseIcon />
          </button>
          <h1 className="hud-level">{title}</h1>
          <div className="hud-stats">
            <span className="hud-stat">
              <span className="hud-stat-label">{t("moves")}</span>
              <Counter value={snap.movesLeft} className={`hud-moves ${snap.movesLeft <= 3 ? "hud-low" : ""}`} />
            </span>
            <span className="hud-stat">
              <span className="hud-stat-label">{t("score")}</span>
              <Counter value={snap.score} className="hud-score" />
            </span>
          </div>
        </div>
        <ul className="objectives" aria-label={t("objectives")}>
          {level.objectives.map((o, i) => {
            const have = Math.min(snap.progress[i], o.target);
            const done = have >= o.target;
            return (
              <li key={i} className={`objective ${done ? "objective-done" : ""}`}>
                <img src={objectiveIcon(o)} alt="" width={34} height={34} />
                <span className="objective-body">
                  <span className="objective-text">{objectiveText(t, o)}</span>
                  <ProgressBar value={have} max={o.target} label={objectiveText(t, o)} />
                </span>
                <span className="objective-count">
                  <Counter value={have} />/{o.type === "score" ? o.target.toLocaleString("en-US") : o.target}
                </span>
              </li>
            );
          })}
        </ul>
      </header>

      <main className="play-area">
        <div className="stage" data-state={snap.state} style={{ aspectRatio: `${WORLD.width} / ${WORLD.height}` }}>
          <div className="stage-canvas" ref={host} />
          <div
            className={`board ${snap.booster ? `board-target board-${snap.booster}` : ""}`}
            role="grid"
            aria-label={`${title}, ${COLS} x ${ROWS}`}
            aria-busy={busy}
            style={{ left: pct(GRID.x, WORLD.width), top: pct(GRID.y, WORLD.height), width: pct(GRID.cell * COLS, WORLD.width), height: pct(GRID.cell * ROWS, WORLD.height) }}
            onPointerLeave={() => {
              controller.hover(null);
              controller.hoverCell(null);
            }}
          >
            {Array.from({ length: ROWS }, (_, r) => {
              const row = ROWS - 1 - r;
              return (
                <div role="row" key={row} className="board-row">
                  {Array.from({ length: COLS }, (_, col) => {
                    const code = snap.cells[col][row];
                    const selected = snap.swapFirst?.col === col && snap.swapFirst?.row === row;
                    return (
                      <button
                        key={col}
                        type="button"
                        role="gridcell"
                        className={`cell ${selected ? "cell-selected" : ""}`}
                        data-col={col}
                        data-row={row}
                        data-cell={code}
                        aria-label={`${t("dropColumn", { n: col + 1 })}, ${t("rowN", { n: row + 1 })}: ${cellLabel(t, code)}`}
                        aria-disabled={busy}
                        onPointerEnter={() => {
                          controller.hover(col);
                          controller.hoverCell({ col, row });
                        }}
                        onFocus={() => {
                          controller.hover(col);
                          controller.hoverCell({ col, row });
                        }}
                        onClick={() => controller.tapCell({ col, row })}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <p className="play-help" role="status" aria-live="polite">
          {helpText}
        </p>
      </main>

      <footer className="tray">
        <div className="preview">
          <figure className="preview-slot preview-current">
            <img key={`c-${snap.current}-${snap.movesLeft}`} src={pebbleImg(snap.current)} alt={t(snap.current)} width={64} height={64} />
            <figcaption>{t("nowDropping")}</figcaption>
          </figure>
          <figure className="preview-slot preview-next">
            <img src={pebbleImg(snap.next)} alt={t(snap.next)} width={44} height={44} />
            <figcaption>{t("next")}</figcaption>
          </figure>
        </div>
        <div className="boosters" role="group" aria-label={t("boosters")}>
          {BOOSTERS.map((b) => (
            <button
              key={b}
              type="button"
              className={`booster ${snap.booster === b ? "booster-on" : ""}`}
              aria-pressed={snap.booster === b}
              aria-label={`${t(b)}, ${t("owned", { n: snap.inventory[b] })}`}
              disabled={snap.inventory[b] <= 0 && snap.booster !== b}
              onClick={() => controller.selectBooster(b)}
            >
              <img src={boosterImg(b)} alt="" width={50} height={50} />
              <span className="booster-name">{t(b)}</span>
              <span className="booster-count">{snap.inventory[b]}</span>
            </button>
          ))}
          {snap.booster && (
            <Button className="booster-cancel" onClick={() => controller.cancelBooster()}>
              <CloseIcon /> {t("cancel")}
            </Button>
          )}
        </div>
      </footer>

      {menu === "pause" && (
        <Modal title={t("paused")} labelId="pause-title" onClose={closeMenu}>
          <div className="modal-actions">
            <Button variant="primary" onClick={closeMenu}>
              <PlayIcon /> {t("resume")}
            </Button>
            <Button onClick={() => setMenu("confirm-restart")}>
              <RestartIcon /> {t("restart")}
            </Button>
            <Button onClick={() => setMenu("settings")}>
              <GearIcon /> {t("settings")}
            </Button>
            <Button variant="plain" onClick={() => setMenu("confirm-exit")}>
              <HomeIcon /> {t("exit")}
            </Button>
          </div>
        </Modal>
      )}
      {menu === "settings" && (
        <Modal title={t("settings")} labelId="pause-settings-title" onClose={() => setMenu("pause")} wide>
          <SettingsPanel />
          <div className="modal-actions">
            <Button variant="primary" onClick={() => setMenu("pause")}>
              {t("back")}
            </Button>
          </div>
        </Modal>
      )}
      {menu === "confirm-restart" && (
        <Modal title={t("restart")} labelId="confirm-restart-title" onClose={() => setMenu("pause")}>
          <p className="modal-text">{t("confirmRestart")}</p>
          <div className="modal-actions">
            <Button variant="danger" onClick={restart}>
              {t("yesRestart")}
            </Button>
            <Button onClick={() => setMenu("pause")}>{t("keepPlaying")}</Button>
          </div>
        </Modal>
      )}
      {menu === "confirm-exit" && (
        <Modal title={t("exit")} labelId="confirm-exit-title" onClose={() => setMenu("pause")}>
          <p className="modal-text">{t("confirmExit")}</p>
          <div className="modal-actions">
            <Button variant="danger" onClick={() => navigate(exitTo)}>
              {t("yesExit")}
            </Button>
            <Button onClick={() => setMenu("pause")}>{t("keepPlaying")}</Button>
          </div>
        </Modal>
      )}
      {result?.kind === "complete" && (
        <Modal title={t("levelComplete")} labelId="complete-title" wide>
          <div className="result">
            <Stars count={result.stars} size={72} animate label={`${result.stars} / 3`} />
            <dl className="result-facts">
              <div>
                <dt>{t("finalScore")}</dt>
                <dd>
                  <Counter value={result.score} className="result-score" />
                </dd>
              </div>
              {!daily && (
                <div>
                  <dt>{t("best")}</dt>
                  <dd>
                    {result.best.toLocaleString("en-US")}
                    {result.newBest && <span className="result-best">{t("newBest")}</span>}
                  </dd>
                </div>
              )}
              <div>
                <dt>{t("earned")}</dt>
                <dd className="result-rewards">
                  <span>
                    <img src={spriteImg("acorn")} alt={t("acorns")} width={28} height={28} /> +{result.rewards.acorns}
                  </span>
                  {result.rewards.crystals > 0 && (
                    <span>
                      <img src={spriteImg("crystal")} alt={t("crystals")} width={28} height={28} /> +{result.rewards.crystals}
                    </span>
                  )}
                  {result.rewards.booster && (
                    <span>
                      <img src={boosterImg(result.rewards.booster)} alt={t(result.rewards.booster)} width={30} height={30} /> +1
                    </span>
                  )}
                </dd>
              </div>
            </dl>
            <div className="modal-actions">
              {daily ? (
                <LinkButton to="/" variant="primary">
                  <HomeIcon /> {t("home")}
                </LinkButton>
              ) : level.id < LEVEL_COUNT ? (
                <LinkButton to={`/level/${level.id + 1}`} variant="primary">
                  {t("nextLevel")} <NextIcon />
                </LinkButton>
              ) : (
                <LinkButton to="/map" variant="primary">
                  <MapIcon /> {t("map")}
                </LinkButton>
              )}
              <Button onClick={restart}>
                <RestartIcon /> {t("replay")}
              </Button>
              {!daily && (
                <LinkButton to="/" variant="plain">
                  <HomeIcon /> {t("home")}
                </LinkButton>
              )}
            </div>
          </div>
        </Modal>
      )}
      {result?.kind === "failed" && (
        <Modal title={t("levelFailed")} labelId="failed-title" wide>
          <div className="result">
            <p className="modal-text">{t("failExplain")}</p>
            <h3 className="section-title">{t("stillNeeded")}</h3>
            <ul className="obj-list">
              {result.remaining.map((r) => (
                <li key={r.index}>
                  <img src={objectiveIcon(level.objectives[r.index])} alt="" width={36} height={36} />
                  {objectiveText(t, level.objectives[r.index], r.left)}
                </li>
              ))}
            </ul>
            <div className="modal-actions">
              <Button variant="primary" onClick={restart}>
                <RestartIcon /> {t("retry")}
              </Button>
              <LinkButton to={exitTo}>
                <MapIcon /> {t("levelSelect")}
              </LinkButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
