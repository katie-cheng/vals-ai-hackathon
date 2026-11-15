import { useState } from "react";
import { api } from "../server/api";
import { FIRST_PLOT_PRICE, PLOTS, PLOT_PRICE } from "../server/catalog";
import { useStore } from "../client/store";
import { Panel, useAction } from "../components/Panel";

export function HomesPanel({ onClose, onGo }: { onClose: () => void; onGo: (x: number, z: number) => void }) {
  const a = useStore((s) => s.account)!;
  const token = useStore((s) => s.token)!;
  const plots = useStore((s) => s.plots);
  const profiles = useStore((s) => s.profiles);
  const { busy, run, Feedback } = useAction();
  const [inviteTo, setInviteTo] = useState("");
  const price = a.homes.length ? PLOT_PRICE : FIRST_PLOT_PRICE;
  const go = async (plotId: string) => {
    const r = await run(api.move(token, { x: 0, z: 0, ry: 0 }, plotId));
    if (r.ok) onGo(r.data.position.x, r.data.position.z);
  };
  return (
    <Panel title="Homes" onClose={onClose}>
      <p className="muted">
        {a.homes.length === 0 ? "Your first plot is free." : `Another plot costs ${PLOT_PRICE} lumens. You can own two.`} Claimed plots get a house in the owner's colours.
      </p>
      <Feedback />
      <ul className="rows">
        {PLOTS.map((p) => {
          const owner = plots[p.id];
          const mine = a.homes.includes(p.id);
          return (
            <li key={p.id} className="row">
              <div className="row-main">
                <div>
                  <strong>{p.name}</strong>
                  <span className="muted">{mine ? "Your home" : owner ? `${owner.displayName}'s home` : "Free to claim"}</span>
                </div>
              </div>
              <div className="row-actions">
                {!owner && (
                  <button type="button" className="btn btn-small" disabled={busy || a.homes.length >= 2} onClick={() => run(api.claim(token, p.id), `${p.name} is yours.`)}>
                    Claim{price ? ` for ${price}` : ""}
                  </button>
                )}
                <button type="button" className="btn btn-small btn-quiet" disabled={busy} onClick={() => go(p.id)}>Go there</button>
              </div>
            </li>
          );
        })}
      </ul>
      {a.homes.length > 0 && (
        <>
          <h3>Invite a friend over</h3>
          {a.friends.length === 0 ? (
            <p className="empty">Add friends first, then invite them to your home.</p>
          ) : (
            <form className="inline-form" onSubmit={(e) => (e.preventDefault(), run(api.invite(token, inviteTo, a.homes[0]), "Invitation sent."))}>
              <label className="field field-inline">
                <span>Friend</span>
                <select value={inviteTo} onChange={(e) => setInviteTo(e.target.value)} required>
                  <option value="">Choose a friend</option>
                  {a.friends.map((id) => <option key={id} value={id}>{profiles[id]?.displayName ?? "Friend"}</option>)}
                </select>
              </label>
              <button type="submit" className="btn btn-small" disabled={busy}>Send invitation</button>
            </form>
          )}
        </>
      )}
    </Panel>
  );
}
