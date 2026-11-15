import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Companion from "./components/Companion";
import Countdown from "./components/Countdown";
import Goals from "./components/Goals";
import Header from "./components/Header";
import Motivation from "./components/Motivation";
import Pomodoro, { LENGTH, remainingOf, type Mode, type Timer } from "./components/Pomodoro";
import Reminders from "./components/Reminders";
import SettingsModal from "./components/SettingsModal";
import Subjects from "./components/Subjects";
import Toasts from "./components/Toasts";
import { permission as currentPermission, notificationsSupported, systemNotify, type Toast } from "./lib/notify";
import { randomQuote } from "./lib/quotes";
import { useSpeech } from "./lib/speech";
import { uid, useStored } from "./lib/storage";
import { DAY, defaultTarget, todayKey } from "./lib/time";
import type { Exam, Goal, Prefs, Subject } from "./lib/types";
import { useNow } from "./lib/useNow";

const MILESTONES = [30, 14, 7, 3, 1];

const starterSubjects = (): Subject[] => [
  { id: uid(), name: "Mathematics", status: "In Progress" },
  { id: uid(), name: "Physics", status: "Revise" },
  { id: uid(), name: "Chemistry", status: "Not Started" },
  { id: uid(), name: "Biology", status: "Mastered" },
  { id: uid(), name: "English", status: "Not Started" },
];

const starterGoals = (): Goal[] => [
  { id: uid(), text: "Review the physics formula sheet", done: true, due: "", date: todayKey() },
  { id: uid(), text: "Do 20 integration practice questions", done: false, due: "", date: todayKey() },
  { id: uid(), text: "Summarise chemistry chapter 6", done: false, due: "", date: todayKey() },
];

/** Goals belong to a day: finished ones from earlier days are cleared, unfinished ones carry over to today. */
const rollOver = (goals: Goal[]) => {
  const today = todayKey();
  return goals.filter((g) => g.date === today || !g.done).map((g) => (g.date === today ? g : { ...g, date: today, reminded: false }));
};

