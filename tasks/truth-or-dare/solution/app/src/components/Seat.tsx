import type { Player } from "../server";

export default function Seat({ player, index, isMe, selected }: { player: Player; index: 0 | 1; isMe: boolean; selected: boolean }) {
  return (
    <section className={`seat seat-${index + 1}${selected ? " is-selected" : ""}`} aria-label={`Player ${index + 1}`} data-player={index + 1}>
      <span className="seat-token" aria-hidden="true">
        {player.name.slice(0, 1).toUpperCase()}
      </span>
      <span className="seat-name">{player.name}</span>
      <span className="seat-meta">
        Player {index + 1}
        {isMe ? ", you" : ""}
      </span>
      {selected && <span className="seat-picked">Picked</span>}
    </section>
  );
}
