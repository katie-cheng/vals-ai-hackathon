import { useEffect, useState } from "react";
import { api } from "../server/api";
import { KINDS, type Kind, type Prefs } from "../server/types";
import { askPermission, notificationsSupported, permission, type Permission } from "../client/browserNotify";
import { unreadCount, useStore } from "../client/store";
import { Panel, timeAgo, useAction } from "../components/Panel";

const kindLabel = (k: Kind) => KINDS.find((x) => x.id === k)!.label;

const PERMISSION_TEXT: Record<Permission, string> = {
  granted: "Allowed. Notifications appear on this device while any AFTERLIFE tab is open in the background.",
  denied: "Blocked in your browser settings. Allow notifications for this site there to turn them on.",
  default: "Off. Your browser will ask for permission when you turn them on.",
  unsupported: "This browser does not support web notifications. You will still see them in the world.",
};

export function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"history" | "preferences">("history");
  return (
    <Panel title="Notifications" onClose={onClose}>
      <div className="tabs" role="tablist" aria-label="Notifications">
        <button type="button" role="tab" aria-selected={tab === "history"} onClick={() => setTab("history")}>History</button>
        <button type="button" role="tab" aria-selected={tab === "preferences"} onClick={() => setTab("preferences")}>Preferences</button>
      </div>
      {tab === "history" ? <History /> : <Preferences />}
    </Panel>
  );
}

function History() {
  const token = useStore((s) => s.token)!;
  const notes = useStore((s) => s.notes);
  const unread = useStore(unreadCount);
  const { run } = useAction();
  return (
    <>
      <div className="split">
        <p>{unread === 0 ? "No unread notifications" : `${unread} unread`}</p>
        <button type="button" className="text-btn" disabled={unread === 0} onClick={() => run(api.markRead(token, "all"))}>Mark all as read</button>
      </div>
      {notes.length === 0 ? (
        <p className="empty">Nothing yet. Friend requests, messages, invitations, event reminders, receipts, market sales and account alerts collect here.</p>
      ) : (
        <ul className="notes">
          {notes.map((n) => (
            <li key={n.id} className={n.read ? "note" : "note unread"}>
              <button type="button" onClick={() => !n.read && run(api.markRead(token, [n.id]))} aria-label={`${n.title}${n.read ? "" : ", unread"}`}>
                <span className="note-kind">{kindLabel(n.kind)}, {timeAgo(n.at)}</span>
                <strong>{n.title}</strong>
                <span>{n.body}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Preferences() {
  const a = useStore((s) => s.account)!;
  const token = useStore((s) => s.token)!;
  const { busy, run, Feedback } = useAction();
  const [perm, setPerm] = useState<Permission>(permission);
  const [explain, setExplain] = useState(false);
  const muted = Date.now() < a.muteUntil;
  useEffect(() => {
    const t = setInterval(() => setPerm(permission()), 2000);
    return () => clearInterval(t);
  }, []);
  const setPref = (kind: Kind, key: "inWorld" | "browser", value: boolean) => {
    const prefs: Prefs = { ...a.prefs, [kind]: { ...a.prefs[kind], [key]: value } };
    void run(api.setPrefs(token, prefs), "Preferences saved.");
  };
  const muteFor = (hours: number | null) =>
    run(api.mute(token, hours === null ? 0 : hours === Infinity ? 8.64e15 : Date.now() + hours * 3_600_000), hours === null ? "Notifications are on again." : "Notifications muted.");
  return (
    <>
      <Feedback />
      <section className="block" aria-labelledby="mute-title">
        <h3 id="mute-title">Mute</h3>
        <p className="muted">
          {muted
            ? a.muteUntil > 8e15 ? "Muted until you turn notifications back on. They still collect in your history." : `Muted until ${new Date(a.muteUntil).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. They still collect in your history.`
            : "Muting stops pop-ups and browser notifications. Everything still collects in your history."}
        </p>
        <div className="button-row">
          {muted ? (
            <button type="button" className="btn btn-small" disabled={busy} onClick={() => muteFor(null)}>Unmute</button>
          ) : (
            <>
              <button type="button" className="btn btn-small" disabled={busy} onClick={() => muteFor(1)}>Mute for 1 hour</button>
              <button type="button" className="btn btn-small" disabled={busy} onClick={() => muteFor(8)}>Mute for 8 hours</button>
              <button type="button" className="btn btn-small btn-quiet" disabled={busy} onClick={() => muteFor(Infinity)}>Mute until I turn it back on</button>
            </>
          )}
        </div>
      </section>

      <section className="block" aria-labelledby="browser-title">
        <h3 id="browser-title">Browser notifications</h3>
        <p className="muted">{PERMISSION_TEXT[perm]}</p>
        {perm === "default" && notificationsSupported() && (
          explain ? (
            <div className="consent">
              <p>AFTERLIFE will show a notification on this device for the kinds you tick under "Browser" below, and only while one of its tabs is open. You can turn this off at any time in your browser settings.</p>
              <div className="button-row">
                <button type="button" className="btn btn-small btn-primary" onClick={async () => setPerm(await askPermission())}>Continue to browser permission</button>
                <button type="button" className="btn btn-small btn-quiet" onClick={() => setExplain(false)}>Not now</button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn btn-small" onClick={() => setExplain(true)}>Turn on browser notifications</button>
          )
        )}
        <p className="muted">
          <strong>When AFTERLIFE is closed:</strong> not available yet. Delivery to a closed browser needs the hosted push server with its VAPID keys, which this
          build does not have, so nothing is sent while the site is closed. The service worker is installed and ready to show pushes once that server is connected.
        </p>
      </section>

      <section className="block" aria-labelledby="kinds-title">
        <h3 id="kinds-title">What to notify you about</h3>
        <table className="table prefs">
          <thead>
            <tr><th scope="col">Kind</th><th scope="col">In the world</th><th scope="col">Browser</th></tr>
          </thead>
          <tbody>
            {KINDS.map((k) => (
              <tr key={k.id}>
                <th scope="row">
                  {k.label}
                  <span className="muted">{k.about}</span>
                </th>
                <td><input type="checkbox" aria-label={`${k.label} in the world`} checked={a.prefs[k.id].inWorld} onChange={(e) => setPref(k.id, "inWorld", e.target.checked)} /></td>
                <td><input type="checkbox" aria-label={`${k.label} as browser notifications`} checked={a.prefs[k.id].browser} onChange={(e) => setPref(k.id, "browser", e.target.checked)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
