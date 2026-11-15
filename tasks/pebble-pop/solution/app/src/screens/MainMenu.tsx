import { Link } from "../router.tsx";
import { Shell } from "../components/Shell.tsx";
import { LinkButton } from "../components/ui.tsx";
import { BagIcon, BookIcon, CalendarIcon, GearIcon, InfoIcon, LockIcon, MapIcon, PlayIcon, TrophyIcon } from "../components/icons.tsx";
import { CHAPTERS, LEVEL_COUNT, chapterOf } from "../game/levels/index.ts";
import { CHAPTER_BG, LOGO, bgImg, spriteImg } from "../game/assets.ts";
import { nextLevelFor, todayKey, useSave } from "../state/store.ts";
import { useT } from "../state/i18n.ts";

export function MainMenu() {
  const t = useT();
  const save = useSave();
  const next = nextLevelFor(save);
  const totalStars = Object.values(save.stars).reduce((a, b) => a + b, 0);
  const finished = !!save.stars[LEVEL_COUNT];
  const dailyOpen = save.dailyDone !== todayKey();
  return (
    <Shell bg="menu-forest" className="menu">
      <h1 className="menu-logo">
        <img src={LOGO} alt="" width={500} height={280} />
        <span className="sr-only">Pebble Pop</span>
      </h1>
      <section className="parchment menu-card">
        <p className="menu-intro">{t("menuIntro")}</p>
        <LinkButton to={`/level/${next}`} variant="primary" className="btn-play">
          <PlayIcon /> {t("play")}
        </LinkButton>
        <p className="menu-next">{finished ? t("allDone") : t("continueAt", { n: next, chapter: t(chapterOf(next).key) })}</p>
        <p className="menu-stars">
          <img src={spriteImg("star")} alt="" width={24} height={24} />
          {t("starsTotal", { n: totalStars, max: LEVEL_COUNT * 3 })}
        </p>
      </section>
      <nav className="menu-grid" aria-label="Main menu">
        <Link to="/map" className="sign">
          <MapIcon /> {t("levels")}
        </Link>
        <Link to="/daily" className="sign">
          <CalendarIcon /> {t("daily")}
          {dailyOpen && <span className="sign-flag" aria-label={t("dailyReady")} />}
        </Link>
        <Link to="/shop" className="sign">
          <BagIcon /> {t("shop")}
        </Link>
        <Link to="/achievements" className="sign">
          <TrophyIcon /> {t("achievements")}
        </Link>
        <Link to="/settings" className="sign">
          <GearIcon /> {t("settings")}
        </Link>
        <Link to="/how-to-play" className="sign">
          <BookIcon /> {t("howToPlay")}
        </Link>
      </nav>
      <section className="trail" aria-labelledby="trail-title">
        <h2 id="trail-title" className="section-title">
          {t("map")}
        </h2>
        <ol className="trail-list">
          {CHAPTERS.map((c) => {
            const open = c.first <= save.unlocked;
            const stars = c.levels.reduce((n, l) => n + (save.stars[l.id] ?? 0), 0);
            return (
              <li key={c.id} className={`trail-stop ${open ? "" : "trail-locked"}`}>
                <img className="trail-thumb" src={bgImg(CHAPTER_BG[c.id - 1])} alt="" width={96} height={96} loading="lazy" />
                <div className="trail-text">
                  <h3>
                    {open ? (
                      <Link to={`/chapter/${c.id}`}>{t(c.key)}</Link>
                    ) : (
                      <>
                        <LockIcon className="inline-icon" /> {t(c.key)}
                      </>
                    )}
                  </h3>
                  <p className="trail-meta">
                    {t("levelsRange", { a: c.first, b: c.last })}
                    {open && (
                      <span className="trail-stars">
                        <img src={spriteImg("star")} alt="" width={18} height={18} /> {stars} / 30
                      </span>
                    )}
                  </p>
                  <p>{open ? t(`${c.key}Blurb`) : t("chapterLocked", { n: c.first - 1 })}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
      <footer className="menu-foot">
        <Link to="/about">
          <InfoIcon className="inline-icon" /> {t("about")}
        </Link>
        <span>{t("version")}</span>
      </footer>
    </Shell>
  );
}
