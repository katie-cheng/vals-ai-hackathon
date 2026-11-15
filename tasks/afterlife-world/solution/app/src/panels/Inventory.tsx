import { useState } from "react";
import { api } from "../server/api";
import { DEFAULT_CLOAK, ITEMS, itemById } from "../server/catalog";
import { useStore } from "../client/store";
import { Panel, useAction } from "../components/Panel";

export function InventoryPanel({ onClose, visited, total }: { onClose: () => void; visited: number; total: number }) {
  const a = useStore((s) => s.account)!;
  const token = useStore((s) => s.token)!;
  const { busy, run, Feedback } = useAction();
  const [selling, setSelling] = useState<string | null>(null);
  const [price, setPrice] = useState(30);
  const owned = Object.entries(a.inventory).filter(([, n]) => n > 0);
  return (
    <Panel title="Inventory" onClose={onClose}>
      <dl className="facts">
        <div><dt>Balance</dt><dd>{a.balance} lumens</dd></div>
        <div><dt>Lights gathered</dt><dd>{a.gathered}</dd></div>
        <div><dt>Places visited</dt><dd>{visited} of {total}</dd></div>
        <div><dt>Homes</dt><dd>{a.homes.length}</dd></div>
      </dl>
      <p className="muted">Gather the floating lights around the island for 5 lumens each. Each one comes back three minutes after you take it.</p>
      <Feedback />
      <h3>Your things</h3>
      {owned.length === 0 ? (
        <p className="empty">Nothing yet. The stalls on Market Row sell cloaks and things for your home.</p>
      ) : (
        <ul className="rows">
          {owned.map(([id, n]) => {
            const item = itemById(id)!;
            const worn = item.kind === "cloak" && a.cloak === item.color;
            return (
              <li key={id} className="row">
                <div className="row-main">
                  {item.color && <span className="swatch" style={{ background: item.color }} aria-hidden />}
                  <div>
                    <strong>{item.name}</strong>
                    <span className="muted">{n > 1 ? `${n} owned` : item.about}</span>
                  </div>
                </div>
                <div className="row-actions">
                  {item.kind === "cloak" && (
                    <button type="button" className="btn btn-small" disabled={busy} onClick={() => run(api.wear(token, worn ? null : id), worn ? "Back in your plain cloak." : `Wearing the ${item.name.toLowerCase()}.`)}>
                      {worn ? "Take off" : "Wear"}
                    </button>
                  )}
                  <button type="button" className="btn btn-small btn-quiet" onClick={() => setSelling(selling === id ? null : id)}>Sell</button>
                </div>
                {selling === id && (
                  <form
                    className="inline-form"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const r = await run(api.list(token, id, price), `${item.name} listed for ${price} lumens.`);
                      if (r.ok) setSelling(null);
                    }}
                  >
                    <label className="field field-inline">
                      <span>Price in lumens</span>
                      <input type="number" min={1} max={5000} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
                    </label>
                    <button type="submit" className="btn btn-small" disabled={busy}>List on the market</button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {a.cloak !== DEFAULT_CLOAK && !ITEMS.some((i) => i.color === a.cloak && a.inventory[i.id]) && <p className="muted">You are wearing a cloak you no longer own.</p>}
    </Panel>
  );
}
