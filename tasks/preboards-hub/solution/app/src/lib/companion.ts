import { QUOTES } from "./quotes";
import { plural, split } from "./time";
import type { Exam, Goal, Subject } from "./types";

export type Context = { exam: Exam; now: number; subjects: Subject[]; goals: Goal[]; focusToday: number };

const TIPS = [
  "Try active recall: close your notes and write down everything you remember about one topic, then check what you missed.",
  "Space your revision. A topic reviewed today, in three days and again next week sticks far better than one long cram.",
  "Do one timed past paper this week. Mark it honestly and turn every lost mark into a single line in your revision notes.",
  "Explain a hard idea out loud as if teaching a friend. The step where you hesitate is the step to revise.",
  "Mix topics in one session. Switching between, say, algebra and mechanics feels harder but builds stronger recall.",
  "Protect your sleep. Memory consolidates overnight, so a full night before the exam beats two extra hours of notes.",
];

let tipIndex = 0;
export const nextTip = () => TIPS[tipIndex++ % TIPS.length];

export function countdownStatus({ exam, now }: Context) {
  const ms = new Date(exam.target).getTime() - now;
  if (ms <= 0) return `${exam.name} has started. Good luck, you have prepared for this.`;
  const { days, hours, minutes } = split(ms);
  if (days === 0) return `${exam.name} starts in ${plural(hours, "hour")} and ${plural(minutes, "minute")}. Review your summary notes and rest well.`;
  return `${plural(days, "day")}, ${plural(hours, "hour")} and ${plural(minutes, "minute")} until ${exam.name}. That is ${plural(Math.max(1, Math.floor(days / 7)), "week")} of steady work if you start today.`;
}

export function dailySummary(ctx: Context) {
  const { subjects, goals, focusToday } = ctx;
  const done = goals.filter((g) => g.done).length;
  const mastered = subjects.filter((s) => s.status === "Mastered").length;
  const revise = subjects.filter((s) => s.status === "Revise").map((s) => s.name);
  const parts = [
    goals.length ? `You have finished ${done} of ${plural(goals.length, "goal")} today.` : "You have not set any goals for today yet.",
    `${mastered} of ${plural(subjects.length, "subject")} ${mastered === 1 ? "is" : "are"} mastered.`,
    revise.length ? `Marked for revision: ${revise.join(", ")}.` : "",
    `You completed ${plural(focusToday, "focus session")} today.`,
  ];
  return parts.filter(Boolean).join(" ");
}

export function motivation() {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  return `${q.text} That was ${q.author}. One focused session now is worth more than a perfect plan for later.`;
}

/** Answers a typed question from the hub's own data. */
export function answer(question: string, ctx: Context) {
  const q = question.toLowerCase();
  if (/(how (long|many days)|countdown|days? left|until|when is|time left)/.test(q)) return countdownStatus(ctx);
  if (/(summary|today|progress|how am i|status)/.test(q)) return dailySummary(ctx);
  if (/(subject|revise|weak|what should i (study|revise)|next)/.test(q)) {
    const order = ["Revise", "Not Started", "In Progress"] as const;
    for (const status of order) {
      const s = ctx.subjects.find((x) => x.status === status);
      if (s) return `Start with ${s.name}. It is marked ${status}. Give it two focus sessions before moving on.`;
    }
    return ctx.subjects.length ? "Every subject is mastered. Spend today on mixed past papers to keep it that way." : "Add your exam subjects first and I will suggest where to begin.";
  }
  if (/(pomodoro|focus|break|timer|concentrat)/.test(q)) return "Work for 25 minutes with your phone out of reach, then take a real 5 minute break away from the screen. After four rounds, rest for longer.";
  if (/(motivat|tired|stress|anxious|nervous|give up|can't)/.test(q)) return motivation();
  if (/(tip|how (do|should) i study|technique|method)/.test(q)) return nextTip();
  return `I can tell you the countdown, summarise your day, suggest a subject or share a study tip. Here is a tip for now. ${nextTip()}`;
}
