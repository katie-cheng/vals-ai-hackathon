import { useCallback, useState } from "react";
import * as server from "../server";
import type { Room } from "../server";
import type { Run } from "../App";
import Logo from "./Logo";
import Bottle from "./Bottle";
import Seat from "./Seat";
import Stage from "./Stage";
import ChatSheet from "./ChatSheet";

interface Props {
  room: Room;
  me: string;
  run: Run;
  error: string;
  onLeave: () => void;
}

export default function Game({ room, me, run, error, onLeave }: Props) {
  const [chatOpen, setChatOpen] = useState(false);
  const [seen, setSeen] = useState(room.messages.length);
  const stage = server.stageOf(room);
  const spinning = room.stage === "spinning" && stage === "spinning";
  const revealed = spinning && !!room.spin && Date.now() >= room.spin.startedAt + room.spin.duration;
  const target = room.spin ? room.players[room.spin.target] : null;
  const onBoard = stage === "ready" || stage === "spinning";
  const unread = chatOpen ? 0 : room.messages.slice(seen).filter((m) => m.from !== me).length;

  const closeChat = useCallback(() => {
    setChatOpen(false);
    setSeen(room.messages.length);
    document.getElementById("chat-button")?.focus();
  }, [room.messages.length]);

  const status = stage === "ready" ? (room.round === 1 ? "Either player can spin." : `Round ${room.round}. Either player can spin.`) : revealed ? `The bottle points at ${target!.name}.` : "Spinning";

  return (
    <div className="game">
      <header className="game-top">
        <Logo />
        <dl className="game-meta">
          <div>
            <dt>Room</dt>
            <dd data-testid="room-id">{room.id}</dd>
          </div>
          <div>
            <dt>Round</dt>
            <dd data-testid="round">{room.round}</dd>
          </div>
        </dl>
      </header>

      <main className="game-main">
        {onBoard ? (
          <div className="board" key="board">
            <Seat player={room.players[0]} index={0} isMe={room.players[0].id === me} selected={revealed && room.spin!.target === 0} />
            <div className="board-center">
              <Bottle spin={room.spin} />
              <p className="board-status" role="status">
                {status}
              </p>
              <button className="btn btn-primary btn-spin" disabled={stage !== "ready"} onClick={() => run(() => server.spinBottle(room.id))}>
                Spin the bottle
              </button>
            </div>
            <Seat player={room.players[1]} index={1} isMe={room.players[1].id === me} selected={revealed && room.spin!.target === 1} />
          </div>
        ) : (
          <Stage room={room} me={me} run={run} stage={stage as "choosing" | "asking" | "answering"} key={stage} />
        )}
        {error && (
          <p className="error game-error" role="alert">
            {error}
          </p>
        )}
      </main>

      <footer className="game-bar">
        <button
          className="btn btn-secondary"
          id="chat-button"
          aria-haspopup="dialog"
          aria-expanded={chatOpen}
          onClick={() => {
            setChatOpen(true);
            setSeen(room.messages.length);
          }}
        >
          Chat{unread > 0 && <span className="unread">{unread} new</span>}
        </button>
        <button className="btn btn-quiet" onClick={() => confirm("Leave the room? The game ends for both players.") && onLeave()}>
          Leave
        </button>
      </footer>

      <ChatSheet room={room} me={me} run={run} open={chatOpen} onClose={closeChat} />
    </div>
  );
}
