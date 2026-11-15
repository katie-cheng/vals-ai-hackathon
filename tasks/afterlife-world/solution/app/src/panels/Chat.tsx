import { useEffect, useRef, useState, type FormEvent } from "react";
import { api } from "../server/api";
import { useStore } from "../client/store";
import { clock } from "../components/Panel";

/** World chat: everyone in the world sees it. */
export function Chat({ compact = false, onOpenMessages }: { compact?: boolean; onOpenMessages?: () => void }) {
  const token = useStore((s) => s.token)!;
  const world = useStore((s) => s.world);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const log = useRef<HTMLOListElement>(null);
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [world.length]);
  const send = async (e: FormEvent) => {
    e.preventDefault();
    const r = await api.say(token, "world", text);
    if (r.ok) setText(""), setError("");
    else setError(r.error);
  };
  const shown = compact ? world.slice(-8) : world;
  return (
    <section className={compact ? "chat chat-compact" : "chat"} aria-label="World chat">
      <ol ref={log} className="chat-log" aria-live="polite">
        {shown.length === 0 && <li className="muted">No one has said anything yet. Say hello.</li>}
        {shown.map((m) => (
          <li key={m.id}>
            <span className="chat-who">{m.fromName}</span> {m.text}
            <time className="chat-time" dateTime={new Date(m.at).toISOString()}>{clock(m.at)}</time>
          </li>
        ))}
      </ol>
      <form onSubmit={send} className="chat-form">
        <label className="sr-only" htmlFor={compact ? "chat-compact" : "chat-full"}>Message to everyone in the world</label>
        <input
          id={compact ? "chat-compact" : "chat-full"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Say something to everyone"
          maxLength={280}
          autoComplete="off"
          onKeyDown={(e) => e.key === "Escape" && (e.currentTarget as HTMLInputElement).blur()}
        />
        <button type="submit" className="btn btn-small">Send</button>
      </form>
      {error && <p className="feedback error" role="alert">{error}</p>}
      {compact && onOpenMessages && <button type="button" className="text-btn" onClick={onOpenMessages}>Direct messages</button>}
    </section>
  );
}
