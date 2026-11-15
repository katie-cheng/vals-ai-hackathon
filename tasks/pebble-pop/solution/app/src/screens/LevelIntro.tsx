import { Shell } from "../components/Shell.tsx";
import { LinkButton, objectiveIcon, objectiveText } from "../components/ui.tsx";
import { LockIcon, PlayIcon } from "../components/icons.tsx";
import { CHAPTER_BG, boosterImg, pebbleImg, spriteImg } from "../game/assets.ts";
import { chapterOf, getLevel } from "../game/levels/index.ts";
import { countWhere, parseBoard } from "../game/logic/board.ts";
import { useSave } from "../state/store.ts";
import { useT, type StringKey } from "../state/i18n.ts";

export function LevelIntro({ id }: { id: number }) {
  const t = useT();
  const save = useSave();
  const level = getLevel(id) ?? getLevel(1)!;
  const chapter = chapterOf(level.id);
  const open = level.id <= save.unlocked;
  const board = parseBoard(level.board);
  const obstacles = (
    [
      ["frozen", "frozenName", countWhere(board, (c) => c.kind === "pebble" && c.frozen)],
      ["lock", "lockName", countWhere(board, (c) => c.kind === "lock")],
      ["flower", "flowerName", countWhere(board, (c) => c.kind === "flower")],
      ["stone", "stoneName", countWhere(board, (c) => c.kind === "stone")],
    ] as const
  ).filter(([, , n]) => n > 0);
  const best = save.best[level.id];
  return (
    <Shell bg={CHAPTER_BG[chapter.id - 1]} title={t(chapter.key)} back={`/chapter/${chapter.id}`}>
      <section className="parchment page-card intro">
        <h2 className="intro-level">{t("levelN", { n: level.id })}</h2>
        <p className="intro-difficulty">
          {t("difficulty")}: <strong>{t(level.difficulty)}</strong>
        </p>
        <h3 className="section-title">{t("objectives")}</h3>
        <ul className="obj-list">
          {level.objectives.map((o, i) => (
            <li key={i}>
              <img src={objectiveIcon(o)} alt="" width={40} height={40} />
              {objectiveText(t, o)}
            </li>
          ))}
        </ul>
        <dl className="intro-facts-grid">
          <div>
            <dt>{t("moveLimit")}</dt>
            <dd>{t("movesN", { n: level.moves })}</dd>
          </div>
          <div>
            <dt>{t("best")}</dt>
            <dd>{best ? best.toLocaleString("en-US") : t("noBest")}</dd>
          </div>
          <div>
            <dt>{t("starTargets")}</dt>
            <dd>{level.stars.map((s) => s.toLocaleString("en-US")).join(" / ")}</dd>
          </div>
          <div>
            <dt>{t("reward")}</dt>
            <dd className="intro-reward">
              <img src={spriteImg("acorn")} alt={t("acorns")} width={22} height={22} /> {level.rewards.acorns}
              {level.rewards.crystals ? (
                <>
                  <img src={spriteImg("crystal")} alt={t("crystals")} width={22} height={22} /> {level.rewards.crystals}
                </>
              ) : null}
              {level.rewards.booster ? <img src={boosterImg(level.rewards.booster)} alt={t(level.rewards.booster)} width={26} height={26} /> : null}
            </dd>
          </div>
        </dl>
        <h3 className="section-title">{t("pebblesInLevel")}</h3>
        <ul className="pebble-row">
          {level.colors.map((c) => (
            <li key={c}>
              <img src={pebbleImg(c)} alt="" width={48} height={48} />
              <span>{t(c)}</span>
            </li>
          ))}
        </ul>
        {obstacles.length > 0 && (
          <>
            <h3 className="section-title">{t("obstaclesInLevel")}</h3>
            <ul className="pebble-row">
              {obstacles.map(([img, name, n]) => (
                <li key={img}>
                  <img src={spriteImg(img)} alt="" width={48} height={48} />
                  <span>
                    {t(name as StringKey)} x{n}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
        {level.tip && <p className="intro-tip">{t(level.tip as StringKey)}</p>}
        {open ? (
          <LinkButton to={`/play/${level.id}`} variant="primary" className="btn-play">
            <PlayIcon /> {t("start")}
          </LinkButton>
        ) : (
          <p className="intro-locked">
            <LockIcon className="inline-icon" /> {t("levelLocked", { n: level.id - 1 })}
          </p>
        )}
      </section>
    </Shell>
  );
}
