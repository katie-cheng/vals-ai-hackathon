// The world server. This build has no hosted backend, so it runs in the browser: every change goes through these
// handlers, which check the session and validate the request before writing to the database in localStorage.
// The client never writes the database itself.
import { bus } from "./bus";
import {
  ANCHORS, DEFAULT_CLOAK, EVENTS, FIRST_PLOT_PRICE, MAX_PLOTS, MOTES, MOTE_RESPAWN_MS, MOTE_VALUE, PLOTS, PLOT_PRICE, START_BALANCE,
  itemById, nextStart, placeAt,
} from "./catalog";
import { KINDS } from "./types";
import type { Account, Db, Kind, Listing, Message, Note, Position, Prefs, Profile, PublicAccount, Purchase, Result } from "./types";

const KEY = "afterlife.db.v1";
const MAX_SPEED = 14;
const ISLAND_RADIUS = 40;

const empty = (): Db => ({ version: 1, accounts: {}, sessions: {}, messages: [], notes: [], listings: [], purchases: [], plots: {} });

function load(): Db {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty(), ...JSON.parse(raw) };
  } catch {
    /* unreadable data starts a fresh database */
  }
  return empty();
}

function save(db: Db) {
  db.messages = db.messages.slice(-400);
  db.notes = db.notes.slice(-600);
  db.purchases = db.purchases.slice(-400);
  localStorage.setItem(KEY, JSON.stringify(db));
}

/** Runs one request against the database, one at a time across all tabs. */
async function tx<T>(fn: (db: Db) => T): Promise<T> {
  const run = () => {
    const db = load();
    const out = fn(db);
    save(db);
    return out;
  };
  if (navigator.locks) return navigator.locks.request(KEY, run);
  return run();
}

class Reject extends Error {}
const fail = (msg: string): never => {
  throw new Reject(msg);
};

async function handle<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    if (e instanceof Reject) return { ok: false, error: e.message };
    console.warn(e);
    return { ok: false, error: "The world server could not finish that request. Try again." };
  }
}

const id = () => crypto.randomUUID();
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");

async function hashPassword(password: string, salt: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 120_000 }, key, 256);
  return hex(bits);
}

function newToken() {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return hex(b.buffer);
}

function device() {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "A browser";
  const os = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "an unknown system";
  return `${browser} on ${os}`;
}

const defaultPrefs = (): Prefs => Object.fromEntries(KINDS.map((k) => [k.id, { inWorld: true, browser: k.id !== "purchase" }])) as Prefs;

function strip(a: Account): PublicAccount {
  const { salt: _s, hash: _h, ...rest } = a;
  return rest;
}

const profile = (a: Account): Profile => ({ id: a.id, username: a.username, displayName: a.displayName, cloak: a.cloak });

function who(db: Db, token: string): Account {
  const s = db.sessions[token];
  const a = s && db.accounts[s.accountId];
  if (!a) fail("Your session has ended. Sign in again.");
  return a!;
}

const pending: { notes: Note[]; changed: Set<string>; chat: Message[] } = { notes: [], changed: new Set(), chat: [] };

function notify(db: Db, accountId: string, kind: Kind, title: string, body: string) {
  const note: Note = { id: id(), accountId, kind, title, body, at: Date.now(), read: false };
  db.notes.push(note);
  pending.notes.push(note);
}

/** Sends what the last request changed to every open tab, after it has been saved. */
function flush() {
  const ids = [...pending.changed];
  if (ids.length) bus.emit({ t: "changed", ids });
  pending.notes.splice(0).forEach((note) => bus.emit({ t: "note", note }));
  pending.chat.splice(0).forEach((message) => bus.emit({ t: "chat", message }));
  pending.changed.clear();
}

async function mutate<T>(fn: (db: Db) => T): Promise<Result<T>> {
  const r = await handle(() => tx(fn));
  flush();
  return r;
}

const touch = (...ids: string[]) => ids.forEach((i) => pending.changed.add(i));

function onIsland(x: number, z: number) {
  const pier = Math.abs(x) <= 2.4 && z >= 30 && z <= 47;
  return Math.hypot(x, z) <= ISLAND_RADIUS || pier;
}

