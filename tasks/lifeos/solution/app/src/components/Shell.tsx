import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell, BarChart3, CalendarDays, CheckSquare, Flame, LayoutDashboard, Menu, Moon, NotebookPen, PanelLeftClose,
  PanelLeftOpen, Search, Settings as SettingsIcon, Sun, Timer, X,
} from "lucide-react";
import { Link, ROUTES, useRouter } from "../lib/router";
import { useStore } from "../lib/store";
import { longDate, dueLabel, todayIso } from "../lib/dates";
import { isOverdue } from "../lib/stats";
import { LogoMark } from "./Logo";

const ICONS: Record<string, ReactNode> = {
  "/": <LayoutDashboard size={18} />, "/tasks": <CheckSquare size={18} />, "/habits": <Flame size={18} />,
  "/calendar": <CalendarDays size={18} />, "/focus": <Timer size={18} />, "/notes": <NotebookPen size={18} />,
  "/analytics": <BarChart3 size={18} />, "/settings": <SettingsIcon size={18} />,
};

function Sidebar({ open, onClose }: { open: boolean; onClose(): void }) {
  const { path } = useRouter();
  const { data, updateSettings } = useStore();
  const collapsed = data.settings.sidebarCollapsed;
  return (
    <>
      <aside className={`sidebar${collapsed ? " is-collapsed" : ""}${open ? " is-open" : ""}`} id="sidebar" aria-label="Main">
        <div className="sidebar-head">
          <Link to="/" className="brand" aria-label="LifeOS home" onClick={onClose}>
            <LogoMark />
            <span className="brand-name">LifeOS</span>
          </Link>
          <button type="button" className="icon-btn sidebar-close" aria-label="Close menu" onClick={onClose}><X size={18} /></button>
        </div>
        <nav className="nav">
          {ROUTES.map((r) => (
            <Link key={r.path} to={r.path} className={`nav-link${path === r.path ? " is-active" : ""}`}
              aria-current={path === r.path ? "page" : undefined} title={collapsed ? r.title : undefined} onClick={onClose}>
              {ICONS[r.path]}
              <span className="nav-text">{r.title}</span>
            </Link>
          ))}
        </nav>
        <button type="button" className="nav-link collapse-btn" aria-expanded={!collapsed}
          onClick={() => updateSettings({ sidebarCollapsed: !collapsed })}>
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          <span className="nav-text">{collapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
        </button>
      </aside>
      {open && <div className="scrim" onClick={onClose} aria-hidden="true" />}
    </>
  );
}

function SearchBox() {
  const { data } = useStore();
  const { navigate } = useRouter();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const term = q.trim().toLowerCase();
  const tasks = term ? data.tasks.filter((t) => t.title.toLowerCase().includes(term)).slice(0, 4) : [];
  const notes = term ? data.notes.filter((n) => (n.title + " " + n.body).toLowerCase().includes(term)).slice(0, 3) : [];
  const go = (to: string) => { setQ(""); navigate(to); };
  return (
    <div className="search" role="search">
      <Search size={16} className="search-icon" aria-hidden="true" />
      <input type="search" placeholder="Search tasks and notes" aria-label="Search tasks and notes" value={q}
        onChange={(e) => setQ(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)} />
      {focused && term && (
        <div className="search-results">
          {tasks.length + notes.length === 0 && <p className="search-empty">No tasks or notes match "{q.trim()}"</p>}
          {tasks.length > 0 && <p className="search-group">Tasks</p>}
          {tasks.map((t) => <button type="button" key={t.id} onMouseDown={() => go(`/tasks?q=${encodeURIComponent(q.trim())}`)}>{t.title}</button>)}
          {notes.length > 0 && <p className="search-group">Notes</p>}
          {notes.map((n) => <button type="button" key={n.id} onMouseDown={() => go(`/notes?q=${encodeURIComponent(q.trim())}`)}>{n.title}</button>)}
        </div>
      )}
    </div>
  );
}

function Notifications() {
  const { data } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const today = todayIso();
  const items = data.tasks.filter((t) => !t.completed && t.due && t.due <= today).sort((a, b) => (a.due! < b.due! ? -1 : 1));
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("mousedown", close);
    addEventListener("keydown", esc);
    return () => { removeEventListener("mousedown", close); removeEventListener("keydown", esc); };
  }, [open]);
  return (
    <div className="notif" ref={ref}>
      <button type="button" className="icon-btn" aria-label={`Notifications, ${items.length} due`} aria-expanded={open} onClick={() => setOpen(!open)}>
        <Bell size={18} />
        {items.length > 0 && <span className="notif-count" aria-hidden="true">{items.length}</span>}
      </button>
      {open && (
        <div className="popover" role="dialog" aria-label="Notifications">
          <p className="popover-title">Due today or overdue</p>
          {items.length === 0 ? <p className="popover-empty">You're all caught up.</p> : (
            <ul>
              {items.map((t) => (
                <li key={t.id}>
                  <Link to="/tasks" onClick={() => setOpen(false)}>{t.title}</Link>
                  <span className={isOverdue(t) ? "is-overdue" : ""}>{dueLabel(t.due!)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function Shell({ title, children }: { title: string; children: ReactNode }) {
  const { data, updateSettings, toast } = useStore();
  const [menu, setMenu] = useState(false);
  const { path } = useRouter();
  useEffect(() => setMenu(false), [path]);
  useEffect(() => { document.title = `${title} | LifeOS`; }, [title]);
  const dark = data.settings.theme === "dark";
  const initials = data.settings.name.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "U";
  return (
    <div className={`app${data.settings.sidebarCollapsed ? " sidebar-collapsed" : ""}`}>
      <a className="skip" href="#main">Skip to content</a>
      <Sidebar open={menu} onClose={() => setMenu(false)} />
      <div className="workspace">
        <header className="topbar">
          <button type="button" className="icon-btn menu-btn" aria-label="Open menu" aria-controls="sidebar" aria-expanded={menu} onClick={() => setMenu(true)}><Menu size={20} /></button>
          <h1 className="page-title">{title}</h1>
          <SearchBox />
          <div className="topbar-tools">
            <time className="topbar-date" dateTime={todayIso()}>{longDate()}</time>
            <button type="button" className="icon-btn" aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} aria-pressed={dark}
              onClick={() => { updateSettings({ theme: dark ? "light" : "dark" }); toast(dark ? "Light theme on" : "Dark theme on", "info"); }}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Notifications />
            <Link to="/settings" className="avatar" aria-label={`Profile settings for ${data.settings.name}`}>{initials}</Link>
          </div>
        </header>
        <main id="main" className="page" key={path}>{children}</main>
      </div>
    </div>
  );
}
