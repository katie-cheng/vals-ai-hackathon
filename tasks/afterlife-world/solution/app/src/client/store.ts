import { useSyncExternalStore } from "react";
import { api } from "../server/api";
import { bus, TAB_ID, type PeerState } from "../server/bus";
import type { Listing, Message, Note, Profile, PublicAccount, Purchase } from "../server/types";
import { showBrowserNotification } from "./browserNotify";

const TOKEN = "afterlife.session";

export interface Toast {
  id: string;
  title: string;
  body: string;
}

export interface State {
  ready: boolean;
  token: string | null;
  account: PublicAccount | null;
  notes: Note[];
  world: Message[];
  direct: Message[];
  peers: Record<string, PeerState>;
  profiles: Record<string, Profile>;
  plots: Record<string, Profile | null>;
  listings: Listing[];
  purchases: Purchase[];
  toasts: Toast[];
  emotes: Record<string, { emote: string; at: number }>;
}

let state: State = {
  ready: false, token: null, account: null, notes: [], world: [], direct: [], peers: {}, profiles: {}, plots: {}, listings: [], purchases: [], toasts: [], emotes: {},
};
const subs = new Set<() => void>();
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  subs.forEach((s) => s());
};

export const getState = () => state;
export const useStore = <T,>(pick: (s: State) => T) =>
  useSyncExternalStore((cb) => (subs.add(cb), () => subs.delete(cb)), () => pick(state));

async function refreshAccount() {
  if (!state.token) return;
  const r = await api.me(state.token);
  if (!r.ok) return signedOut();
  const a = r.data;
  const ids = [...new Set([...a.friends, ...a.requestsIn, ...a.requestsOut])].filter((i) => !state.profiles[i]);
  const profiles = ids.length ? await api.profiles(state.token, ids) : null;
  set({
    account: a,
    profiles: profiles?.ok ? { ...state.profiles, ...Object.fromEntries(profiles.data.map((p) => [p.id, p])) } : state.profiles,
  });
}

async function refreshNotes() {
  if (!state.token) return;
  const r = await api.notes(state.token);
  if (r.ok) set({ notes: r.data });
}

export async function refreshMarket() {
  if (!state.token) return;
  const r = await api.market(state.token);
  if (r.ok) set({ listings: r.data.listings, purchases: r.data.purchases });
}

export async function refreshPlots() {
  const r = await api.plots();
  if (r.ok) set({ plots: r.data });
}

async function refreshWorldChat() {
  if (!state.token) return;
  const r = await api.messages(state.token, "world");
  if (r.ok) set({ world: r.data });
}

export async function loadDirect(friendId: string) {
  if (!state.token) return;
  const r = await api.messages(state.token, friendId);
  if (r.ok) set({ direct: r.data });
}

async function refreshAll() {
  await Promise.all([refreshAccount(), refreshNotes(), refreshMarket(), refreshPlots(), refreshWorldChat()]);
}

function signedOut() {
  sessionStorage.removeItem(TOKEN);
  localStorage.removeItem(TOKEN);
  set({ token: null, account: null, notes: [], world: [], direct: [], listings: [], purchases: [] });
}

export async function startSession(token: string, remember = true) {
  sessionStorage.setItem(TOKEN, token);
  if (remember) localStorage.setItem(TOKEN, token);
  set({ token });
  await refreshAll();
}

export async function signOut() {
  if (state.token) await api.signOut(state.token);
  signedOut();
}

export function dismissToast(id: string) {
  set({ toasts: state.toasts.filter((t) => t.id !== id) });
}

function deliver(note: Note) {
  const a = state.account;
  if (!a || note.accountId !== a.id) return;
  set({ notes: [note, ...state.notes.filter((n) => n.id !== note.id)] });
  const pref = a.prefs[note.kind];
  if (Date.now() < a.muteUntil) return;
  if (pref.inWorld && document.visibilityState === "visible") {
    set({ toasts: [...state.toasts.slice(-2), { id: note.id, title: note.title, body: note.body }] });
    setTimeout(() => dismissToast(note.id), 7000);
  }
  if (pref.browser && document.visibilityState === "hidden") void showBrowserNotification(note.id, note.title, note.body);
}

export function sendPresence(p: Omit<PeerState, "tab" | "accountId" | "name" | "cloak" | "at">) {
  const a = state.account;
  if (!a) return;
  bus.emit({ t: "presence", peer: { ...p, tab: TAB_ID, accountId: a.id, name: a.displayName, cloak: a.cloak, at: Date.now() } }, { local: false });
}

export function sendEmote(emote: string) {
  const a = state.account;
  if (!a) return;
  bus.emit({ t: "emote", tab: TAB_ID, name: a.displayName, emote });
}

let started = false;
export async function boot() {
  if (started) return;
  started = true;
  bus.on((e) => {
    if (e.t === "changed") {
      if (state.account && e.ids.includes(state.account.id)) void refreshAccount();
      if (e.ids.includes("market")) void refreshMarket();
      if (e.ids.includes("plots")) void refreshPlots();
      if (e.ids.some((i) => i !== state.account?.id && state.profiles[i])) {
        const profiles = { ...state.profiles };
        e.ids.forEach((i) => delete profiles[i]);
        set({ profiles });
        void refreshAccount();
      }
    } else if (e.t === "note") deliver(e.note);
    else if (e.t === "chat") {
      const me = state.account?.id;
      if (e.message.to === "world") set({ world: [...state.world.filter((m) => m.id !== e.message.id), e.message].slice(-60) });
      else if (me && (e.message.to === me || e.message.from === me)) set({ direct: [...state.direct.filter((m) => m.id !== e.message.id), e.message] });
    } else if (e.t === "presence") {
      if (e.peer.tab !== TAB_ID) set({ peers: { ...state.peers, [e.peer.tab]: e.peer } });
    } else if (e.t === "leave") {
      const peers = { ...state.peers };
      delete peers[e.tab];
      set({ peers });
    } else if (e.t === "emote") set({ emotes: { ...state.emotes, [e.tab]: { emote: e.emote, at: Date.now() } } });
  });
  addEventListener("pagehide", () => bus.emit({ t: "leave", tab: TAB_ID }, { local: false }));
  setInterval(() => {
    const now = Date.now();
    const stale = Object.values(state.peers).filter((p) => now - p.at > 6000);
    if (stale.length) {
      const peers = { ...state.peers };
      stale.forEach((p) => delete peers[p.tab]);
      set({ peers });
    }
  }, 2000);
  setInterval(() => {
    if (state.token && state.account?.reminders.length) void api.dueReminders(state.token);
  }, 15_000);
  const token = sessionStorage.getItem(TOKEN) ?? localStorage.getItem(TOKEN);
  if (token) {
    set({ token });
    await refreshAll();
    if (!state.account) signedOut();
  }
  set({ ready: true });
}

export const unreadCount = (s: State) => s.notes.filter((n) => !n.read).length;
