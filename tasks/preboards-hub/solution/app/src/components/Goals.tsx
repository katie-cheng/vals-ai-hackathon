import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { uid } from "../lib/storage";
import { todayKey } from "../lib/time";
import type { Goal } from "../lib/types";
import { Button, Card, inputClass, muted } from "./ui";

export default function Goals({ goals, setGoals }: { goals: Goal[]; setGoals: (f: (g: Goal[]) => Goal[]) => void }) {
  const [text, setText] = useState("");
  const [due, setDue] = useState("");
  const [justDone, setJustDone] = useState<string | null>(null);
  const done = goals.filter((g) => g.done).length;
  const pct = goals.length ? Math.round((done / goals.length) * 100) : 0;

  const add = (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setGoals((g) => [...g, { id: uid(), text: t, done: false, due, date: todayKey() }]);
    setText("");
    setDue("");
  };
  const toggle = (id: string) => {
    const g = goals.find((x) => x.id === id);
    setJustDone(g && !g.done ? id : null);
    setGoals((all) => all.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  };

  return (
    <Card id="goals" title="Today's goals" action={<span className={`text-sm ${muted}`}>{done} of {goals.length} done</span>}>
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className={muted}>Progress</span>
          <span className="font-semibold tabular-nums text-slate-900 dark:text-white" data-testid="goal-percent">
            {pct}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded bg-slate-900/10 dark:bg-white/10" role="progressbar" aria-label="Goals completed" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div className="h-full rounded bg-emerald-500 transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {goals.length === 0 ? (
        <p className={`rounded-lg border border-dashed border-slate-900/15 px-4 py-6 text-center text-sm dark:border-white/15 ${muted}`}>Nothing planned yet. Add a goal for today below.</p>
      ) : (
        <ul className="space-y-1" aria-label="Daily goals">
          {goals.map((g) => (
            <li key={g.id} className="group flex items-center gap-3 rounded-lg px-1 py-1.5">
              <input
                id={`goal-${g.id}`}
                type="checkbox"
                checked={g.done}
                onChange={() => toggle(g.id)}
                className="size-[18px] shrink-0 cursor-pointer rounded accent-emerald-600"
              />
              <label htmlFor={`goal-${g.id}`} className="min-w-0 flex-1 cursor-pointer text-slate-800 dark:text-slate-200">
                <span className={`goal-text ${justDone === g.id ? "just-done" : ""}`} data-done={g.done}>
                  {g.text}
                </span>
              </label>
              {g.due && <span className={`shrink-0 text-sm tabular-nums ${g.done ? "text-slate-400 dark:text-slate-500" : muted}`}>Due {g.due}</span>}
              <Button variant="ghost" className="px-2" onClick={() => setGoals((all) => all.filter((x) => x.id !== g.id))} aria-label={`Delete goal: ${g.text}`}>
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={add} className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        <label className="sr-only" htmlFor="new-goal">
          New goal
        </label>
        <input id="new-goal" className={`${inputClass} col-span-2`} placeholder="Add a goal, e.g. Finish chapter 4 problems" value={text} onChange={(e) => setText(e.target.value)} maxLength={80} />
        <label className="sr-only" htmlFor="new-goal-due">
          Due time (optional)
        </label>
        <input id="new-goal-due" type="time" className={inputClass} value={due} onChange={(e) => setDue(e.target.value)} title="Due time (optional)" />
        <Button type="submit" variant="primary" disabled={!text.trim()}>
          <Plus className="size-4" aria-hidden="true" />
          Add goal
        </Button>
      </form>
    </Card>
  );
}
