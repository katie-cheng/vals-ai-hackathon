import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../server/api";
import { QUALITY_LABEL, type ControlScheme, type Device, type Quality } from "../client/device";
import { useSettings } from "../client/settings";
import { bus } from "../server/bus";
import { signOut, useStore } from "../client/store";
import { Panel, useAction } from "../components/Panel";

interface Props {
  onClose: () => void;
  device: Device;
  controls: ControlScheme;
  stats: { fps: number; quality: Quality };
  qualityLabel: string;
}

export function SettingsPanel({ onClose, device, controls, stats, qualityLabel }: Props) {
  const [settings, update] = useSettings();
  const a = useStore((s) => s.account)!;
  const token = useStore((s) => s.token)!;
  const peers = useStore((s) => s.peers);
  const navigate = useNavigate();
  const { busy, run, Feedback } = useAction();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const tabs = Object.values(peers).length + 1;
  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    const r = await run(api.changePassword(token, current, next), "Password changed. Other sessions were signed out.");
    if (r.ok) setCurrent(""), setNext("");
  };
  return (
    <Panel title="Settings" onClose={onClose}>
      <section className="block" aria-labelledby="gfx-title">
        <h3 id="gfx-title">Graphics</h3>
        <p className="muted">
          Running at {qualityLabel}{stats.fps ? `, ${stats.fps} frames a second` : ""}. Automatic picked {QUALITY_LABEL[device.quality]} for {device.reason}, and steps down if the frame rate drops.
        </p>
        <div className="segmented" role="radiogroup" aria-label="Graphics quality">
          {(["auto", "low", "medium", "high"] as const).map((q) => (
            <label key={q}>
              <input type="radio" name="quality" checked={settings.quality === q} onChange={() => update({ quality: q })} />
              <span>{q === "auto" ? "Automatic" : QUALITY_LABEL[q]}</span>
            </label>
          ))}
        </div>
      </section>
      <section className="block" aria-labelledby="ctl-title">
        <h3 id="ctl-title">Controls</h3>
        <p className="muted">Using {controls === "touch" ? "touch joysticks" : "keyboard and mouse"}{settings.controls === "auto" ? ", detected from this device" : ""}.</p>
        <div className="segmented" role="radiogroup" aria-label="Controls">
          {(["auto", "keyboard", "touch"] as const).map((c) => (
            <label key={c}>
              <input type="radio" name="controls" checked={settings.controls === c} onChange={() => update({ controls: c })} />
              <span>{c === "auto" ? "Automatic" : c === "keyboard" ? "Keyboard and mouse" : "Touch joysticks"}</span>
            </label>
          ))}
        </div>
        <label className="check">
          <input type="checkbox" checked={settings.hints} onChange={(e) => update({ hints: e.target.checked })} />
          <span>Show the keyboard hint</span>
        </label>
      </section>
      <section className="block" aria-labelledby="acct-title">
        <h3 id="acct-title">Account</h3>
        <p className="muted">{a.displayName}, @{a.username}. Member since {new Date(a.createdAt).toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" })}.</p>
        <form onSubmit={changePassword} className="stack">
          <label className="field">
            <span>Current password</span>
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
          </label>
          <label className="field">
            <span>New password</span>
            <input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" minLength={8} required />
          </label>
          <Feedback />
          <button type="submit" className="btn btn-small" disabled={busy}>Change password</button>
        </form>
        <button type="button" className="btn btn-small btn-quiet" onClick={async () => (await signOut(), navigate("/"))}>Sign out of this tab</button>
      </section>
      <section className="block" aria-labelledby="sync-title">
        <h3 id="sync-title">Sync</h3>
        <p className="muted">
          {bus.live ? `Live link open: ${tabs} AFTERLIFE ${tabs === 1 ? "tab" : "tabs"} on this browser share the world in real time.` : "This browser cannot open the live link, so other tabs update when you reload."}{" "}
          Your account, lumens, inventory, homes, friends, messages and purchases are kept by the world server inside this browser.
          Syncing with other devices and the Android app starts when the hosted server is connected.
        </p>
      </section>
    </Panel>
  );
}
