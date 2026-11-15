import { useEffect, useState, type FormEvent } from "react";
import { api } from "../server/api";
import { loadDirect, useStore } from "../client/store";
import { Panel, clock } from "../components/Panel";
import { Chat } from "./Chat";

export function MessagesPanel({ onClose }: { onClose: () => void }) {
  const a = useStore((s) => s.account)!;
  const token = useStore((s) => s.token)!;
  const profiles = useStore((s) => s.profiles);
  const direct = useStore((s) => s.direct);
  const [channel, setChannel] = useState<string>("world");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (channel !== "world") void loadDirect(channel);
  }, [channel]);
  const thread = direct.filter((m) => (m.from === a.id && m.to === channel) || (m.from === channel && m.to === a.id));
  const send = async (e: FormEvent) => {
    e.preventDefault();
    const r = await api.say(token, channel, text);
    if (r.ok) setText(""), setError("");
    else setError(r.error);
  };
  return (
    <Panel title="Messages" onClose={onClose}>
      <label className="field">
        <span>Conversation</span>
        <select value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option value="world">World chat</option>
          {a.friends.map((id) => <option key={id} value={id}>{profiles[id]?.displayName ?? "Friend"}</option>)}
        </select>
      </label>
      {a.friends.length === 0 && <p className="muted">Direct messages open up once you have friends.</p>}
      {channel === "world" ? (
        <Chat />
      ) : (
        <section className="chat" aria-label="Direct messages">
          <ol className="chat-log" aria-live="polite">
            {thread.length === 0 && <li className="muted">No messages yet.</li>}
            {thread.map((m) => (
              <li key={m.id}><span className="chat-who">{m.from === a.id ? "You" : m.fromName}</span> {m.text}<time className="chat-time">{clock(m.at)}</time></li>
            ))}
          </ol>
          <form onSubmit={send} className="chat-form">
            <label className="sr-only" htmlFor="dm">Message</label>
            <input id="dm" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message" maxLength={280} autoComplete="off" />
            <button type="submit" className="btn btn-small">Send</button>
          </form>
          {error && <p className="feedback error" role="alert">{error}</p>}
        </section>
      )}
    </Panel>
  );
}
