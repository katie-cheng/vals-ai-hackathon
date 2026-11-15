import { useState, type ReactNode } from "react";
import { Shell } from "../components/Shell.tsx";
import { Button, LinkButton } from "../components/ui.tsx";
import { BookIcon, GlobeIcon, InfoIcon, MusicIcon, SoundIcon, VibrateIcon } from "../components/icons.tsx";
import { DEFAULT_SAVE, setSetting, updateSave, useSave, type Settings as SettingsData } from "../state/store.ts";
import { LANGUAGES, useT } from "../state/i18n.ts";
import { audio } from "../audio/audio.ts";

type Toggle = "music" | "sound" | "vibration";

export function SettingsPanel() {
  const t = useT();
  const { settings } = useSave();
  const rows: { key: Toggle; icon: ReactNode; help: string }[] = [
    { key: "music", icon: <MusicIcon />, help: t("musicHelp") },
    { key: "sound", icon: <SoundIcon />, help: t("soundHelp") },
    { key: "vibration", icon: <VibrateIcon />, help: t("vibrationHelp") },
  ];
  const flip = (key: Toggle) => {
    audio.unlock();
    setSetting(key, !settings[key]);
    if (key === "music") audio.syncMusic();
    if (key === "sound" && !settings.sound) audio.play("button");
    if (key === "vibration" && !settings.vibration) navigator.vibrate?.(40);
  };
  return (
    <div className="settings-list">
      {rows.map((r) => (
        <div className="setting" key={r.key}>
          <span className="setting-icon">{r.icon}</span>
          <span className="setting-text">
            <span className="setting-name" id={`set-${r.key}`}>
              {t(r.key)}
            </span>
            <span className="setting-help">{r.help}</span>
          </span>
          <button type="button" role="switch" aria-checked={settings[r.key]} aria-labelledby={`set-${r.key}`} className="switch" onClick={() => flip(r.key)}>
            <span className="switch-knob" />
          </button>
          <span className="setting-state" aria-hidden="true">
            {settings[r.key] ? t("on") : t("off")}
          </span>
        </div>
      ))}
      <div className="setting setting-lang">
        <span className="setting-icon">
          <GlobeIcon />
        </span>
        <span className="setting-text">
          <span className="setting-name" id="set-lang">
            {t("language")}
          </span>
        </span>
        <div className="segmented" role="radiogroup" aria-labelledby="set-lang">
          {LANGUAGES.map((l) => (
            <button key={l.id} type="button" role="radio" aria-checked={settings.language === l.id} lang={l.id} onClick={() => setSetting("language", l.id as SettingsData["language"])}>
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsScreen() {
  const t = useT();
  const [confirm, setConfirm] = useState(false);
  return (
    <Shell bg="menu-forest" title={t("settings")} back="/">
      <section className="parchment page-card">
        <SettingsPanel />
      </section>
      <section className="parchment page-card settings-links">
        <LinkButton to="/how-to-play">
          <BookIcon /> {t("howToPlay")}
        </LinkButton>
        <LinkButton to="/about">
          <InfoIcon /> {t("about")}
        </LinkButton>
      </section>
      <section className="parchment page-card">
        {confirm ? (
          <div className="confirm-inline" role="alert">
            <p>{t("confirmReset")}</p>
            <div className="btn-row">
              <Button
                variant="danger"
                onClick={() => {
                  updateSave((s) => ({ ...DEFAULT_SAVE, settings: s.settings }));
                  setConfirm(false);
                }}
              >
                {t("yesReset")}
              </Button>
              <Button onClick={() => setConfirm(false)}>{t("cancel")}</Button>
            </div>
          </div>
        ) : (
          <Button variant="plain" onClick={() => setConfirm(true)}>
            {t("resetProgress")}
          </Button>
        )}
      </section>
    </Shell>
  );
}
