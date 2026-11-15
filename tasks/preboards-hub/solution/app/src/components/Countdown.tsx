import { Settings2 } from "lucide-react";
import { longDate, split } from "../lib/time";
import type { Exam } from "../lib/types";
import { Button, muted } from "./ui";

export default function Countdown({ exam, now, onSettings }: { exam: Exam; now: number; onSettings: () => void }) {
  const left = new Date(exam.target).getTime() - now;
  const t = split(left);
  const units = [
    ["Days", t.days],
    ["Hours", t.hours],
    ["Minutes", t.minutes],
    ["Seconds", t.seconds],
  ] as const;
  return (
    <section aria-labelledby="countdown-title" id="countdown" className="glass rounded-2xl p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 id="countdown-title" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            {left > 0 ? `Countdown to ${exam.name}` : `${exam.name} has started`}
          </h1>
          <p className={`mt-1 text-sm sm:text-base ${muted}`}>
            <time dateTime={exam.target}>{longDate(exam.target)}</time>
          </p>
        </div>
        <Button onClick={onSettings}>
          <Settings2 className="size-4" aria-hidden="true" />
          Change date
        </Button>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4" role="timer" aria-live="off" aria-label="Time remaining">
        {units.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-900/5 bg-white/50 px-3 py-4 text-center sm:py-6 dark:border-white/5 dark:bg-slate-950/30">
            <div className="text-5xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-white" data-unit={label.toLowerCase()}>
              {value}
            </div>
            <div className={`mt-1 text-sm font-medium ${muted}`}>{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
