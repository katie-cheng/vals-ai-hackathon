export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  notes: string;
  priority: Priority;
  category: string;
  due: string | null;
  completed: boolean;
  completedAt: number | null;
  createdAt: number;
}

export interface Habit {
  id: string;
  name: string;
  /** ISO dates on which the habit was done. */
  done: string[];
  createdAt: number;
}

export type TimerMode = "focus" | "short" | "long";

export interface FocusSession {
  id: string;
  mode: TimerMode;
  minutes: number;
  label: string;
  completedAt: number;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  category: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  name: string;
  theme: "light" | "dark";
  focusMinutes: number;
  shortMinutes: number;
  longMinutes: number;
  longEvery: number;
  autoStartBreaks: boolean;
  dailyTaskGoal: number;
  dailyFocusGoal: number;
  defaultPriority: Priority;
  sidebarCollapsed: boolean;
}

export interface AppData {
  version: 1;
  tasks: Task[];
  habits: Habit[];
  sessions: FocusSession[];
  notes: Note[];
  settings: Settings;
}

export const TASK_CATEGORIES = ["Work", "Personal", "Health", "Learning", "Finance", "Home"];
export const NOTE_CATEGORIES = ["Work", "Personal", "Ideas", "Learning", "Reading"];
export const PRIORITIES: Priority[] = ["high", "medium", "low"];
export const PRIORITY_LABEL: Record<Priority, string> = { high: "High", medium: "Medium", low: "Low" };
