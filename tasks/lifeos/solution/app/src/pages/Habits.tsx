import { useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, Flame, Check } from "lucide-react";
import { useStore } from "../lib/store";
import { lastDays, todayIso, weekday, shortDate } from "../lib/dates";
import { habitRate, habitStreak } from "../lib/stats";
import type { Habit } from "../lib/types";
import { Modal } from "../components/Modal";
import { EmptyState } from "../components/Feedback";
import { Checkbox } from "../components/TaskRow";

function HabitModal({ habit, onClose }: { habit?: Habit; onClose(): void }) {
  const { addHabit, updateHabit, toast, data } = useStore();
  const [name, setName] = useState(habit?.name ?? "");
  const [error, setError] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) return setError("Name the habit.");
    if (data.habits.some((h) => h.id !== habit?.id && h.name.toLowerCase() === clean.toLowerCase())) return setError("You already track a habit with this name.");
    if (habit) { updateHabit(habit.id, { name: clean }); toast("Habit updated"); }
    else { addHabit(clean); toast(`Started tracking "${clean}"`); }
    onClose();
  };
  return (
    <Modal title={habit ? "Edit habit" : "New habit"} size="sm" onClose={onClose} footer={<>
      <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
      <button type="submit" form="habit-form" className="btn btn-primary">{habit ? "Save changes" : "Add habit"}</button>
    </>}>
      <form id="habit-form" className="form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="habit-name">Habit name</label>
          <input id="habit-name" name="name" value={name} placeholder="For example, Stretch for 10 minutes" aria-invalid={!!error}
            onChange={(e) => { setName(e.target.value); setError(""); }} />
          {error && <p className="field-error" role="alert">{error}</p>}
        </div>
      </form>
    </Modal>
  );
}

export function Habits() {
  const { data, toggleHabit, deleteHabit, askConfirm, toast } = useStore();
  const [editing, setEditing] = useState<Habit | "new" | null>(null);
  const today = todayIso();
  const week = lastDays(7);
  const doneToday = data.habits.filter((h) => h.done.includes(today)).length;
  const best = data.habits.reduce((m, h) => Math.max(m, habitStreak(h)), 0);
  const avg = data.habits.length ? Math.round((data.habits.reduce((n, h) => n + habitRate(h), 0) / data.habits.length) * 100) : 0;

  return (
    <div className="stack">
      <section className="page-head">
        <p className="page-lead">{doneToday} of {data.habits.length} done today. Longest current streak {best} days, {avg}% average over 30 days.</p>
        <button type="button" className="btn btn-primary" onClick={() => setEditing("new")}><Plus size={16} />Add habit</button>
      </section>
      {data.habits.length === 0 ? (
        <section className="card"><EmptyState icon={<Flame size={20} />} title="No habits yet" text="Add a habit and check it off each day to build a streak." /></section>
      ) : (
        <ul className="habit-grid">
          {data.habits.map((h) => {
            const done = h.done.includes(today);
            const streak = habitStreak(h);
            const rate = Math.round(habitRate(h) * 100);
            const weekDone = week.filter((d) => h.done.includes(d)).length;
            return (
              <li key={h.id} className="card habit-card" data-habit-id={h.id}>
                <header className="habit-head">
                  <h3>{h.name}</h3>
                  <div className="row-actions">
                    <button type="button" className="icon-btn" aria-label={`Edit "${h.name}"`} onClick={() => setEditing(h)}><Pencil size={16} /></button>
                    <button type="button" className="icon-btn icon-danger" aria-label={`Delete "${h.name}"`} onClick={() => askConfirm({
                      title: "Delete habit?", message: `"${h.name}" and its history will be removed.`, confirmLabel: "Delete habit",
                      onConfirm: () => { deleteHabit(h.id); toast("Habit deleted", "info"); },
                    })}><Trash2 size={16} /></button>
                  </div>
                </header>
                <div className="habit-numbers">
                  <p><strong>{streak}</strong> day streak</p>
                  <p><strong>{rate}%</strong> last 30 days</p>
                </div>
                <div className="week" aria-label={`This week: ${weekDone} of 7 days`}>
                  {week.map((d) => {
                    const on = h.done.includes(d);
                    return (
                      <button type="button" key={d} className={`day${on ? " is-on" : ""}${d === today ? " is-today" : ""}`}
                        aria-label={`${weekday(d)} ${shortDate(d)}: ${on ? "done" : "not done"}`} aria-pressed={on}
                        onClick={() => toggleHabit(h.id, d)}>
                        <span className="day-name">{weekday(d).slice(0, 2)}</span>
                        <span className="day-box">{on && <Check size={14} strokeWidth={3} />}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="progress" role="progressbar" aria-label={`${h.name} weekly progress`} aria-valuemin={0} aria-valuemax={7} aria-valuenow={weekDone}>
                  <div className="progress-fill" style={{ width: `${(weekDone / 7) * 100}%` }} />
                </div>
                <div className={`habit-today${done ? " is-done" : ""}`}>
                  <Checkbox checked={done} label={`Mark "${h.name}" done today`}
                    onChange={() => { toggleHabit(h.id, today); toast(done ? `Unchecked "${h.name}"` : `Checked off "${h.name}" for today`); }} />
                  <span>{done ? "Done today" : "Not done yet today"}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {editing && <HabitModal habit={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
