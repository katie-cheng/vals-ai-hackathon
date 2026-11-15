import { Pause, Play, RotateCcw, SkipForward, Timer } from "lucide-react";
import { useStore } from "../lib/store";
import { MODE_LABEL, clock, useTimer } from "../lib/timer";
import { timeOfDay, todayIso, shortDate } from "../lib/dates";
import { dayOf, focusMinutesOn } from "../lib/stats";
import type { TimerMode } from "../lib/types";
import { EmptyState } from "../components/Feedback";

const MODES: TimerMode[] = ["focus", "short", "long"];

export function DurationFields() {
  const { data, updateSettings } = useStore();
  const s = data.settings;
  const field = (key: "focusMinutes" | "shortMinutes" | "longMinutes", label: string, max: number) => (
    <div className="field">
      <label htmlFor={`dur-${key}`}>{label}</label>
      <div className="input-suffix">
        <input id={`dur-${key}`} type="number" min={1} max={max} inputMode="numeric" value={s[key]}
          onChange={(e) => {
            const n = Math.round(Number(e.target.value));
            if (Number.isFinite(n) && n >= 1 && n <= max) updateSettings({ [key]: n });
          }} />
        <span>min</span>
      </div>
    </div>
  );
  return (
    <div className="field-row">
      {field("focusMinutes", "Focus", 120)}
      {field("shortMinutes", "Short break", 30)}
      {field("longMinutes", "Long break", 60)}
    </div>
  );
}

export function Focus() {
  const { data, clearSessions, askConfirm, toast } = useStore();
  const t = useTimer();
  const today = todayIso();
  const pct = t.total ? 1 - t.remaining / t.total : 0;
  const sessions = data.sessions.filter((s) => s.mode === "focus").slice().sort((a, b) => b.completedAt - a.completedAt);
  const todayCount = sessions.filter((s) => dayOf(s.completedAt) === today).length;
  const R = 108;
  const C = 2 * Math.PI * R;

  return (
    <div className="focus-layout">
      <section className="card timer-card" aria-label="Pomodoro timer">
        <div className="seg seg-wide" role="tablist" aria-label="Timer mode">
          {MODES.map((m) => (
            <button type="button" role="tab" key={m} aria-selected={t.mode === m} className={t.mode === m ? "is-on" : ""} onClick={() => t.setMode(m)}>{MODE_LABEL[m]}</button>
          ))}
        </div>
        <div className="dial">
          <svg viewBox="0 0 240 240" aria-hidden="true">
            <circle cx="120" cy="120" r={R} className="dial-track" />
            <circle cx="120" cy="120" r={R} className="dial-fill" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} />
          </svg>
          <div className="dial-text">
            <p className="timer-display" role="timer" aria-live="off" data-testid="timer">{clock(t.remaining)}</p>
            <p className="timer-mode">{t.running ? MODE_LABEL[t.mode] + " in progress" : MODE_LABEL[t.mode]}</p>
          </div>
        </div>
        <div className="field timer-label">
          <label htmlFor="focus-label">Working on</label>
          <input id="focus-label" value={t.label} onChange={(e) => t.setLabel(e.target.value)} placeholder="What will you focus on?" />
        </div>
        <div className="timer-controls">
          {t.running
            ? <button type="button" className="btn btn-primary btn-lg" onClick={t.pause}><Pause size={18} />Pause</button>
            : <button type="button" className="btn btn-primary btn-lg" onClick={t.start}><Play size={18} />{t.remaining < t.total ? "Resume" : "Start"}</button>}
          <button type="button" className="btn btn-secondary btn-lg" onClick={t.reset}><RotateCcw size={18} />Reset</button>
          <button type="button" className="icon-btn icon-lg" aria-label="Skip to next session" onClick={t.skip}><SkipForward size={18} /></button>
        </div>
        <p className="timer-foot">{todayCount} focus sessions and {focusMinutesOn(data, today)} minutes today. Long break after every {data.settings.longEvery} sessions.</p>
      </section>

      <div className="stack">
        <section className="card" aria-labelledby="dur-h">
          <header className="card-head"><h3 id="dur-h">Durations</h3></header>
          <DurationFields />
        </section>
        <section className="card" aria-labelledby="hist-h">
          <header className="card-head">
            <h3 id="hist-h">Session history</h3>
            {sessions.length > 0 && <button type="button" className="text-link" onClick={() => askConfirm({
              title: "Clear focus history?", message: "All completed focus sessions will be removed from history and analytics.", confirmLabel: "Clear history",
              onConfirm: () => { clearSessions(); toast("Focus history cleared", "info"); },
            })}>Clear history</button>}
          </header>
          {sessions.length === 0 ? (
            <EmptyState icon={<Timer size={20} />} title="No sessions yet" text="Completed focus sessions are listed here." />
          ) : (
            <ul className="history">
              {sessions.slice(0, 8).map((s) => (
                <li key={s.id}>
                  <span className="history-label">{s.label}</span>
                  <span className="history-meta">{s.minutes} min</span>
                  <time className="history-meta" dateTime={new Date(s.completedAt).toISOString()}>
                    {dayOf(s.completedAt) === today ? `Today, ${timeOfDay(s.completedAt)}` : `${shortDate(dayOf(s.completedAt))}, ${timeOfDay(s.completedAt)}`}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
