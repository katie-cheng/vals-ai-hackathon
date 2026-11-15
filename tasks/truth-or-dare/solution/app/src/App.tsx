import { useCallback, useState } from "react";
import * as server from "./server";
import type { Room, Session } from "./server";
import { useOnline, useRoom } from "./hooks";
import Lobby from "./components/Lobby";
import Waiting from "./components/Waiting";
import Game from "./components/Game";

export type Run = (fn: () => Room | void) => boolean;

export default function App() {
  const [session, setSessionState] = useState<Session | null>(() => server.loadSession());
  const [room, setRoom] = useRoom(session);
  const [error, setError] = useState("");
  const online = useOnline();

  const setSession = useCallback((s: Session | null) => {
    server.saveSession(s);
    setSessionState(s);
    setError("");
  }, []);

  // Every move goes through the "server"; a refused move shows its reason instead of changing the screen.
  const run: Run = useCallback(
    (fn) => {
      if (!navigator.onLine) {
        setError("You're offline. Reconnect to make your move.");
        return false;
      }
      try {
        const r = fn();
        if (r) setRoom(r);
        setError("");
        return true;
      } catch (e) {
        setError((e as Error).message);
        return false;
      }
    },
    [setRoom],
  );

  const leave = () => {
    if (room) server.leaveRoom(room.id);
    setSession(null);
  };

  const me = room?.players.find((p) => p.id === session?.playerId);
  let screen;
  if (!session || !room || !me) screen = <Lobby onEnter={setSession} roomGone={!!session && !room} />;
  else if (room.players.length < 2) screen = <Waiting room={room} onLeave={leave} />;
  else screen = <Game room={room} me={me.id} run={run} error={error} onLeave={leave} />;

  return (
    <>
      {!online && (
        <p className="offline" role="status">
          You're offline. The game will catch up when the connection returns.
        </p>
      )}
      {screen}
    </>
  );
}
