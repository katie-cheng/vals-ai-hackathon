import { useEffect, useState } from "react";
import { api } from "../server/api";
import { ITEMS, itemById } from "../server/catalog";
import { refreshMarket, useStore } from "../client/store";
import { Panel, timeAgo, useAction } from "../components/Panel";

export function MarketPanel({ onClose }: { onClose: () => void }) {
  const a = useStore((s) => s.account)!;
  const token = useStore((s) => s.token)!;
  const listings = useStore((s) => s.listings);
  const purchases = useStore((s) => s.purchases);
  const [tab, setTab] = useState<"stalls" | "players" | "history">("stalls");
  const { busy, run, Feedback } = useAction();
  useEffect(() => void refreshMarket(), []);
  return (
    <Panel title="Market" onClose={onClose}>
      <div className="tabs" role="tablist" aria-label="Market">
        <button type="button" role="tab" aria-selected={tab === "stalls"} onClick={() => setTab("stalls")}>Stalls</button>
        <button type="button" role="tab" aria-selected={tab === "players"} onClick={() => setTab("players")}>From players ({listings.length})</button>
        <button type="button" role="tab" aria-selected={tab === "history"} onClick={() => setTab("history")}>Purchases</button>
      </div>
      <p className="muted">You have {a.balance} lumens.</p>
      <Feedback />
      {tab === "stalls" && (
        <ul className="rows">
          {ITEMS.map((item) => {
            const owned = item.kind === "cloak" && !!a.inventory[item.id];
            return (
              <li key={item.id} className="row">
                <div className="row-main">
                  {item.color && <span className="swatch" style={{ background: item.color }} aria-hidden />}
                  <div>
                    <strong>{item.name}</strong>
                    <span className="muted">{item.about}</span>
                  </div>
                </div>
                <div className="row-actions">
                  <span className="price">{item.price} lumens</span>
                  <button
                    type="button"
                    className="btn btn-small"
                    disabled={busy || owned || a.balance < item.price}
                    onClick={() => run(api.buy(token, item.id), `Bought the ${item.name.toLowerCase()}. It is in your inventory.`)}
                  >
                    {owned ? "Owned" : `Buy ${item.name.toLowerCase()}`}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {tab === "players" && (
        listings.length === 0 ? (
          <p className="empty">No player listings right now. Sell something from your inventory and it appears here for everyone.</p>
        ) : (
          <ul className="rows">
            {listings.map((l) => {
              const item = itemById(l.itemId)!;
              const mine = l.sellerId === a.id;
              return (
                <li key={l.id} className="row">
                  <div className="row-main">
                    <div>
                      <strong>{item.name}</strong>
                      <span className="muted">{mine ? "Your listing" : `Sold by ${l.sellerName}`}, {timeAgo(l.at)}</span>
                    </div>
                  </div>
                  <div className="row-actions">
                    <span className="price">{l.price} lumens</span>
                    {mine ? (
                      <button type="button" className="btn btn-small btn-quiet" disabled={busy} onClick={() => run(api.unlist(token, l.id), "Listing withdrawn. The item is back in your inventory.")}>Withdraw</button>
                    ) : (
                      <button type="button" className="btn btn-small" disabled={busy} onClick={() => run(api.buyListing(token, l.id), `Bought the ${item.name.toLowerCase()} from ${l.sellerName}.`)}>Buy from {l.sellerName}</button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )
      )}
      {tab === "history" && (
        purchases.length === 0 ? (
          <p className="empty">You haven't bought anything yet.</p>
        ) : (
          <table className="table">
            <thead><tr><th>Item</th><th>From</th><th>Lumens</th><th>When</th></tr></thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id}><td>{p.what}</td><td>{p.from}</td><td>{p.price}</td><td>{timeAgo(p.at)}</td></tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </Panel>
  );
}
