import { useEffect, useState } from "react";
import type { ControlScheme, Quality } from "./device";

export interface Settings {
  quality: Quality | "auto";
  controls: ControlScheme | "auto";
  hints: boolean;
}

const KEY = "afterlife.settings";
const DEFAULTS: Settings = { quality: "auto", controls: "auto", hints: true };
const subs = new Set<(s: Settings) => void>();

function read(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return DEFAULTS;
  }
}

export function useSettings(): [Settings, (patch: Partial<Settings>) => void] {
  const [s, setS] = useState(read);
  useEffect(() => {
    subs.add(setS);
    return () => void subs.delete(setS);
  }, []);
  const update = (patch: Partial<Settings>) => {
    const next = { ...read(), ...patch };
    localStorage.setItem(KEY, JSON.stringify(next));
    subs.forEach((f) => f(next));
  };
  return [s, update];
}
