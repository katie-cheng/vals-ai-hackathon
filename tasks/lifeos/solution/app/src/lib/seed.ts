import { addDays, parseIso, todayIso } from "./dates";
import type { AppData, FocusSession, Habit, Note, Priority, Task } from "./types";

export const DEFAULT_SETTINGS: AppData["settings"] = {
  name: "Maya",
  theme: "light",
  focusMinutes: 25,
  shortMinutes: 5,
  longMinutes: 15,
  longEvery: 4,
  autoStartBreaks: false,
  dailyTaskGoal: 3,
  dailyFocusGoal: 100,
  defaultPriority: "medium",
  sidebarCollapsed: false,
};

let counter = 0;
export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const at = (iso: string, hour: number, minute = 0) => {
  const d = parseIso(iso);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
};

/** Sample workspace relative to today, so overdue, due-today and history data always look current. */
export function seedData(): AppData {
  const t = todayIso();
  const d = (n: number) => addDays(t, n);
  const open: [string, Priority, string, number | null, number, string?][] = [
    ["Send Q4 budget draft to Priya", "high", "Finance", -2, -6, "Include the revised contractor line items."],
    ["Book dentist appointment", "low", "Health", -1, -9],
    ["Finalize onboarding flow copy", "high", "Work", 0, -4, "Last pass on empty states and error messages."],
    ["Review pull request for calendar sync", "medium", "Work", 0, -2],
    ["Call Grandma about Sunday lunch", "low", "Personal", 0, -1],
    ["Prepare sprint retrospective notes", "medium", "Work", 1, -3],
    ["Renew car insurance", "high", "Finance", 2, -8, "Compare the two quotes from last week before renewing."],
    ["Finish chapter 6 of Designing Data-Intensive Applications", "medium", "Learning", 3, -5],
    ["Replace hallway light bulbs", "low", "Home", 4, -2],
    ["Draft Q1 OKRs for the design team", "high", "Work", 6, -1],
    ["Plan weekend hike route", "low", "Personal", 9, 0],
    ["Schedule annual physical", "medium", "Health", 12, -3],
    ["Organize tax documents", "medium", "Finance", null, -10],
  ];
  const done: [string, Priority, string, number, number][] = [
    ["Submit expense report for the Berlin trip", "medium", "Finance", 0, -6],
    ["Water the plants", "low", "Home", 0, -2],
    ["Update portfolio case study", "high", "Work", -1, -7],
    ["30-minute strength session", "medium", "Health", -1, -1],
    ["Reply to Sam about the offsite venue", "low", "Work", -2, -3],
    ["Ship analytics empty states", "high", "Work", -3, -8],
    ["Grocery run for the week", "low", "Home", -3, -4],
    ["Read the Figma variables guide", "medium", "Learning", -4, -6],
    ["Pay electricity bill", "high", "Finance", -5, -9],
    ["Write the weekly status update", "medium", "Work", -6, -7],
    ["Clean out the garage shelves", "low", "Home", -8, -12],
    ["Pair with Leo on the chart component", "medium", "Work", -9, -11],
    ["Run 5k in the park", "medium", "Health", -10, -10],
    ["Cancel unused streaming subscription", "low", "Finance", -12, -14],
    ["Finish TypeScript generics course module", "medium", "Learning", -13, -16],
    ["Present design review to stakeholders", "high", "Work", -15, -20],
    ["Fix the leaking kitchen tap", "medium", "Home", -17, -19],
    ["Send birthday card to Aunt Rosa", "low", "Personal", -18, -22],
    ["Migrate notes into the new workspace", "medium", "Work", -20, -24],
    ["Book flights for the December trip", "high", "Personal", -23, -27],
    ["Review vendor contract renewal", "high", "Work", -26, -30],
    ["Set up automatic savings transfer", "medium", "Finance", -29, -33],
  ];
  const tasks: Task[] = [
    ...open.map(([title, priority, category, due, created, notes], i) => ({
      id: `t-open-${i}`, title, notes: notes || "", priority, category, due: due === null ? null : d(due),
      completed: false, completedAt: null, createdAt: at(d(created), 9 + (i % 8), (i * 7) % 60),
    })),
    ...done.map(([title, priority, category, doneDay, created], i) => ({
      id: `t-done-${i}`, title, notes: "", priority, category, due: d(doneDay),
      completed: true, completedAt: at(d(doneDay), 10 + (i % 7), (i * 11) % 60), createdAt: at(d(created), 8 + (i % 6)),
    })),
  ];

  // Each habit's pattern repeats over the last 42 days; "1" = done. The final characters cover yesterday, so streaks are real.
  const habit = (id: string, name: string, pattern: string, created: number, today: boolean): Habit => {
    const doneDays: string[] = [];
    for (let i = 42; i >= 1; i--) if (pattern[(42 - i) % pattern.length] === "1") doneDays.push(d(-i));
    if (today) doneDays.push(t);
    return { id, name, done: doneDays, createdAt: at(d(created), 8) };
  };
  const habits: Habit[] = [
    habit("h-read", "Read 20 minutes", "1110111", -60, true),
    habit("h-exercise", "Exercise", "1011010", -60, false),
    habit("h-water", "Drink enough water", "1111111", -60, true),
    habit("h-code", "Practice coding", "1101101", -45, false),
    habit("h-sleep", "Sleep on time", "0111011", -42, false),
  ];

  const labels = ["Onboarding copy", "Pull request reviews", "Reading", "Sprint planning", "Portfolio", "Deep work"];
  const sessions: FocusSession[] = [];
  for (let i = 27; i >= 0; i--) {
    const count = i === 0 ? 2 : [3, 2, 4, 1, 3, 0, 2][i % 7];
    for (let s = 0; s < count; s++)
      sessions.push({ id: `s-${i}-${s}`, mode: "focus", minutes: 25, label: labels[(i + s) % labels.length], completedAt: at(d(-i), 9 + s * 2, 25) });
  }

  const notes: Note[] = [
    { id: "n-1", title: "Q1 planning themes", category: "Work", pinned: true, createdAt: at(d(-6), 10), updatedAt: at(d(0), 8, 40),
      body: "Reduce onboarding drop-off on step 3.\nShip calendar sync to all workspaces.\nHire a second product designer by March." },
    { id: "n-2", title: "Book list for winter", category: "Reading", pinned: true, createdAt: at(d(-20), 21), updatedAt: at(d(-2), 22, 5),
      body: "Four Thousand Weeks by Oliver Burkeman\nThe Design of Everyday Things\nTomorrow, and Tomorrow, and Tomorrow" },
    { id: "n-3", title: "Retro talking points", category: "Work", pinned: false, createdAt: at(d(-3), 15), updatedAt: at(d(-1), 16, 20),
      body: "What went well: fewer late tickets, design reviews on time.\nTo improve: QA handoff, flaky e2e tests." },
    { id: "n-4", title: "Side project ideas", category: "Ideas", pinned: false, createdAt: at(d(-14), 20), updatedAt: at(d(-4), 19, 45),
      body: "Recipe scaler that converts units.\nA habit tracker for plants.\nPersonal finance dashboard from bank CSV exports." },
    { id: "n-5", title: "TypeScript generics cheatsheet", category: "Learning", pinned: false, createdAt: at(d(-13), 18), updatedAt: at(d(-8), 18, 30),
      body: "Constrain with extends.\nUse keyof for property names.\nInfer return types with ReturnType<typeof fn>." },
    { id: "n-6", title: "Weekend in Lisbon", category: "Personal", pinned: false, createdAt: at(d(-25), 12), updatedAt: at(d(-11), 13, 10),
      body: "Flights booked for Friday evening.\nTram 28 early before the crowds.\nDinner reservation at 8pm on Saturday." },
  ];

  return { version: 1, tasks, habits, sessions, notes, settings: { ...DEFAULT_SETTINGS } };
}
