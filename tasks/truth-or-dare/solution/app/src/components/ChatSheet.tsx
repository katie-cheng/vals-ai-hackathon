import { useEffect, useLayoutEffect, useRef } from "react";
import type { FormEvent } from "react";
import * as server from "../server";
import type { Room } from "../server";
import type { Run } from "../App";
import { useKeyboardInset } from "../hooks";

interface Props {
  room: Room;
  me: string;
  run: Run;
  open: boolean;
  onClose: () => void;
}

const time = (at: number) => new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function ChatSheet({ room, me, run, open, onClose }: Props) {
  const list = useRef<HTMLOListElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const keyboard = useKeyboardInset(open);
  const count = room.messages.length;

  useLayoutEffect(() => {
    const el = list.current;
    if (open && el) el.scrollTop = el.scrollHeight;
  }, [open, count, keyboard]);

  useEffect(() => {
    if (open) closeButton.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const send = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("message") as HTMLInputElement;
    if (input.value.trim() && run(() => server.sendMessage(room.id, me, input.value))) input.value = "";
    input.focus();
  };

  const nameOf = (id: string) => room.players.find((p) => p.id === id)?.name ?? "Left the room";

  return (
    <div className={`sheet-layer${open ? " is-open" : ""}`} inert={!open}>
      <div className="sheet-backdrop" onClick={onClose} />
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-title"
        style={keyboard ? { bottom: keyboard, height: `min(86dvh, ${window.visualViewport!.height - 8}px)` } : undefined}
      >
        <div className="sheet-head">
          <h2 id="chat-title">Chat</h2>
          <button className="btn btn-quiet btn-small" ref={closeButton} onClick={onClose}>
            Close
          </button>
        </div>
        <ol className="messages" ref={list} aria-live="polite">
          {count === 0 && <li className="messages-empty">No messages yet.</li>}
          {room.messages.map((m) => (
            <li key={m.id} className={m.from === me ? "msg msg-mine" : "msg"}>
              <span className="msg-meta">
                {m.from === me ? "You" : nameOf(m.from)}, {time(m.at)}
              </span>
              <span className="msg-text">{m.text}</span>
            </li>
          ))}
        </ol>
        <form className="composer" onSubmit={send}>
          <label htmlFor="message" className="visually-hidden">
            Message
          </label>
          <input id="message" name="message" autoComplete="off" enterKeyHint="send" maxLength={300} placeholder="Message" />
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
