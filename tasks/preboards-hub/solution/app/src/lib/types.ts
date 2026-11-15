export const STATUSES = ["Not Started", "In Progress", "Revise", "Mastered"] as const;
export type Status = (typeof STATUSES)[number];

export type Subject = { id: string; name: string; status: Status };
export type Goal = { id: string; text: string; done: boolean; due: string; date: string; reminded?: boolean };
export type Exam = { name: string; target: string };
export type Prefs = { notify: boolean; speakAlerts: boolean; voice: string };

export const nextStatus = (s: Status): Status => STATUSES[(STATUSES.indexOf(s) + 1) % STATUSES.length];
