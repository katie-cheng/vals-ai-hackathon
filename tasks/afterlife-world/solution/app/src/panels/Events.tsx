import { api } from "../server/api";
import { EVENTS, nextStart } from "../server/catalog";
import { useStore } from "../client/store";
import { Panel, useAction } from "../components/Panel";

const when = (t: number) =>
  new Date(t).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });

export function EventsPanel({ onClose }: { onClose: () => void }) {
  const a = useStore((s) => s.account)!;
  const token = useStore((s) => s.token)!;
  const { busy, run, Feedback } = useAction();
  const upcoming = EVENTS.map((e) => ({ e, at: nextStart(e) })).sort((x, y) => x.at - y.at);
  return (
    <Panel title="Events" onClose={onClose}>
      <p className="muted">Ask for a reminder and you'll be notified ten minutes before the start.</p>
      <Feedback />
      <ul className="rows">
        {upcoming.map(({ e, at }) => {
          const on = a.reminders.some((r) => r.startsWith(`${e.id}@`));
          const live = at <= Date.now();
          return (
            <li key={e.id} className="row">
              <div className="row-main">
                <div>
                  <strong>{e.name}</strong>
                  <span className="muted">{live ? "Happening now" : when(at)}, {e.place}. {e.about}</span>
                </div>
              </div>
              {!live && (
                <div className="row-actions">
                  <button type="button" className="btn btn-small" aria-pressed={on} disabled={busy} onClick={() => run(api.remind(token, e.id, !on), on ? "Reminder removed." : `We'll remind you before ${e.name.toLowerCase()}.`)}>
                    {on ? "Reminder set" : "Remind me"}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
