import { useState } from "react";
import type { FormEvent } from "react";
import * as server from "../server";
import type { Session } from "../server";
import Logo from "./Logo";
import Field from "./Field";

type Mode = "home" | "create" | "join";

export default function Lobby({ onEnter, roomGone }: { onEnter: (s: Session) => void; roomGone: boolean }) {
  const [mode, setMode] = useState<Mode>("home");
  const [error, setError] = useState(roomGone ? "That room has closed." : "");

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) || "");
    try {
      const { room, playerId } = mode === "create" ? server.createRoom(get("name"), get("passcode")) : server.joinRoom(get("room"), get("name"), get("passcode"));
      onEnter({ roomId: room.id, playerId });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const go = (m: Mode) => {
    setMode(m);
    setError("");
  };

  if (mode === "home")
    return (
      <main className="screen lobby" key="home">
        <Logo size="large" />
        <h1 className="lobby-title">Two phones, one bottle</h1>
        <p className="lead">
          One of you creates a room and shares its ID and passcode. The other joins on their own phone. Spin the bottle: whoever it points
          at picks truth or dare, and the other player writes the question.
        </p>
        <div className="actions">
          <button className="btn btn-primary" onClick={() => go("create")}>
            Create a room
          </button>
          <button className="btn btn-secondary" onClick={() => go("join")}>
            Join a room
          </button>
        </div>
      </main>
    );

  return (
    <main className="screen lobby" key={mode}>
      <Logo />
      <h1 className="form-title">{mode === "create" ? "Create a room" : "Join a room"}</h1>
      <form className="form" onSubmit={submit} noValidate={false}>
        {mode === "join" && (
          <Field label="Room ID" name="room" autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={4} required placeholder="e.g. KXPT" />
        )}
        <Field label="Your name" name="name" autoComplete="nickname" maxLength={20} required />
        <Field
          label="Passcode"
          name="passcode"
          type="password"
          autoComplete={mode === "create" ? "new-password" : "current-password"}
          minLength={4}
          required
          hint={mode === "create" ? "At least 4 characters. Share it with the other player." : undefined}
        />
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {mode === "create" ? "Create room" : "Join room"}
          </button>
          <button type="button" className="btn btn-quiet" onClick={() => go("home")}>
            Back
          </button>
        </div>
      </form>
    </main>
  );
}
