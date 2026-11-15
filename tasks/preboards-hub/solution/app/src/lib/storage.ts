import { useEffect, useState } from "react";

const PREFIX = "preboards:";

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the app keeps working for this visit.
  }
}

/** useState that is read from and written to localStorage. */
export function useStored<T>(key: string, fallback: T | (() => T)) {
  const [value, setValue] = useState<T>(() => load(key, typeof fallback === "function" ? (fallback as () => T)() : fallback));
  useEffect(() => save(key, value), [key, value]);
  return [value, setValue] as const;
}

export const uid = () => Math.random().toString(36).slice(2, 10);
