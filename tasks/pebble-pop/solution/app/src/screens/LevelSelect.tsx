import { Link } from "../router.tsx";
import { Shell } from "../components/Shell.tsx";
import { LinkButton, Stars } from "../components/ui.tsx";
import { BackIcon, LockIcon, MapIcon, NextIcon } from "../components/icons.tsx";
import { CHAPTERS, LEVEL_COUNT } from "../game/levels/index.ts";
import { CHAPTER_BG } from "../game/assets.ts";
import { useSave } from "../state/store.ts";
import { useT } from "../state/i18n.ts";

export function LevelSelect({ chapter }: { chapter: number }) {
  const t = useT();
  const save = useSave();
  const c = CHAPTERS[Math.min(Math.max(chapter, 1), 4) - 1];
  const open = c.first <= save.unlocked;
  const current = Math.min(save.unlocked, LEVEL_COUNT);
  const stars = c.levels.reduce((n, l) => n + (save.stars[l.id] ?? 0), 0);
  const prev = CHAPTERS[c.id - 2];
  const next = CHAPTERS[c.id];
  return (
    <Shell bg={CHAPTER_BG[c.id - 1]} title={t("chapterN", { n: c.id })} back="/map" className={`chapter chapter-${c.id}`}>
      <section className="parchment page-card chapter-head">
        <h2 className="chapter-name">{t(c.key)}</h2>
        <p>{open ? t(`${c.key}Blurb`) : t("chapterLocked", { n: c.first - 1 })}</p>
        <p className="chapter-meta">
          {t("levelsRange", { a: c.first, b: c.last })}
          <span>
            <Stars count={stars >= 30 ? 3 : stars >= 15 ? 2 : stars > 0 ? 1 : 0} size={18} label={`${stars} / 30`} /> {stars} / 30
          </span>
        </p>
      </section>
      <ol className="node-path" aria-label={t("levels")}>
        {c.levels.map((l, i) => {
          const unlocked = l.id <= save.unlocked;
          const earned = save.stars[l.id] ?? 0;
          const isCurrent = l.id === current && !save.stars[l.id];
          return (
            <li key={l.id} className={`node-slot node-slot-${i % 4}`}>
              {unlocked ? (
                <Link to={`/level/${l.id}`} className={`level-node ${isCurrent ? "level-node-current" : ""} ${earned ? "level-node-done" : ""}`} aria-label={`${t("levelN", { n: l.id })}${isCurrent ? `, ${t("current")}` : ""}${earned ? `, ${earned} / 3` : ""}`}>
                  <span className="level-node-num">{l.id}</span>
                </Link>
              ) : (
                <span className="level-node level-node-locked" role="img" aria-label={`${t("levelN", { n: l.id })}, ${t("locked")}`}>
                  <LockIcon />
                </span>
              )}
              <Stars count={earned} size={20} label={`${earned} / 3`} />
              {isCurrent && <span className="node-tag">{t("current")}</span>}
            </li>
          );
        })}
      </ol>
      <nav className="chapter-nav" aria-label={t("chapterN", { n: "" }).trim()}>
        {prev ? (
          <LinkButton to={`/chapter/${prev.id}`} aria-label={t("prevChapter")}>
            <BackIcon /> {t(prev.key)}
          </LinkButton>
        ) : (
          <span />
        )}
        <LinkButton to="/map" aria-label={t("map")}>
          <MapIcon />
        </LinkButton>
        {next ? (
          <LinkButton to={`/chapter/${next.id}`} aria-label={t("nextChapter")}>
            {t(next.key)} <NextIcon />
          </LinkButton>
        ) : (
          <span />
        )}
      </nav>
    </Shell>
  );
}
