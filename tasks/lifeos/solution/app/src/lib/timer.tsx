import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useStore } from "./store";
import type { TimerMode } from "./types";

export const MODE_LABEL: Record<TimerMode, string> = { focus: "Focus", short: "Short break", long: "Long break" };

interface TimerState {
  mode: TimerMode;
  remaining: number;
  total: number;
  running: boolean;
  label: string;
  cycle: number;
  setLabel(s: string): void;
  setMode(m: TimerMode): void;
  start(): void;
  pause(): void;
  reset(): void;
  skip(): void;
}

const Ctx = createContext<TimerState | null>(null);

export function TimerProvider({ children }: { children: ReactNode }) {
  const { data, addSession, toast } = useStore();
  const s = data.settings;
  const minutesFor = useCallback((m: TimerMode) => (m === "focus" ? s.focusMinutes : m === "short" ? s.shortMinutes : s.longMinutes), [s.focusMinutes, s.shortMinutes, s.longMinutes]);
  const [mode, setModeState] = useState<TimerMode>("focus");
  const [remaining, setRemaining] = useState(() => minutesFor("focus") * 60);
  const [running, setRunning] = useState(false);
  const [label, setLabel] = useState("");
  const [cycle, setCycle] = useState(0);
  const endAt = useRef(0);
  // Length of the countdown currently loaded, so a session is credited with what was actually timed.
  const length = useRef(minutesFor("focus"));
  const load = (m: TimerMode) => { length.current = minutesFor(m); setRemaining(minutesFor(m) * 60); };

  // Duration changes in settings apply immediately while the timer is idle.
  useEffect(() => {
    if (!running) load(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minutesFor]);

  const setMode = (m: TimerMode) => {
    setModeState(m);
    setRunning(false);
    load(m);
  };

  const finish = useCallback((completed: boolean) => {
    setRunning(false);
    if (mode === "focus") {
      if (completed) addSession({ mode, minutes: length.current, label: label.trim() || "Focus session", completedAt: Date.now() });
      const next = (cycle + 1) % s.longEvery === 0 ? "long" : "short";
      setCycle((c) => c + 1);
      toast(completed ? `Focus session complete. Time for a ${next === "long" ? "long" : "short"} break.` : "Focus session skipped.", completed ? "success" : "info");
      setModeState(next);
      load(next);
      if (completed && s.autoStartBreaks) {
        endAt.current = Date.now() + minutesFor(next) * 60_000;
        setRunning(true);
      }
    } else {
      toast(completed ? "Break finished. Ready for the next focus session?" : "Break skipped.", "info");
      setModeState("focus");
      load("focus");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, label, cycle, s.longEvery, s.autoStartBreaks, minutesFor, addSession, toast]);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const left = Math.max(0, Math.round((endAt.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) finish(true);
    };
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [running, finish]);

  const value: TimerState = {
    mode, remaining, total: minutesFor(mode) * 60, running, label, cycle, setLabel, setMode,
    start: () => { endAt.current = Date.now() + remaining * 1000; setRunning(true); },
    pause: () => setRunning(false),
    reset: () => { setRunning(false); load(mode); },
    skip: () => finish(false),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTimer() {
  const t = useContext(Ctx);
  if (!t) throw new Error("useTimer outside TimerProvider");
  return t;
}

export const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
