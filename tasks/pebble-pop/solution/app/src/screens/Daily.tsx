import { Shell } from "../components/Shell.tsx";
import { LinkButton, objectiveIcon, objectiveText } from "../components/ui.tsx";
import { PlayIcon } from "../components/icons.tsx";
import { dailyLevel } from "../game/levels/daily.ts";
import { pebbleImg, spriteImg } from "../game/assets.ts";
import { todayKey, useSave } from "../state/store.ts";
import { useT } from "../state/i18n.ts";

export function Daily() {
  const t = useT();
  const save = useSave();
  const today = todayKey();
  const level = dailyLevel(today);
  const done = save.dailyDone === today;
  const date = new Date().toLocaleDateString(save.settings.language, { weekday: "long", month: "long", day: "numeric" });
  return (
    <Shell bg="chapter-blossom" title={t("daily")} back="/">
      <section className="parchment page-card daily">
        <h2 className="daily-date">{date}</h2>
        <p className="lead">{done ? t("dailyDone") : t("dailyIntro")}</p>
        <h3 className="section-title">{t("objectives")}</h3>
        <ul className="obj-list">
          {level.objectives.map((o, i) => (
            <li key={i}>
              <img src={objectiveIcon(o)} alt="" width={40} height={40} />
              {objectiveText(t, o)}
            </li>
          ))}
        </ul>
        <p className="intro-facts">
          <span>
            {t("moveLimit")}: <strong>{t("movesN", { n: level.moves })}</strong>
          </span>
          <span>
            {t("reward")}: <img src={spriteImg("crystal")} alt={t("crystals")} width={22} height={22} /> 1, <img src={spriteImg("acorn")} alt={t("acorns")} width={22} height={22} /> 60
          </span>
        </p>
        <div className="pebble-row" aria-label={t("pebblesInLevel")}>
          {level.colors.map((c) => (
            <img key={c} src={pebbleImg(c)} alt={t(c)} width={44} height={44} />
          ))}
        </div>
        <LinkButton to="/play/daily" variant="primary" className="btn-play">
          <PlayIcon /> {done ? t("replay") : t("start")}
        </LinkButton>
      </section>
    </Shell>
  );
}
