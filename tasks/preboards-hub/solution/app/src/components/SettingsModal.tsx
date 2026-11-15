import { X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { defaultTarget, toLocalInput } from "../lib/time";
import type { Exam } from "../lib/types";
import { Button, inputClass, muted } from "./ui";

export default function SettingsModal({ exam, onSave, onClose }: { exam: Exam; onSave: (e: Exam) => void; onClose: () => void }) {
  const [name, setName] = useState(exam.name);
  const [when, setWhen] = useState(toLocalInput(exam.target));
  const first = useRef<HTMLInputElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const d = new Date(when);
    if (Number.isNaN(d.getTime())) return;
    onSave({ name: name.trim() || "Preboard exams", target: d.toISOString() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="settings-title" className="glass w-full max-w-md rounded-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="settings-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            Countdown settings
          </h2>
          <Button variant="ghost" className="px-2" onClick={onClose} aria-label="Close settings">
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-200">Exam name</span>
            <input ref={first} className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-800 dark:text-slate-200">Target date and time</span>
            <input type="datetime-local" required className={inputClass} value={when} onChange={(e) => setWhen(e.target.value)} />
          </label>
          <p className={`text-sm ${muted}`}>
            The default is 27 November at 9:00.{" "}
            <button type="button" className="font-medium text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-300" onClick={() => setWhen(toLocalInput(defaultTarget()))}>
              Restore it
            </button>
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">
              Save countdown
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
