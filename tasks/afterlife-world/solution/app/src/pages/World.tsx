import { Bell, CalendarDays, Home, Menu, MessageSquare, Settings as Gear, ShoppingBag, Backpack, Users, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../server/api";
import { PLACES } from "../server/catalog";
import { detectDevice, QUALITY_LABEL, type Quality } from "../client/device";
import { useSettings } from "../client/settings";
import { dismissToast, getState, sendPresence, startSession, unreadCount, useStore } from "../client/store";
import { Engine, type Input } from "../world/engine";
import { Joystick } from "../world/Joystick";
import { Chat } from "../panels/Chat";
import { InventoryPanel } from "../panels/Inventory";
import { MarketPanel } from "../panels/Market";
import { FriendsPanel } from "../panels/Friends";
import { MessagesPanel } from "../panels/Messages";
import { HomesPanel } from "../panels/Homes";
import { EventsPanel } from "../panels/Events";
import { NotificationsPanel } from "../panels/Notifications";
import { SettingsPanel } from "../panels/Settings";

export type PanelId = "inventory" | "market" | "friends" | "messages" | "homes" | "events" | "notifications" | "settings";

const NAV: { id: PanelId; label: string; icon: typeof Bell }[] = [
  { id: "inventory", label: "Inventory", icon: Backpack },
  { id: "market", label: "Market", icon: ShoppingBag },
  { id: "homes", label: "Homes", icon: Home },
  { id: "friends", label: "Friends", icon: Users },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "settings", label: "Settings", icon: Gear },
];

export default function World() {
  const ready = useStore((s) => s.ready);
  const account = useStore((s) => s.account);
  useEffect(() => {
    document.title = "AFTERLIFE: the world";
  }, []);
  if (!ready) return <main className="gate"><p className="gate-loading">Opening the world</p></main>;
  return account ? <Play /> : <AccountGate />;
}

function AccountGate() {
  const [mode, setMode] = useState<"create" | "signin">("create");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const username = String(f.get("username") || "");
    const password = String(f.get("password") || "");
    setBusy(true);
    const r = mode === "create" ? await api.register(String(f.get("displayName") || ""), username, password) : await api.signIn(username, password);
    setBusy(false);
    if (!r.ok) return setError(r.error);
    await startSession(r.data.token, f.get("remember") === "on");
  };
  return (
    <main className="gate">
      <header className="gate-top">
        <Link to="/" className="wordmark">AFTERLIFE</Link>
      </header>
      <section className="gate-card" aria-labelledby="gate-title">
        <h1 id="gate-title">{mode === "create" ? "Make your soul" : "Welcome back"}</h1>
        <p className="muted">
          {mode === "create"
            ? "Pick a name other players will see. You start with 200 lumens and a free plot of land to claim."
            : "Sign in with the username and password you chose."}
        </p>
        <div className="tabs" role="tablist" aria-label="Account">
          <button type="button" role="tab" aria-selected={mode === "create"} onClick={() => (setMode("create"), setError(""))}>New account</button>
          <button type="button" role="tab" aria-selected={mode === "signin"} onClick={() => (setMode("signin"), setError(""))}>Sign in</button>
        </div>
        <form onSubmit={submit} className="stack">
          {mode === "create" && (
            <label className="field">
              <span>Display name</span>
              <input name="displayName" autoComplete="nickname" required minLength={2} maxLength={24} />
            </label>
          )}
          <label className="field">
            <span>Username</span>
            <input name="username" autoComplete="username" required pattern="[A-Za-z0-9_]{3,20}" title="3 to 20 letters, numbers or underscores" />
          </label>
          <label className="field">
            <span>Password</span>
            <input name="password" type="password" autoComplete={mode === "create" ? "new-password" : "current-password"} required minLength={8} />
          </label>
          <label className="check">
            <input type="checkbox" name="remember" defaultChecked />
            <span>Keep me signed in on this browser</span>
          </label>
          {error && <p className="feedback error" role="alert">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={busy}>{mode === "create" ? "Create account and enter" : "Sign in and enter"}</button>
        </form>
        <p className="gate-note">
          Accounts are kept by the world server built into this browser, so every AFTERLIFE tab you open shares the same account and world.
          Other devices can't reach it until the hosted server is connected.
        </p>
      </section>
    </main>
  );
}