export default function App() {
  const [theme, setTheme] = useStored<"dark" | "light">("theme", "dark");
  const [exam, setExam] = useStored<Exam>("exam", () => ({ name: "Preboard exams", target: defaultTarget() }));
  const [subjects, setSubjects] = useStored<Subject[]>("subjects", starterSubjects);
  const [goals, setGoals] = useStored<Goal[]>("goals", starterGoals);
  const [prefs, setPrefs] = useStored<Prefs>("prefs", { notify: false, speakAlerts: true, voice: "" });
  const [timer, setTimer] = useStored<Timer>("pomodoro", { mode: "focus", remaining: LENGTH.focus, endsAt: null });
  const [focusLog, setFocusLog] = useStored<{ date: string; count: number }>("focus-log", { date: todayKey(), count: 0 });
  const [fired, setFired] = useStored<string[]>("milestones-fired", []);
  const [quote, setQuote] = useState(() => randomQuote());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [perm, setPerm] = useState(currentPermission);
  const now = useNow();
  const { speak, stop, speaking, voices } = useSpeech(prefs.voice);
  const focusToday = focusLog.date === todayKey() ? focusLog.count : 0;

  useEffect(() => setGoals(rollOver), [setGoals]);

  const dark = theme === "dark";
  const fadeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0f172a" : "#eceff3");
  }, [dark]);
  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.add("theme-fade");
    clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => root.classList.remove("theme-fade"), 500);
    setTheme(dark ? "light" : "dark");
  };

  const alert = useCallback(
    (title: string, body: string, say = false) => {
      const id = uid();
      setToasts((t) => [...t.slice(-2), { id, title, body }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 9000);
      if (prefs.notify) systemNotify(title, body);
      if (say && prefs.speakAlerts) speak(`${title}. ${body}`);
    },
    [prefs.notify, prefs.speakAlerts, speak],
  );

  // Pomodoro: a finished study session starts the break; a finished break gets the next session ready.
  useEffect(() => {
    if (!timer.endsAt || now < timer.endsAt) return;
    if (timer.mode === "focus") {
      setFocusLog((l) => ({ date: todayKey(), count: (l.date === todayKey() ? l.count : 0) + 1 }));
      setTimer({ mode: "break", remaining: LENGTH.break, endsAt: Date.now() + LENGTH.break });
      alert("Study session complete", "Nice work. Your 5 minute break has started.", true);
    } else {
      setTimer({ mode: "focus", remaining: LENGTH.focus, endsAt: null });
      alert("Break is over", "Ready when you are for the next 25 minute study session.", true);
    }
  }, [now, timer, setTimer, setFocusLog, alert]);

  // Goals with a due time remind once when that time arrives.
  useEffect(() => {
    const d = new Date(now);
    const hhmm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    const due = goals.filter((g) => g.due && !g.done && !g.reminded && g.date === todayKey(d) && g.due <= hhmm);
    if (!due.length) return;
    due.forEach((g) => alert("Goal due now", g.text));
    setGoals((all) => all.map((g) => (due.some((x) => x.id === g.id) ? { ...g, reminded: true } : g)));
  }, [now, goals, setGoals, alert]);

  // Countdown milestones: one alert per milestone for the current target, including the start of the exam.
  const daysLeft = Math.ceil((new Date(exam.target).getTime() - now) / DAY);
  useEffect(() => {
    const reached = daysLeft <= 0 ? 0 : MILESTONES.filter((m) => daysLeft <= m).at(-1);
    if (reached === undefined) return;
    const key = `${exam.target}:${reached}`;
    if (fired.includes(key)) return;
    setFired((f) => [...f.filter((k) => k.startsWith(exam.target)), key]);
    if (reached === 0) alert(`${exam.name} starts now`, "Good luck. Breathe, read every question twice and trust your preparation.");
    else alert(`${daysLeft === 1 ? "1 day" : `${daysLeft} days`} to ${exam.name}`, `Under ${reached} ${reached === 1 ? "day" : "days"} to go. Check your Revise subjects and plan the days ahead.`);
  }, [daysLeft, exam, fired, setFired, alert]);

  const nextMilestone = useMemo(() => {
    const m = MILESTONES.filter((x) => x < daysLeft)[0];
    return m === undefined ? null : { days: m, at: new Date(new Date(exam.target).getTime() - m * DAY).toISOString() };
  }, [daysLeft, exam.target]);

  const toggleNotify = async (on: boolean) => {
    setPrefs((p) => ({ ...p, notify: on }));
    if (on && notificationsSupported() && Notification.permission === "default") {
      try {
        setPerm(await Notification.requestPermission());
      } catch {
        setPerm(currentPermission());
      }
    }
  };

  const timerActions = {
    onStart: () => setTimer((t) => ({ ...t, endsAt: Date.now() + t.remaining })),
    onPause: () => setTimer((t) => ({ ...t, remaining: remainingOf(t, Date.now()), endsAt: null })),
    onReset: () => setTimer((t) => ({ mode: t.mode, remaining: LENGTH[t.mode], endsAt: null })),
    onMode: (mode: Mode) => setTimer({ mode, remaining: LENGTH[mode], endsAt: null }),
  };

  const ctx = { exam, now, subjects, goals, focusToday };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      <a href="#countdown" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-slate-900">
        Skip to countdown
      </a>
      <Header dark={dark} onTheme={toggleTheme} onSettings={() => setSettingsOpen(true)} />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8 lg:py-8">
        <Countdown exam={exam} now={now} onSettings={() => setSettingsOpen(true)} />
        <aside className="lg:col-start-2 lg:row-span-3 lg:row-start-1" aria-label="Companion and reminders">
          <div className="space-y-5 lg:sticky lg:top-24">
            <Companion ctx={ctx} speak={speak} stop={stop} speaking={speaking} voices={voices} voice={prefs.voice} setVoice={(voice) => setPrefs((p) => ({ ...p, voice }))} />
            <Reminders
              notify={prefs.notify}
              permission={perm}
              onNotify={toggleNotify}
              speakAlerts={prefs.speakAlerts}
              onSpeakAlerts={(speakAlerts) => setPrefs((p) => ({ ...p, speakAlerts }))}
              nextMilestone={nextMilestone}
              onTest={() => alert("Test alert", prefs.notify && perm === "granted" ? "Reminders are working, including system notifications." : "Reminders are working on this page.")}
            />
          </div>
        </aside>
        <div className="grid items-start gap-5 md:grid-cols-2">
          <Subjects subjects={subjects} setSubjects={setSubjects} />
          <Goals goals={goals} setGoals={setGoals} />
        </div>
        <div className="grid items-start gap-5 md:grid-cols-2">
          <Pomodoro timer={timer} now={now} focusToday={focusToday} {...timerActions} />
          <Motivation index={quote} onShuffle={() => setQuote((q) => randomQuote(q))} onSpeak={speak} />
        </div>
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-8 text-sm text-slate-600 sm:px-6 lg:px-8 dark:text-slate-400">
        Your subjects, goals, theme and exam date are saved in this browser only.
      </footer>
      {settingsOpen && (
        <SettingsModal
          exam={exam}
          onClose={() => setSettingsOpen(false)}
          onSave={(e) => {
            setExam(e);
            setSettingsOpen(false);
            alert("Countdown updated", `Counting down to ${e.name}.`);
          }}
        />
      )}
      <Toasts toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  );
}
