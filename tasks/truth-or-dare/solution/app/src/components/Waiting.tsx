import { useState } from "react";
import type { Room } from "../server";
import Logo from "./Logo";

export default function Waiting({ room, onLeave }: { room: Room; onLeave: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Join my Truth or Dare room. Room ID: ${room.id}, passcode: ${room.passcode}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <main className="screen waiting">
      <Logo />
      <h1 className="form-title">Waiting for player 2</h1>
      <p className="lead">Ask the other player to open Truth or Dare on their phone, choose Join a room and enter these details.</p>
      <dl className="room-details">
        <div>
          <dt>Room ID</dt>
          <dd className="room-code">{room.id}</dd>
        </div>
        <div>
          <dt>Passcode</dt>
          <dd>{room.passcode}</dd>
        </div>
        <div>
          <dt>Player 1</dt>
          <dd>{room.players[0].name} (you)</dd>
        </div>
      </dl>
      <div className="form-actions">
        <button className="btn btn-secondary" onClick={copy}>
          {copied ? "Copied" : "Copy details"}
        </button>
        <button className="btn btn-quiet" onClick={onLeave}>
          Close room
        </button>
      </div>
    </main>
  );
}
