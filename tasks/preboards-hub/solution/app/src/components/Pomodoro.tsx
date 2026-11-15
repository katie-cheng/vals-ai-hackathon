import { Pause, Play, RotateCcw } from "lucide-react";
import { pad } from "../lib/time";
import { Button, Card, muted } from "./ui";

export type Mode = "focus" | "break";
export const LENGTH: Record<Mode, number> = { focus: 25 * 60_000, break: 5 * 60_000 };
export type Timer = { mode: Mode; remaining: number; endsAt: number | null };

type Props = { timer: Timer; now: number; focusToday: number; onStart: () => void; onPause: () => void; onReset: () => void; onMode: (m: Mode) => void };

export const remainingOf = (t: Timer, now: number) => (t.endsAt ? Math.max(0, t.endsAt - now) : t.remaining);

export default function Pomodoro({ timer, now, focusToday, onStart, onPause, onReset, onMode }: Props) {
  const left = remainingOf(timer, now);
  const secs = Math.ceil(left / 1000);
  const running = timer.endsAt !== null;
  const share = 1 - left / LENGTH[timer.mode];
  return (
    <Card id="pomodoro" title="Focus timer" action={<span className={`text-sm ${muted}`}>{focusToday} done today</span>}>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-900/5 p-1 dark:bg-white/5" role="group" aria-label="Timer mode">
        {(["focus", "break"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={timer.mode === m}
            onClick={() => onMode(m)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              timer.mode === m ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {m === "focus" ? "Study 25 min" : "Break 5 min"}
          </button>
        ))}
      </div>
      <div className="py-6 text-center">
        <div className="text-6xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white" role="timer" aria-label={`${timer.mode === "focus" ? "Study" : "Break"} time left`}>
          {Math.floor(secs / 60)}:{pad(secs % 60)}
        </div>
        <p className={`mt-1 text-sm ${muted}`}>{timer.mode === "focus" ? (running ? "Studying. Stay with it." : "Ready for a study session") : running ? "On a break. Step away from the desk." : "Break ready"}</p>
        <div className="mx-auto mt-4 h-1.5 max-w-60 overflow-hidden rounded bg-slate-900/10 dark:bg-white/10" aria-hidden="true">
          <div className={`h-full ${timer.mode === "focus" ? "bg-indigo-500" : "bg-emerald-500"}`} style={{ width: `${Math.round(share * 1000) / 10}%` }} />
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {running ? (
          <Button variant="primary" className="min-w-28" onClick={onPause}>
            <Pause className="size-4" aria-hidden="true" />
            Pause
          </Button>
        ) : (
          <Button variant="primary" className="min-w-28" onClick={onStart}>
            <Play className="size-4" aria-hidden="true" />
            Start
          </Button>
        )}
        <Button onClick={onReset}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Reset
        </Button>
      </div>
    </Card>
  );
}
