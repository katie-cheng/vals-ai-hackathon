import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DEFAULT_SETTINGS, seedData, uid } from "./seed";
import type { AppData, FocusSession, Habit, Note, Settings, Task } from "./types";

const KEY = "lifeos:data:v1";

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      if (parsed && parsed.version === 1) return { ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } };
    }
  } catch {
    /* fall through to sample data */
  }
  return seedData();
}

export interface Toast { id: number; message: string; tone: "success" | "info" | "danger" }
export interface ConfirmRequest { title: string; message: string; confirmLabel: string; onConfirm: () => void }

interface Store {
  data: AppData;
  addTask(t: Omit<Task, "id" | "createdAt" | "completed" | "completedAt">): void;
  updateTask(id: string, patch: Partial<Task>): void;
  toggleTask(id: string): void;
  deleteTask(id: string): void;
  addHabit(name: string): void;
  updateHabit(id: string, patch: Partial<Habit>): void;
  toggleHabit(id: string, day: string): void;
  deleteHabit(id: string): void;
  addSession(s: Omit<FocusSession, "id">): void;
  clearSessions(): void;
  addNote(n: Omit<Note, "id" | "createdAt" | "updatedAt">): string;
  updateNote(id: string, patch: Partial<Note>): void;
  deleteNote(id: string): void;
  updateSettings(patch: Partial<Settings>): void;
  clearAll(): void;
  toasts: Toast[];
  toast(message: string, tone?: Toast["tone"]): void;
  dismissToast(id: number): void;
  confirm: ConfirmRequest | null;
  askConfirm(req: ConfirmRequest): void;
  closeConfirm(): void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const toastId = useRef(0);

  const adopted = useRef(false);
  useEffect(() => {
    // A document adopted from another tab is already stored; writing it back could clobber that tab's newer save.
    if (adopted.current) { adopted.current = false; return; }
    localStorage.setItem(KEY, JSON.stringify(data));
  }, [data]);

  // Another tab saved: adopt its document so this tab's next save doesn't overwrite it.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return;
      adopted.current = true;
      setData(load());
    };
    addEventListener("storage", onStorage);
    return () => removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.theme;
    document.documentElement.style.colorScheme = data.settings.theme;
  }, [data.settings.theme]);

  const dismissToast = useCallback((id: number) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);
  const toast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = ++toastId.current;
    setToasts((ts) => [...ts.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 3600);
  }, []);

  const mutate = useCallback((fn: (d: AppData) => AppData) => setData(fn), []);

  const store = useMemo<Store>(() => ({
    data,
    addTask: (t) => mutate((d) => ({ ...d, tasks: [{ ...t, id: uid("t"), createdAt: Date.now(), completed: false, completedAt: null }, ...d.tasks] })),
    updateTask: (id, patch) => mutate((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
    toggleTask: (id) => mutate((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed, completedAt: t.completed ? null : Date.now() } : t)),
    })),
    deleteTask: (id) => mutate((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) })),
    addHabit: (name) => mutate((d) => ({ ...d, habits: [...d.habits, { id: uid("h"), name, done: [], createdAt: Date.now() }] })),
    updateHabit: (id, patch) => mutate((d) => ({ ...d, habits: d.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)) })),
    toggleHabit: (id, day) => mutate((d) => ({
      ...d,
      habits: d.habits.map((h) => (h.id === id ? { ...h, done: h.done.includes(day) ? h.done.filter((x) => x !== day) : [...h.done, day].sort() } : h)),
    })),
    deleteHabit: (id) => mutate((d) => ({ ...d, habits: d.habits.filter((h) => h.id !== id) })),
    addSession: (s) => mutate((d) => ({ ...d, sessions: [...d.sessions, { ...s, id: uid("s") }] })),
    clearSessions: () => mutate((d) => ({ ...d, sessions: [] })),
    addNote: (n) => {
      const id = uid("n");
      const now = Date.now();
      mutate((d) => ({ ...d, notes: [{ ...n, id, createdAt: now, updatedAt: now }, ...d.notes] }));
      return id;
    },
    updateNote: (id, patch) => mutate((d) => ({ ...d, notes: d.notes.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)) })),
    deleteNote: (id) => mutate((d) => ({ ...d, notes: d.notes.filter((n) => n.id !== id) })),
    updateSettings: (patch) => mutate((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
    clearAll: () => mutate((d) => ({ version: 1, tasks: [], habits: [], sessions: [], notes: [], settings: { ...DEFAULT_SETTINGS, theme: d.settings.theme } })),
    toasts,
    toast,
    dismissToast,
    confirm,
    askConfirm: setConfirm,
    closeConfirm: () => setConfirm(null),
  }), [data, toasts, confirm, mutate, toast, dismissToast]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}
