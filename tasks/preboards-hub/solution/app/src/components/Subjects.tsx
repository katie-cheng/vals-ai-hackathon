import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { STATUSES, nextStatus, type Status, type Subject } from "../lib/types";
import { uid } from "../lib/storage";
import { Button, Card, inputClass, muted } from "./ui";

const BADGE: Record<Status, string> = {
  "Not Started": "bg-slate-500/10 text-slate-700 ring-slate-500/25 dark:text-slate-300",
  "In Progress": "bg-sky-500/10 text-sky-800 ring-sky-500/30 dark:text-sky-300",
  Revise: "bg-amber-500/15 text-amber-800 ring-amber-500/35 dark:text-amber-300",
  Mastered: "bg-emerald-500/15 text-emerald-800 ring-emerald-500/35 dark:text-emerald-300",
};

export default function Subjects({ subjects, setSubjects }: { subjects: Subject[]; setSubjects: (f: (s: Subject[]) => Subject[]) => void }) {
  const [name, setName] = useState("");
  const add = (e: FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    setSubjects((s) => [...s, { id: uid(), name: n, status: "Not Started" }]);
    setName("");
  };
  const mastered = subjects.filter((s) => s.status === "Mastered").length;

  return (
    <Card id="subjects" title="Subjects" action={<span className={`text-sm ${muted}`}>{mastered} of {subjects.length} mastered</span>}>
      <p className={`mb-3 text-sm ${muted}`}>Click a subject to move its status on: {STATUSES.join(", then ")}.</p>
      {subjects.length === 0 ? (
        <p className={`rounded-lg border border-dashed border-slate-900/15 px-4 py-6 text-center text-sm dark:border-white/15 ${muted}`}>No subjects yet. Add your first exam subject below.</p>
      ) : (
        <ul className="divide-y divide-slate-900/5 dark:divide-white/5" aria-label="Exam subjects">
          {subjects.map((s) => (
            <li key={s.id} className="flex items-center gap-1 py-1">
              <button
                type="button"
                onClick={() => setSubjects((all) => all.map((x) => (x.id === s.id ? { ...x, status: nextStatus(x.status) } : x)))}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-slate-900/5 dark:hover:bg-white/5"
                aria-label={`${s.name} status: ${s.status}. Click to change`}
                title="Click to change status"
              >
                <span className="min-w-0 flex-1 truncate font-medium text-slate-900 dark:text-slate-100">{s.name}</span>
                <span className={`w-28 shrink-0 whitespace-nowrap rounded-md px-2 py-1 text-center text-[13px] font-semibold ring-1 ring-inset transition-colors ${BADGE[s.status]}`} data-status={s.status}>
                  {s.status}
                </span>
              </button>
              <Button variant="ghost" className="px-2" onClick={() => setSubjects((all) => all.filter((x) => x.id !== s.id))} aria-label={`Delete ${s.name}`}>
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={add} className="mt-4 flex gap-2">
        <label className="sr-only" htmlFor="new-subject">
          New subject
        </label>
        <input id="new-subject" className={inputClass} placeholder="Add a subject" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
        <Button type="submit" variant="primary" disabled={!name.trim()}>
          <Plus className="size-4" aria-hidden="true" />
          Add subject
        </Button>
      </form>
    </Card>
  );
}
