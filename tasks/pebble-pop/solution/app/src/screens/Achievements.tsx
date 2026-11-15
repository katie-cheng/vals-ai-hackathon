import { Shell } from "../components/Shell.tsx";
import { Button, ProgressBar } from "../components/ui.tsx";
import { CheckIcon } from "../components/icons.tsx";
import { spriteImg } from "../game/assets.ts";
import { ACHIEVEMENTS } from "../state/achievements.ts";
import { updateSave, useSave } from "../state/store.ts";
import { useT } from "../state/i18n.ts";
import { audio } from "../audio/audio.ts";

export function Achievements() {
  const t = useT();
  const save = useSave();
  return (
    <Shell bg="chapter-frost" title={t("achievements")} back="/">
      <section className="parchment page-card">
        <p className="lead">{t("achievementsIntro")}</p>
        <ul className="ach-list">
          {ACHIEVEMENTS.map((a) => {
            const [have, need] = a.progress(save);
            const done = have >= need;
            const claimed = save.claimed.includes(a.id);
            return (
              <li key={a.id} className={`ach ${done ? "ach-done" : ""}`}>
                <img src={spriteImg("medal")} alt="" width={52} height={52} className={done ? "" : "ach-dim"} />
                <div className="ach-text">
                  <h2>{t(a.title)}</h2>
                  <p>{t(a.text)}</p>
                  <ProgressBar value={have} max={need} label={t(a.title)} />
                  <span className="ach-count">{t("progressOf", { a: have, b: need })}</span>
                </div>
                {claimed ? (
                  <span className="ach-claimed">
                    <CheckIcon /> {t("claimed")}
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    className="price-btn"
                    disabled={!done}
                    aria-label={`${t("claim")} ${t(a.title)}, ${a.reward} ${t("acorns")}`}
                    onClick={() => {
                      audio.play("combo", 0.5);
                      updateSave((s) => ({ ...s, acorns: s.acorns + a.reward, claimed: [...s.claimed, a.id] }));
                    }}
                  >
                    <img src={spriteImg("acorn")} alt="" width={22} height={22} />+{a.reward}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </Shell>
  );
}
