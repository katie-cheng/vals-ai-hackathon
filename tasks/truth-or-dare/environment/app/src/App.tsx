import { useEffect, useState } from "react";
import * as server from "./server";
import type { Room } from "./server";

// The first version of the game: it works between two tabs but has had no design or mobile work yet.

export default function App() {
  const [room, setRoom] = useState<Room | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [mode, setMode] = useState<"home" | "create" | "join">("home");
  const [error, setError] = useState("");
  const [, tick] = useState(0);

  useEffect(() => {
    if (!room) return;
    server.subscribe(room.id, (r) => setRoom(r));
    const t = setInterval(() => tick((n) => n + 1), 500);
    return () => clearInterval(t);
  }, [room?.id]);

  const run = (fn: () => { room: Room; playerId?: string } | Room) => {
    try {
      const r = fn();
      if ("playerId" in r && r.playerId) {
        setRoom(r.room);
        setMe(r.playerId);
      } else setRoom(r as Room);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (!room || !me) {
    return (
      <div>
        <h1>Truth or Dare</h1>
        <p>
          A Truth or Dare game for two players on two phones. One player creates a room with a passcode, the other joins it with the
          room ID and passcode. Spin the bottle: the player it points at chooses truth or dare, and the other player writes the question.
        </p>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {mode === "home" && (
          <p>
            <button onClick={() => setMode("create")}>Create room</button> <button onClick={() => setMode("join")}>Join room</button>
          </p>
        )}
        {mode !== "home" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const name = String(f.get("name") || ""), pass = String(f.get("passcode") || "");
              run(() => (mode === "create" ? server.createRoom(name, pass) : server.joinRoom(String(f.get("room") || ""), name, pass)));
            }}
          >
            {mode === "join" && (
              <p>
                <label>Room ID <input name="room" /></label>
              </p>
            )}
            <p>
              <label>Your name <input name="name" /></label>
            </p>
            <p>
              <label>Passcode <input name="passcode" type="password" /></label>
            </p>
            <button type="submit">{mode === "create" ? "Create room" : "Join room"}</button> <button type="button" onClick={() => setMode("home")}>Back</button>
          </form>
        )}
      </div>
    );
  }

  const stage = server.stageOf(room);
  const meIndex = room.players.findIndex((p) => p.id === me);
  const target = room.spin ? room.players[room.spin.target] : null;
  const angle = room.spin ? (stage === "spinning" ? room.spin.to : room.spin.to) : 0;
  const nameOf = (id: string) => room.players.find((p) => p.id === id)?.name ?? "?";

  return (
    <div>
      <h1>Truth or Dare</h1>
      <p>Room ID: {room.id} | Passcode: {room.passcode} | Round {room.round}</p>
      {stage === "waiting" ? (
        <p>Waiting for player 2 to join. Give them the room ID and passcode.</p>
      ) : (
        <>
          <p>Player 1: {room.players[0].name} {meIndex === 0 && "(you)"}</p>
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: `rotate(${angle}deg)`, transition: stage === "spinning" ? "transform 3s linear" : "none" }}>
            <rect x="50" y="10" width="20" height="30" fill="green" />
            <rect x="40" y="40" width="40" height="70" fill="green" />
          </svg>
          <p>Player 2: {room.players[1].name} {meIndex === 1 && "(you)"}</p>
          <button disabled={stage !== "ready"} onClick={() => run(() => server.spinBottle(room.id))}>Spin the bottle</button>
          {target && stage !== "ready" && stage !== "spinning" && <p>The bottle picked {target.name}.</p>}
          {stage === "choosing" && target?.id === me && (
            <p>
              Truth or dare? <button onClick={() => run(() => server.choose(room.id, me, "truth"))}>Truth</button>{" "}
              <button onClick={() => run(() => server.choose(room.id, me, "dare"))}>Dare</button>
            </p>
          )}
          {stage === "asking" && target?.id !== me && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                run(() => server.ask(room.id, me, String(new FormData(e.currentTarget).get("question") || "")));
              }}
            >
              <label>Write a {room.choice} for {target?.name} <input name="question" /></label> <button type="submit">Send</button>
            </form>
          )}
          {stage === "asking" && target?.id === me && <p>{room.choice === "truth" ? "Truth" : "Dare"}. Waiting for the question.</p>}
          {stage === "answering" && (
            <p>
              {room.choice === "truth" ? "Truth" : "Dare"} for {target?.name}: {room.question}{" "}
              {target?.id === me && <button onClick={() => run(() => server.finishRound(room.id))}>Done</button>}
            </p>
          )}
        </>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h2>Chat</h2>
      <ul>
        {room.messages.map((m) => (
          <li key={m.id}>
            {nameOf(m.from)}: {m.text}
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem("message") as HTMLInputElement;
          run(() => server.sendMessage(room.id, me, input.value));
          input.value = "";
        }}
      >
        <input name="message" placeholder="Message" /> <button type="submit">Send</button>
      </form>
      <p>
        <button onClick={() => (server.leaveRoom(room.id), setRoom(null), setMe(null), setMode("home"))}>Leave room</button>
      </p>
    </div>
  );
}
