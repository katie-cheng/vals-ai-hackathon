import { useState, type FormEvent } from "react";
import { api } from "../server/api";
import { useStore } from "../client/store";
import type { PeerState } from "../server/bus";
import { Panel, useAction } from "../components/Panel";

export function FriendsPanel({ onClose, others, onMessage }: { onClose: () => void; others: PeerState[]; onMessage: (friendId: string) => void }) {
  const a = useStore((s) => s.account)!;
  const token = useStore((s) => s.token)!;
  const profiles = useStore((s) => s.profiles);
  const { busy, run, Feedback } = useAction();
  const [username, setUsername] = useState("");
  const online = new Set(others.map((p) => p.accountId));
  const nearby = [...new Map(others.filter((p) => p.accountId !== a.id).map((p) => [p.accountId, p])).values()];
  const name = (id: string) => profiles[id]?.displayName ?? "A player";
  const add = async (e: FormEvent) => {
    e.preventDefault();
    const r = await run(api.request(token, username), (p) => `Request sent to ${p.displayName}.`);
    if (r.ok) setUsername("");
  };
  return (
    <Panel title="Friends" onClose={onClose}>
      <p className="muted">Your username is <strong>@{a.username}</strong>. Share it so friends can find you.</p>
      <form onSubmit={add} className="inline-form">
        <label className="field field-inline">
          <span>Add a friend by username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" required autoComplete="off" />
        </label>
        <button type="submit" className="btn btn-small" disabled={busy}>Send request</button>
      </form>
      <Feedback />
      {a.requestsIn.length > 0 && (
        <>
          <h3>Requests for you</h3>
          <ul className="rows">
            {a.requestsIn.map((id) => (
              <li key={id} className="row">
                <div className="row-main"><strong>{name(id)}</strong></div>
                <div className="row-actions">
                  <button type="button" className="btn btn-small" disabled={busy} onClick={() => run(api.answer(token, id, true), `You and ${name(id)} are now friends.`)}>Accept</button>
                  <button type="button" className="btn btn-small btn-quiet" disabled={busy} onClick={() => run(api.answer(token, id, false), "Request declined.")}>Decline</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      <h3>Friends</h3>
      {a.friends.length === 0 ? (
        <p className="empty">No friends yet. Add someone by username, or send a request to a player who is in the world right now.</p>
      ) : (
        <ul className="rows">
          {a.friends.map((id) => (
            <li key={id} className="row">
              <div className="row-main">
                <div>
                  <strong>{name(id)}</strong>
                  <span className="muted">{online.has(id) ? "In the world now" : "Away"}</span>
                </div>
              </div>
              <div className="row-actions">
                <button type="button" className="btn btn-small" onClick={() => onMessage(id)}>Message</button>
                <button type="button" className="btn btn-small btn-quiet" disabled={busy} onClick={() => run(api.unfriend(token, id), "Removed from friends.")}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {a.requestsOut.length > 0 && <p className="muted">Waiting for {a.requestsOut.map(name).join(", ")} to answer.</p>}
      <h3>In the world now</h3>
      {nearby.length === 0 ? (
        <p className="empty">No other players are here at the moment.</p>
      ) : (
        <ul className="rows">
          {nearby.map((p) => (
            <li key={p.accountId} className="row">
              <div className="row-main"><span className="swatch" style={{ background: p.cloak }} aria-hidden /><strong>{p.name}</strong></div>
              {!a.friends.includes(p.accountId) && !a.requestsOut.includes(p.accountId) && (
                <div className="row-actions">
                  <button type="button" className="btn btn-small" disabled={busy} onClick={async () => {
                    const prof = await api.profiles(token, [p.accountId]);
                    if (prof.ok && prof.data[0]) await run(api.request(token, prof.data[0].username), `Request sent to ${p.name}.`);
                  }}>Add {p.name}</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
