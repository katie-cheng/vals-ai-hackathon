export type Kind = "friend" | "message" | "invitation" | "event" | "purchase" | "marketplace" | "account";

export const KINDS: { id: Kind; label: string; about: string }[] = [
  { id: "friend", label: "Friend requests", about: "Someone asks to be your friend or accepts your request" },
  { id: "message", label: "Messages", about: "A friend sends you a direct message" },
  { id: "invitation", label: "Invitations", about: "A friend invites you to their home" },
  { id: "event", label: "Events", about: "An event you asked to be reminded about is about to start" },
  { id: "purchase", label: "Purchases", about: "Receipts for what you buy" },
  { id: "marketplace", label: "Marketplace", about: "Something you listed sells" },
  { id: "account", label: "Account updates", about: "New sign-ins and password changes" },
];

export type Prefs = Record<Kind, { inWorld: boolean; browser: boolean }>;

export interface Position {
  x: number;
  z: number;
  ry: number;
}

export interface Account {
  id: string;
  username: string;
  displayName: string;
  salt: string;
  hash: string;
  createdAt: number;
  balance: number;
  cloak: string;
  inventory: Record<string, number>;
  homes: string[];
  friends: string[];
  requestsIn: string[];
  requestsOut: string[];
  position: Position;
  movedAt: number;
  gathered: number;
  collected: Record<string, number>;
  visited: string[];
  reminders: string[];
  prefs: Prefs;
  muteUntil: number;
}

export type PublicAccount = Omit<Account, "salt" | "hash">;

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  cloak: string;
}

export interface Session {
  token: string;
  accountId: string;
  createdAt: number;
  device: string;
  position?: Position;
  movedAt?: number;
}

export interface Message {
  id: string;
  from: string;
  fromName: string;
  to: string;
  text: string;
  at: number;
}

export interface Note {
  id: string;
  accountId: string;
  kind: Kind;
  title: string;
  body: string;
  at: number;
  read: boolean;
}

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  itemId: string;
  price: number;
  at: number;
}

export interface Purchase {
  id: string;
  accountId: string;
  what: string;
  price: number;
  at: number;
  from: string;
}

export interface Db {
  version: 1;
  accounts: Record<string, Account>;
  sessions: Record<string, Session>;
  messages: Message[];
  notes: Note[];
  listings: Listing[];
  purchases: Purchase[];
  plots: Record<string, string>;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };
