import { addDays, daysBetween, lastDays, todayIso } from "./dates";
import type { AppData, Habit, Task } from "./types";

export const dayOf = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const isOverdue = (t: Task) => !t.completed && !!t.due && t.due < todayIso();

export function habitStreak(h: Habit, today = todayIso()): number {
  const set = new Set(h.done);
  let day = set.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (set.has(day)) {
    n++;
    day = addDays(day, -1);
  }
  return n;
}

/** Share of days the habit was done over the last 30 days (or since it was created, if newer). */
export function habitRate(h: Habit, days = 30, today = todayIso()): number {
  const since = Math.min(days, Math.max(1, daysBetween(dayOf(h.createdAt), today) + 1));
  const window = new Set(lastDays(since, today));
  return h.done.filter((d) => window.has(d)).length / since;
}

export function completedOn(tasks: Task[], day: string) {
  return tasks.filter((t) => t.completed && t.completedAt && dayOf(t.completedAt) === day).length;
}

export function focusMinutesOn(data: AppData, day: string) {
  return data.sessions.filter((s) => s.mode === "focus" && dayOf(s.completedAt) === day).reduce((n, s) => n + s.minutes, 0);
}

/**
 * Productivity score for the 7 days ending `end`: tasks done against the daily goal (40%), habit check-ins (40%)
 * and focus minutes against the daily focus goal (20%).
 */
export function weeklyScore(data: AppData, end = todayIso()) {
  const days = lastDays(7, end);
  const tasksDone = days.reduce((n, d) => n + completedOn(data.tasks, d), 0);
  const taskPart = Math.min(1, tasksDone / Math.max(1, data.settings.dailyTaskGoal * 7));
  const possible = data.habits.length * 7;
  const checkins = data.habits.reduce((n, h) => n + h.done.filter((d) => days.includes(d)).length, 0);
  const habitPart = possible ? checkins / possible : 0;
  const focus = days.reduce((n, d) => n + focusMinutesOn(data, d), 0);
  const focusPart = Math.min(1, focus / Math.max(1, data.settings.dailyFocusGoal * 7));
  return { score: Math.round(100 * (0.4 * taskPart + 0.4 * habitPart + 0.2 * focusPart)), tasksDone, checkins, possible, focus };
}

export function taskStats(tasks: Task[]) {
  const today = todayIso();
  const completed = tasks.filter((t) => t.completed).length;
  return {
    total: tasks.length,
    completed,
    pending: tasks.length - completed,
    overdue: tasks.filter(isOverdue).length,
    dueToday: tasks.filter((t) => !t.completed && t.due === today).length,
    rate: tasks.length ? completed / tasks.length : 0,
  };
}