export const api = {
  async register(displayName: string, username: string, password: string) {
    const name = displayName.trim().replace(/\s+/g, " ");
    const user = username.trim().toLowerCase();
    const r = await handle(async () => {
      if (name.length < 2 || name.length > 24) fail("Choose a display name between 2 and 24 characters.");
      if (!/^[a-z0-9_]{3,20}$/.test(user)) fail("Usernames are 3 to 20 letters, numbers or underscores.");
      if (password.length < 8) fail("Use a password of at least 8 characters.");
      const salt = newToken();
      const hash = await hashPassword(password, salt);
      return tx((db) => {
        if (Object.values(db.accounts).some((a) => a.username === user)) fail("That username is taken.");
        const a: Account = {
          id: id(), username: user, displayName: name, salt, hash, createdAt: Date.now(), balance: START_BALANCE, cloak: DEFAULT_CLOAK,
          inventory: {}, homes: [], friends: [], requestsIn: [], requestsOut: [], position: { x: 0, z: 7, ry: 0 }, movedAt: Date.now(),
          gathered: 0, collected: {}, visited: ["Lantern Plaza"], reminders: [], prefs: defaultPrefs(), muteUntil: 0,
        };
        db.accounts[a.id] = a;
        const token = newToken();
        db.sessions[token] = { token, accountId: a.id, createdAt: Date.now(), device: device(), position: a.position, movedAt: 0 };
        return { token, account: strip(a) };
      });
    });
    flush();
    return r;
  },

  async signIn(username: string, password: string) {
    const user = username.trim().toLowerCase();
    const r = await handle(async () => {
      const found = Object.values(load().accounts).find((a) => a.username === user);
      if (!found || (await hashPassword(password, found.salt)) !== found.hash) fail("That username and password don't match an account.");
      return tx((db) => {
        const a = db.accounts[found!.id];
        const token = newToken();
        db.sessions[token] = { token, accountId: a.id, createdAt: Date.now(), device: device(), position: a.position, movedAt: 0 };
        notify(db, a.id, "account", "New sign-in", `Signed in with ${device()} at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. If this wasn't you, change your password in Settings.`);
        return { token, account: strip(a) };
      });
    });
    flush();
    return r;
  },

  signOut: (token: string) => mutate((db) => void delete db.sessions[token]),

  me: (token: string) => handle(async () => strip(who(load(), token))),

  async changePassword(token: string, current: string, next: string) {
    const r = await handle(async () => {
      const a = who(load(), token);
      if ((await hashPassword(current, a.salt)) !== a.hash) fail("Your current password is not right.");
      if (next.length < 8) fail("Use a new password of at least 8 characters.");
      const salt = newToken();
      const hash = await hashPassword(next, salt);
      return tx((db) => {
        const acc = who(db, token);
        acc.salt = salt;
        acc.hash = hash;
        for (const s of Object.values(db.sessions)) if (s.accountId === acc.id && s.token !== token) delete db.sessions[s.token];
        notify(db, acc.id, "account", "Password changed", "Your password was changed and your other sessions were signed out.");
        touch(acc.id);
      });
    });
    flush();
    return r;
  },

  /** Saves the player's position. Moves faster than walking speed are refused unless they go to a known place. */
  move: (token: string, pos: Position, anchor?: string) =>
    mutate((db) => {
      const a = who(db, token);
      const s = db.sessions[token];
      const now = Date.now();
      const from = s.position ?? a.position;
      const target = anchor ? ANCHORS.find((p) => p.id === anchor) ?? PLOTS.find((p) => p.id === anchor) : null;
      if (anchor && !target) fail("Unknown place.");
      const next = target ? { x: target.x, z: target.z + 3, ry: pos.ry } : pos;
      if (![next.x, next.z, next.ry].every(Number.isFinite) || !onIsland(next.x, next.z)) fail("That position is off the island.");
      const dt = Math.min(5, Math.max(0.25, (now - (s.movedAt ?? 0)) / 1000));
      if (!target && Math.hypot(next.x - from.x, next.z - from.z) > MAX_SPEED * dt + 2) return { position: from, corrected: true };
      s.position = next;
      s.movedAt = now;
      a.position = next;
      const place = placeAt(next.x, next.z);
      if (!a.visited.includes(place)) {
        a.visited.push(place);
        touch(a.id);
      }
      return { position: next, corrected: !!target };
    }),

  collect: (token: string, moteId: string) =>
    mutate((db) => {
      const a = who(db, token);
      const m = MOTES.find((x) => x.id === moteId);
      if (!m) fail("Nothing to gather there.");
      const at = db.sessions[token].position ?? a.position;
      if (Math.hypot(at.x - m!.x, at.z - m!.z) > 3.5) fail("Walk closer to gather that light.");
      if (Date.now() - (a.collected[m!.id] ?? 0) < MOTE_RESPAWN_MS) fail("That light has not come back yet.");
      a.collected[m!.id] = Date.now();
      a.balance += MOTE_VALUE;
      a.gathered += 1;
      touch(a.id);
      return { balance: a.balance };
    }),

  buy: (token: string, itemId: string) =>
    mutate((db) => {
      const a = who(db, token);
      const item = itemById(itemId);
      if (!item) fail("That item is not sold here.");
      if (item!.kind === "cloak" && a.inventory[item!.id]) fail("You already own that cloak.");
      if (a.balance < item!.price) fail(`You need ${item!.price - a.balance} more lumens.`);
      a.balance -= item!.price;
      a.inventory[item!.id] = (a.inventory[item!.id] ?? 0) + 1;
      const p: Purchase = { id: id(), accountId: a.id, what: item!.name, price: item!.price, at: Date.now(), from: "Market Row stalls" };
      db.purchases.push(p);
      notify(db, a.id, "purchase", `Bought ${item!.name}`, `${item!.price} lumens. It is in your inventory. Balance ${a.balance} lumens.`);
      touch(a.id);
      return p;
    }),

  wear: (token: string, itemId: string | null) =>
    mutate((db) => {
      const a = who(db, token);
      if (itemId === null) a.cloak = DEFAULT_CLOAK;
      else {
        const item = itemById(itemId);
        if (!item || item.kind !== "cloak" || !a.inventory[itemId]) fail("You don't own that cloak.");
        a.cloak = item!.color!;
      }
      touch(a.id);
    }),

  list: (token: string, itemId: string, price: number) =>
    mutate((db) => {
      const a = who(db, token);
      const item = itemById(itemId);
      if (!item || !a.inventory[itemId]) fail("You don't have that item.");
      if (!Number.isInteger(price) || price < 1 || price > 5000) fail("Set a price between 1 and 5000 lumens.");
      if (item!.kind === "cloak" && a.cloak === item!.color) a.cloak = DEFAULT_CLOAK;
      a.inventory[itemId] -= 1;
      if (!a.inventory[itemId]) delete a.inventory[itemId];
      const l: Listing = { id: id(), sellerId: a.id, sellerName: a.displayName, itemId, price, at: Date.now() };
      db.listings.push(l);
      touch(a.id, "market");
      return l;
    }),

  unlist: (token: string, listingId: string) =>
    mutate((db) => {
      const a = who(db, token);
      const l = db.listings.find((x) => x.id === listingId);
      if (!l || l.sellerId !== a.id) fail("That listing is not yours.");
      db.listings = db.listings.filter((x) => x !== l);
      a.inventory[l!.itemId] = (a.inventory[l!.itemId] ?? 0) + 1;
      touch(a.id, "market");
    }),

  buyListing: (token: string, listingId: string) =>
    mutate((db) => {
      const a = who(db, token);
      const l = db.listings.find((x) => x.id === listingId);
      if (!l) fail("That listing has already sold or been withdrawn.");
      if (l!.sellerId === a.id) fail("You can't buy your own listing.");
      const item = itemById(l!.itemId)!;
      if (item.kind === "cloak" && a.inventory[item.id]) fail("You already own that cloak.");
      if (a.balance < l!.price) fail(`You need ${l!.price - a.balance} more lumens.`);
      const seller = db.accounts[l!.sellerId];
      a.balance -= l!.price;
      a.inventory[item.id] = (a.inventory[item.id] ?? 0) + 1;
      if (seller) seller.balance += l!.price;
      db.listings = db.listings.filter((x) => x !== l);
      db.purchases.push({ id: id(), accountId: a.id, what: item.name, price: l!.price, at: Date.now(), from: l!.sellerName });
      notify(db, a.id, "purchase", `Bought ${item.name}`, `${l!.price} lumens from ${l!.sellerName}. Balance ${a.balance} lumens.`);
      if (seller) {
        notify(db, seller.id, "marketplace", `${item.name} sold`, `${a.displayName} bought it for ${l!.price} lumens. Balance ${seller.balance} lumens.`);
        touch(seller.id);
      }
      touch(a.id, "market");
    }),

  claim: (token: string, plotId: string) =>
    mutate((db) => {
      const a = who(db, token);
      const plot = PLOTS.find((p) => p.id === plotId);
      if (!plot) fail("That plot does not exist.");
      if (db.plots[plotId]) fail("Someone already lives there.");
      if (a.homes.length >= MAX_PLOTS) fail(`You can own up to ${MAX_PLOTS} homes.`);
      const price = a.homes.length ? PLOT_PRICE : FIRST_PLOT_PRICE;
      if (a.balance < price) fail(`You need ${price - a.balance} more lumens.`);
      a.balance -= price;
      a.homes.push(plotId);
      db.plots[plotId] = a.id;
      db.purchases.push({ id: id(), accountId: a.id, what: `Home at ${plot!.name}`, price, at: Date.now(), from: "Hillside registry" });
      notify(db, a.id, "purchase", `${plot!.name} is yours`, price ? `${price} lumens. Balance ${a.balance} lumens.` : "Your first home is free.");
      touch(a.id, "plots");
    }),

  request: (token: string, username: string) =>
    mutate((db) => {
      const a = who(db, token);
      const b = Object.values(db.accounts).find((x) => x.username === username.trim().toLowerCase().replace(/^@/, ""));
      if (!b) fail("No player has that username.");
      if (b!.id === a.id) fail("That's you.");
      if (a.friends.includes(b!.id)) fail(`You and ${b!.displayName} are already friends.`);
      if (a.requestsOut.includes(b!.id)) fail("Request already sent.");
      if (a.requestsIn.includes(b!.id)) fail(`${b!.displayName} already asked you. Accept their request below.`);
      a.requestsOut.push(b!.id);
      b!.requestsIn.push(a.id);
      notify(db, b!.id, "friend", "Friend request", `${a.displayName} (@${a.username}) wants to be friends.`);
      touch(a.id, b!.id);
      return profile(b!);
    }),

  answer: (token: string, fromId: string, accept: boolean) =>
    mutate((db) => {
      const a = who(db, token);
      const b = db.accounts[fromId];
      if (!b || !a.requestsIn.includes(fromId)) fail("That request is no longer open.");
      a.requestsIn = a.requestsIn.filter((x) => x !== fromId);
      b.requestsOut = b.requestsOut.filter((x) => x !== a.id);
      if (accept) {
        a.friends.push(b.id);
        b.friends.push(a.id);
        notify(db, b.id, "friend", "Friend request accepted", `${a.displayName} accepted your request.`);
      }
      touch(a.id, b.id);
    }),

  unfriend: (token: string, otherId: string) =>
    mutate((db) => {
      const a = who(db, token);
      const b = db.accounts[otherId];
      a.friends = a.friends.filter((x) => x !== otherId);
      if (b) b.friends = b.friends.filter((x) => x !== a.id);
      touch(a.id, otherId);
    }),

  invite: (token: string, friendId: string, plotId: string) =>
    mutate((db) => {
      const a = who(db, token);
      const b = db.accounts[friendId];
      const plot = PLOTS.find((p) => p.id === plotId);
      if (!b || !a.friends.includes(friendId)) fail("You can only invite friends.");
      if (!plot || db.plots[plotId] !== a.id) fail("You can only invite people to your own home.");
      notify(db, b.id, "invitation", "Invitation", `${a.displayName} invited you to their home at ${plot!.name}.`);
    }),

  say: (token: string, to: string, text: string) =>
    mutate((db) => {
      const a = who(db, token);
      const body = text.trim().replace(/\s+/g, " ");
      if (!body) fail("Write something first.");
      if (body.length > 280) fail("Messages are limited to 280 characters.");
      if (to !== "world" && !a.friends.includes(to)) fail("You can only message friends.");
      const recent = db.messages.filter((m) => m.from === a.id && Date.now() - m.at < 10_000).length;
      if (recent >= 6) fail("Slow down a little: wait a few seconds before the next message.");
      const m: Message = { id: id(), from: a.id, fromName: a.displayName, to, text: body, at: Date.now() };
      db.messages.push(m);
      pending.chat.push(m);
      if (to !== "world") notify(db, to, "message", `Message from ${a.displayName}`, body.length > 90 ? `${body.slice(0, 90)}...` : body);
      return m;
    }),

  remind: (token: string, eventId: string, on: boolean) =>
    mutate((db) => {
      const a = who(db, token);
      if (!EVENTS.some((e) => e.id === eventId)) fail("Unknown event.");
      a.reminders = a.reminders.filter((x) => !x.startsWith(`${eventId}@`));
      const e = EVENTS.find((x) => x.id === eventId)!;
      if (on) a.reminders.push(`${eventId}@${nextStart(e)}`);
      touch(a.id);
    }),

  /** Sends due event reminders: ten minutes before start, once per occurrence. */
  dueReminders: (token: string) =>
    mutate((db) => {
      const a = who(db, token);
      const now = Date.now();
      const keep: string[] = [];
      for (const r of a.reminders) {
        const [eventId, at] = r.split("@");
        const e = EVENTS.find((x) => x.id === eventId);
        const start = Number(at);
        if (e && now >= start - 10 * 60_000) {
          notify(db, a.id, "event", `${e.name} starts ${now >= start ? "now" : "in 10 minutes"}`, `${e.place}. ${e.about}`);
          touch(a.id);
        } else keep.push(r);
      }
      a.reminders = keep;
    }),

  setPrefs: (token: string, prefs: Prefs) =>
    mutate((db) => {
      const a = who(db, token);
      for (const k of KINDS) if (typeof prefs[k.id]?.inWorld !== "boolean" || typeof prefs[k.id]?.browser !== "boolean") fail("Invalid preferences.");
      a.prefs = Object.fromEntries(KINDS.map((k) => [k.id, { inWorld: prefs[k.id].inWorld, browser: prefs[k.id].browser }])) as Prefs;
      touch(a.id);
    }),

  mute: (token: string, until: number) =>
    mutate((db) => {
      const a = who(db, token);
      if (!Number.isFinite(until) || until < 0) fail("Invalid mute time.");
      a.muteUntil = until;
      touch(a.id);
    }),

  markRead: (token: string, noteIds: string[] | "all") =>
    mutate((db) => {
      const a = who(db, token);
      for (const n of db.notes) if (n.accountId === a.id && (noteIds === "all" || noteIds.includes(n.id))) n.read = true;
      touch(a.id);
    }),

  // Reads do not change anything, so they skip the write lock.
  notes: (token: string) => handle(async () => {
    const db = load();
    const a = who(db, token);
    return db.notes.filter((n) => n.accountId === a.id).reverse();
  }),

  messages: (token: string, channel: string) => handle(async () => {
    const db = load();
    const a = who(db, token);
    return db.messages.filter((m) => (channel === "world" ? m.to === "world" : (m.from === a.id && m.to === channel) || (m.from === channel && m.to === a.id))).slice(-60);
  }),

  profiles: (token: string, ids: string[]) => handle(async () => {
    const db = load();
    who(db, token);
    return ids.map((i) => db.accounts[i]).filter(Boolean).map(profile);
  }),

  market: (token: string) => handle(async () => {
    const db = load();
    const a = who(db, token);
    return { listings: db.listings.slice().reverse(), purchases: db.purchases.filter((p) => p.accountId === a.id).reverse(), plots: db.plots };
  }),

  plots: () => handle(async () => {
    const db = load();
    return Object.fromEntries(Object.entries(db.plots).map(([plot, owner]) => [plot, db.accounts[owner] ? profile(db.accounts[owner]) : null]));
  }),
};

export type Api = typeof api;
