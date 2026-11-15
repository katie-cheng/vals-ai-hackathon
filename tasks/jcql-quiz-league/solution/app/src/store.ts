import { useSyncExternalStore } from "react";
import { monogram } from "./logo";

export type Team = {
  id: string;
  name: string;
  logo: string;
  score: number;
  sample?: boolean;
};

export type Change = { teamId: string; delta: number; at: number };

export type League = {
  teams: Team[];
  round: string;
  lastChange: Change | null;
};

const KEY = "jcql-league";
export const NAME_MAX = 40;

const SAMPLE: [string, number, string][] = [
  ["Night Owls", 140, "#3f5a4c"],
  ["Room 214", 125, "#5b4a36"],
  ["Second Floor East", 125, "#3d4a5c"],
  ["The Crescographs", 110, "#5a3f47"],
  ["Mess Hall Regulars", 90, "#4b5536"],
  ["Wireless Wave", 70, "#3b5257"],
];

export const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function sampleLeague(): League {
  return {
    teams: SAMPLE.map(([name, score, colour]) => ({ id: newId(), name, score, logo: monogram(name, colour), sample: true })),
    round: "Round 4 of 6",
    lastChange: null,
  };
}

function isChange(c: unknown): c is Change {
  const x = c as Change;
  return !!x && typeof x.teamId === "string" && Number.isFinite(x.delta) && Number.isFinite(x.at);
}

function isLeague(x: unknown): x is League {
  const l = x as League;
  return (
    !!l &&
    Array.isArray(l.teams) &&
    l.teams.every((t) => !!t && typeof t.id === "string" && typeof t.name === "string" && typeof t.logo === "string" && Number.isFinite(t.score)) &&
    (l.round === undefined || typeof l.round === "string") &&
    (l.lastChange == null || isChange(l.lastChange))
  );
}

function read(): League {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isLeague(parsed)) return { ...parsed, round: parsed.round ?? "", lastChange: parsed.lastChange ?? null };
    }
  } catch {
    // Unreadable data falls back to the sample league below.
  }
  const fresh = sampleLeague();
  try {
    localStorage.setItem(KEY, JSON.stringify(fresh));
  } catch {
    // Storage can be unavailable (private mode); the league then lives in memory only.
  }
  return fresh;
}

let current: League | null = null;
const listeners = new Set<() => void>();

function snapshot(): League {
  if (!current) current = read();
  return current;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY && e.key !== null) return;
    current = read();
    listeners.forEach((l) => l());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

/** Saves the league and tells every open page; throws when the browser's storage is full. */
export function save(next: League) {
  localStorage.setItem(KEY, JSON.stringify(next));
  current = next;
  listeners.forEach((l) => l());
}

export function useLeague() {
  return useSyncExternalStore(subscribe, snapshot);
}

/** Highest score first; equal scores keep alphabetical order. */
export function standings(teams: Team[]) {
  const sorted = [...teams].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  // Equal scores share a rank (1, 2, 2, 4).
  return sorted.map((team, i) => ({ team, rank: sorted.findIndex((t) => t.score === team.score) + 1, index: i }));
}

export function parseBackup(text: string): League {
  const parsed = JSON.parse(text);
  if (!isLeague(parsed)) throw new Error("This file is not a JCQL backup.");
  return { round: parsed.round || "", lastChange: null, teams: parsed.teams };
}