function Play() {
  const account = useStore((s) => s.account)!;
  const token = useStore((s) => s.token)!;
  const peers = useStore((s) => s.peers);
  const plots = useStore((s) => s.plots);
  const toasts = useStore((s) => s.toasts);
  const unread = useStore(unreadCount);
  const [settings, updateSettings] = useSettings();
  const device = useMemo(detectDevice, []);
  const [touchSeen, setTouchSeen] = useState(false);
  const controls = settings.controls === "auto" ? (device.controls === "touch" || touchSeen ? "touch" : "keyboard") : settings.controls;
  const quality: Quality = settings.quality === "auto" ? device.quality : settings.quality;
  const [panel, setPanel] = useState<PanelId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dmWith, setDmWith] = useState("world");
  const [place, setPlace] = useState("Lantern Plaza");
  const [stats, setStats] = useState<{ fps: number; quality: Quality }>({ fps: 0, quality });
  const [gatherNote, setGatherNote] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);
  const tags = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);
  const input = useRef<Input>({ keys: new Set(), move: { x: 0, y: 0 }, look: { x: 0, y: 0 }, jump: false });
  const lastMove = useRef(0);

  useEffect(() => {
    const e = new Engine(canvas.current!, tags.current!, quality, settings.quality === "auto", input.current, {
      onMove: (x, z, ry, y) => {
        sendPresence({ x, z, ry, y });
        const now = Date.now();
        if (now - lastMove.current < 1000) return;
        lastMove.current = now;
        void api.move(token, { x, z, ry }).then((r) => {
          if (r.ok && r.data.corrected) e.setPosition(r.data.position.x, r.data.position.z, r.data.position.ry);
        });
      },
      onGather: async (id) => {
        const p = e.position;
        await api.move(token, { x: p.x, z: p.z, ry: e.heading });
        lastMove.current = Date.now();
        const r = await api.collect(token, id);
        setGatherNote(r.ok ? `+5 lumens` : r.error);
        setTimeout(() => setGatherNote(""), 2500);
      },
      onPlace: setPlace,
      onFps: (fps, q) => setStats({ fps, quality: q }),
    });
    const a = getState().account!;
    e.setPosition(a.position.x, a.position.z, a.position.ry);
    e.setCloak(a.cloak);
    e.setCollected(a.collected);
    engine.current = e;
    const onResize = () => e.resize();
    addEventListener("resize", onResize);
    return () => {
      removeEventListener("resize", onResize);
      e.dispose();
      engine.current = null;
    };
    // The engine is created once per account; quality changes are applied below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.id]);

  const firstQuality = useRef(true);
  useEffect(() => {
    const e = engine.current;
    if (!e) return;
    if (firstQuality.current) return void (firstQuality.current = false);
    e.auto = settings.quality === "auto";
    e.applyQuality(quality);
    setStats((s) => ({ ...s, quality }));
  }, [quality, settings.quality]);
  useEffect(() => engine.current?.setCloak(account.cloak), [account.cloak]);
  useEffect(() => engine.current?.setCollected(account.collected), [account.collected]);
  useEffect(() => engine.current?.setHouses(plots), [plots]);
  useEffect(() => engine.current?.setPeers(Object.values(peers)), [peers]);

  useEffect(() => {
    const typing = (t: EventTarget | null) => t instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setPanel(null), setMenuOpen(false);
      if (typing(e.target)) return;
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
      input.current.keys.add(e.code);
    };
    const up = (e: KeyboardEvent) => input.current.keys.delete(e.code);
    const blur = () => input.current.keys.clear();
    const touch = () => setTouchSeen(true);
    addEventListener("keydown", down);
    addEventListener("keyup", up);
    addEventListener("blur", blur);
    addEventListener("touchstart", touch, { once: true, passive: true });
    return () => {
      removeEventListener("keydown", down);
      removeEventListener("keyup", up);
      removeEventListener("blur", blur);
      removeEventListener("touchstart", touch);
    };
  }, []);

  const open = (id: PanelId) => {
    setMenuOpen(false);
    setPanel((p) => (p === id ? null : id));
  };
  const others = Object.values(peers);

  return (
    <main className={`play controls-${controls}`}>
      <canvas ref={canvas} className="world-canvas" aria-label={`3D view of ${place}. ${controls === "touch" ? "Use the joysticks to walk and look around." : "Walk with W, A, S and D or the arrow keys; drag to look around."}`} tabIndex={0} />
      <div ref={tags} className="tag-layer" aria-hidden />

      <header className="hud-top">
        <div className="hud-id">
          <Link to="/" className="wordmark wordmark-sm">AFTERLIFE</Link>
          <span className="hud-place"><strong>{account.displayName}</strong> in {place}</span>
        </div>
        <div className="hud-right">
          <span className="balance" aria-label={`${account.balance} lumens`}><span className="lumen-mark" aria-hidden />{account.balance}<span className="unit"> lumens</span></span>
          <button type="button" className="icon-btn bell" aria-label={`Notifications, ${unread} unread`} aria-expanded={panel === "notifications"} onClick={() => open("notifications")}>
            <Bell size={20} aria-hidden />
            {unread > 0 && <span className="count">{unread > 99 ? "99+" : unread}</span>}
          </button>
          <button type="button" className="icon-btn menu-btn" aria-label="Menu" aria-expanded={menuOpen} onClick={() => (setMenuOpen((m) => !m), setPanel(null))}>
            {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </header>

      <nav className={`toolbar${menuOpen ? " open" : ""}`} aria-label="World">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" aria-pressed={panel === id} onClick={() => open(id)}>
            <Icon size={18} aria-hidden />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {toasts.length > 0 && (
        <div className="toasts" role="status">
          {toasts.map((t) => (
            <div key={t.id} className="toast">
              <div>
                <strong>{t.title}</strong>
                <p>{t.body}</p>
              </div>
              <button type="button" className="icon-btn" aria-label="Dismiss" onClick={() => dismissToast(t.id)}><X size={16} aria-hidden /></button>
            </div>
          ))}
        </div>
      )}
      {gatherNote && <p className="world-note" role="status">{gatherNote}</p>}

      {controls === "keyboard" ? (
        <>
          <Chat compact onOpenMessages={() => open("messages")} />
          {settings.hints && (
            <div className="hint">
              <p><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> walk, <kbd>Shift</kbd> run, <kbd>Space</kbd> jump, drag to look, scroll to zoom</p>
              <button type="button" className="text-btn" onClick={() => updateSettings({ hints: false })}>Hide</button>
            </div>
          )}
        </>
      ) : (
        <div className="touch-controls">
          <Joystick label="Move joystick" side="left" onChange={(x, y) => (input.current.move = { x, y })} />
          <button
            type="button"
            className="jump-btn"
            onPointerDown={() => (input.current.jump = true)}
            onPointerUp={() => (input.current.jump = false)}
            onPointerCancel={() => (input.current.jump = false)}
          >
            Jump
          </button>
          <Joystick label="Look joystick" side="right" onChange={(x, y) => (input.current.look = { x, y })} />
        </div>
      )}

      {panel === "inventory" && <InventoryPanel onClose={() => setPanel(null)} visited={account.visited.length} total={PLACES.length} />}
      {panel === "market" && <MarketPanel onClose={() => setPanel(null)} />}
      {panel === "friends" && <FriendsPanel onClose={() => setPanel(null)} others={others} onMessage={(id) => (setDmWith(id), setPanel("messages"))} />}
      {panel === "messages" && <MessagesPanel onClose={() => (setPanel(null), setDmWith("world"))} initial={dmWith} />}
      {panel === "homes" && <HomesPanel onClose={() => setPanel(null)} onGo={(x, z) => (engine.current?.setPosition(x, z, 0), (lastMove.current = Date.now()))} />}
      {panel === "events" && <EventsPanel onClose={() => setPanel(null)} />}
      {panel === "notifications" && <NotificationsPanel onClose={() => setPanel(null)} />}
      {panel === "settings" && (
        <SettingsPanel
          onClose={() => setPanel(null)}
          device={device}
          controls={controls}
          stats={stats}
          qualityLabel={QUALITY_LABEL[stats.quality]}
        />
      )}
    </main>
  );
}
