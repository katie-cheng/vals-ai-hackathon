import { Mic, Send, Square } from "lucide-react";
import { useState, type FormEvent } from "react";
import { answer, countdownStatus, dailySummary, motivation, nextTip, type Context } from "../lib/companion";
import { speechSupported } from "../lib/speech";
import { Button, inputClass, muted } from "./ui";

type Props = {
  ctx: Context;
  speak: (text: string) => boolean;
  stop: () => void;
  speaking: boolean;
  voices: SpeechSynthesisVoice[];
  voice: string;
  setVoice: (v: string) => void;
};
type Exchange = { id: number; ask: string; reply: string };

const BARS = [0.55, 0.85, 1, 0.7, 0.9, 0.6, 0.8];

export default function Companion({ ctx, speak, stop, speaking, voices, voice, setVoice }: Props) {
  const [question, setQuestion] = useState("");
  const [log, setLog] = useState<Exchange[]>([]);
  const supported = speechSupported();

  const reply = (ask: string, text: string) => {
    setLog((l) => [{ id: Date.now(), ask, reply: text }, ...l].slice(0, 3));
    speak(text);
  };
  const actions: [string, () => string][] = [
    ["Motivate me", motivation],
    ["Daily summary", () => dailySummary(ctx)],
    ["Countdown status", () => countdownStatus(ctx)],
    ["Study tip", nextTip],
  ];
  const ask = (e: FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    reply(q, answer(q, ctx));
    setQuestion("");
  };

  return (
    <section aria-labelledby="companion-title" id="companion" className="glass rounded-2xl p-5 sm:p-6">
      <div className={`flex items-center gap-4 ${speaking ? "speaking" : ""}`}>
        <div className="orb relative grid size-16 shrink-0 place-items-center rounded-full bg-indigo-500/15 ring-1 ring-indigo-500/30" aria-hidden="true">
          <div className="flex h-9 items-center gap-[3px]">
            {BARS.map((h, i) => (
              <span key={i} className="wave-bar block w-1 rounded-sm bg-indigo-500 dark:bg-indigo-300" style={{ height: `${h * 36}px`, animationDelay: `${i * 110}ms` }} />
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <h2 id="companion-title" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            AI Voice Companion
          </h2>
          <p className={`text-sm ${muted}`} aria-live="polite">
            {!supported ? "Speech is not available in this browser, so replies appear as text." : speaking ? "Speaking" : "Ask anything about your study plan"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {actions.map(([label, make]) => (
          <Button key={label} onClick={() => reply(label, make())} className="justify-start">
            {label}
          </Button>
        ))}
      </div>

      <form onSubmit={ask} className="mt-3 flex gap-2">
        <label htmlFor="companion-ask" className="sr-only">
          Ask the companion
        </label>
        <input id="companion-ask" className={inputClass} placeholder="How many days are left?" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={140} />
        <Button type="submit" variant="primary" aria-label="Ask" className="px-3" disabled={!question.trim()}>
          <Send className="size-4" aria-hidden="true" />
        </Button>
      </form>

      <div className="mt-4 space-y-3" aria-live="polite">
        {log.length === 0 ? (
          <p className={`flex items-center gap-2 text-sm ${muted}`}>
            <Mic className="size-4 shrink-0" aria-hidden="true" />
            Replies are read aloud and shown here.
          </p>
        ) : (
          log.map((x) => (
            <div key={x.id} className="rounded-xl border border-slate-900/5 bg-white/50 p-3 text-sm dark:border-white/5 dark:bg-slate-950/30">
              <p className="font-semibold text-slate-900 dark:text-white">{x.ask}</p>
              <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">{x.reply}</p>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {voices.length > 1 && (
          <label className="flex min-w-0 flex-1 items-center gap-2 text-sm">
            <span className={muted}>Voice</span>
            <select className={`${inputClass} py-1.5`} value={voice} onChange={(e) => setVoice(e.target.value)}>
              <option value="">Browser default</option>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {speaking && (
          <Button variant="ghost" onClick={stop}>
            <Square className="size-4" aria-hidden="true" />
            Stop speaking
          </Button>
        )}
      </div>
    </section>
  );
}
