import { useState, type FormEvent } from "react";
import { Moon, Sun, Trash2 } from "lucide-react";
import { useStore } from "../lib/store";
import { DurationFields } from "./Focus";
import { PRIORITIES, PRIORITY_LABEL, type Priority } from "../lib/types";

export function Settings() {
  const { data, updateSettings, clearAll, askConfirm, toast } = useStore();
  const s = data.settings;
  const [name, setName] = useState(s.name);
  const [error, setError] = useState("");
  const saveName = (e: FormEvent) => {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) return setError("Enter a display name.");
    if (clean.length > 40) return setError("Keep it under 40 characters.");
    updateSettings({ name: clean });
    toast("Display name saved");
  };
  const num = (key: "dailyTaskGoal" | "dailyFocusGoal" | "longEvery", min: number, max: number) => (v: string) => {
    const n = Math.round(Number(v));
    if (Number.isFinite(n) && n >= min && n <= max) updateSettings({ [key]: n });
  };

  return (
    <div className="settings">
      <section className="card" aria-labelledby="s-profile">
        <header className="card-head"><h3 id="s-profile">Profile</h3></header>
        <form className="form inline-form" onSubmit={saveName} noValidate>
          <div className="field grow">
            <label htmlFor="display-name">Display name</label>
            <input id="display-name" value={name} aria-invalid={!!error} onChange={(e) => { setName(e.target.value); setError(""); }} />
            {error && <p className="field-error" role="alert">{error}</p>}
          </div>
          <button type="submit" className="btn btn-primary">Save name</button>
        </form>
      </section>

      <section className="card" aria-labelledby="s-theme">
        <header className="card-head"><h3 id="s-theme">Appearance</h3></header>
        <div className="seg seg-wide" role="radiogroup" aria-label="Theme">
          {(["light", "dark"] as const).map((t) => (
            <button type="button" role="radio" key={t} aria-checked={s.theme === t} className={s.theme === t ? "is-on" : ""}
              onClick={() => { updateSettings({ theme: t }); toast(`${t === "light" ? "Light" : "Dark"} theme on`, "info"); }}>
              {t === "light" ? <Sun size={16} /> : <Moon size={16} />}{t === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </section>

      <section className="card" aria-labelledby="s-pomo">
        <header className="card-head"><h3 id="s-pomo">Pomodoro durations</h3></header>
        <DurationFields />
        <div className="field-row">
          <div className="field">
            <label htmlFor="long-every">Long break after</label>
            <div className="input-suffix">
              <input id="long-every" type="number" min={2} max={8} value={s.longEvery} onChange={(e) => num("longEvery", 2, 8)(e.target.value)} />
              <span>sessions</span>
            </div>
          </div>
        </div>
        <label className="switch">
          <input type="checkbox" checked={s.autoStartBreaks} onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })} />
          <span className="switch-track" aria-hidden="true" />
          Start breaks automatically
        </label>
      </section>

      <section className="card" aria-labelledby="s-prefs">
        <header className="card-head"><h3 id="s-prefs">Productivity preferences</h3></header>
        <div className="field-row">
          <div className="field">
            <label htmlFor="task-goal">Daily task goal</label>
            <div className="input-suffix">
              <input id="task-goal" type="number" min={1} max={20} value={s.dailyTaskGoal} onChange={(e) => num("dailyTaskGoal", 1, 20)(e.target.value)} />
              <span>tasks</span>
            </div>
          </div>
          <div className="field">
            <label htmlFor="focus-goal">Daily focus goal</label>
            <div className="input-suffix">
              <input id="focus-goal" type="number" min={15} max={600} step={5} value={s.dailyFocusGoal} onChange={(e) => num("dailyFocusGoal", 15, 600)(e.target.value)} />
              <span>min</span>
            </div>
          </div>
          <div className="field">
            <label htmlFor="default-priority">Default task priority</label>
            <select id="default-priority" value={s.defaultPriority} onChange={(e) => updateSettings({ defaultPriority: e.target.value as Priority })}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
            </select>
          </div>
        </div>
        <p className="muted">The goals set the weekly productivity score on the Overview page.</p>
      </section>

      <section className="card danger-zone" aria-labelledby="s-data">
        <header className="card-head"><h3 id="s-data">Data</h3></header>
        <p className="muted">LifeOS keeps everything in this browser's local storage. Clearing it removes all tasks, habits, notes and focus history and resets your preferences.</p>
        <button type="button" className="btn btn-danger" onClick={() => askConfirm({
          title: "Clear all data?", message: "This permanently deletes every task, habit, note and focus session stored on this device. It cannot be undone.",
          confirmLabel: "Clear everything",
          onConfirm: () => { clearAll(); setName("Maya"); toast("All local data cleared", "danger"); },
        })}><Trash2 size={16} />Clear all data</button>
      </section>
    </div>
  );
}
