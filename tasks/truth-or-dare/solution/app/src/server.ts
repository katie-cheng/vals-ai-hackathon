// Stand-in for the game's realtime backend. There is no server: the room lives in localStorage, shared by every tab of
// this browser, and a BroadcastChannel tells the other tab when it changes. The two phones are two tabs.
// The functions below are the "server": they validate each move and decide the spin result, so both players
// read the same room state.

export type Stage = "waiting" | "ready" | "spinning" | "choosing" | "asking" | "answering";
export type Choice = "truth" | "dare";

export interface Player {
  id: string;
  name: string;
}

export interface Spin {
  id: number;
  target: 0 | 1; // index into players: the player the bottle points at
  from: number; // bottle angle before the spin, degrees (0 points at player 1, 180 at player 2)
  to: number; // bottle angle after the spin, degrees
  startedAt: number;
  duration: number; // ms
}

export interface Message {
  id: string;
  from: string;
  text: string;
  at: number;
}

export interface Room {
  id: string;
  passcode: string;
  players: Player[];
  round: number;
  stage: Stage;
  spin: Spin | null;
  choice: Choice | null;
  question: string | null;
  messages: Message[];
  version: number;
}

const KEY = (id: string) => `tod-room-${id}`;
const SESSION = "tod-session";
const channel = new BroadcastChannel("tod-rooms");
// The bottle spins for SPIN_MS (including the small settle), then the result stays on screen for REVEAL_MS.
export const SPIN_MS = 4600;
export const REVEAL_MS = 900;

const uid = () => Math.random().toString(36).slice(2, 10);

function load(id: string): Room | null {
  const raw = localStorage.getItem(KEY(id.toUpperCase()));
  return raw ? (JSON.parse(raw) as Room) : null;
}

function save(room: Room) {
  room.version++;
  localStorage.setItem(KEY(room.id), JSON.stringify(room));
  channel.postMessage(room.id);
}

/** The stage a room is in now: a finished spin becomes the choosing stage. */
export function stageOf(room: Room, now = Date.now()): Stage {
  if (room.stage === "spinning" && room.spin && now >= room.spin.startedAt + room.spin.duration + REVEAL_MS) return "choosing";
  return room.stage;
}

export function getRoom(id: string) {
  return load(id);
}

export function createRoom(name: string, passcode: string): { room: Room; playerId: string } {
  if (!name.trim()) throw new Error("Enter your name.");
  if (passcode.trim().length < 4) throw new Error("The passcode needs at least 4 characters.");
  const letters = "BCDFGHJKLMNPQRSTVWXZ";
  let id = "";
  do id = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
  while (load(id));
  const player = { id: uid(), name: name.trim() };
  const room: Room = { id, passcode: passcode.trim(), players: [player], round: 1, stage: "waiting", spin: null, choice: null, question: null, messages: [], version: 0 };
  save(room);
  return { room, playerId: player.id };
}

export function joinRoom(id: string, name: string, passcode: string): { room: Room; playerId: string } {
  const room = load(id.trim());
  if (!room) throw new Error("No room with that ID.");
  if (room.passcode !== passcode.trim()) throw new Error("Wrong passcode.");
  if (room.players.length >= 2) throw new Error("This room already has two players.");
  if (!name.trim()) throw new Error("Enter your name.");
  const player = { id: uid(), name: name.trim() };
  room.players.push(player);
  room.stage = "ready";
  save(room);
  return { room, playerId: player.id };
}

function update(id: string, fn: (room: Room) => void) {
  const room = load(id);
  if (!room) throw new Error("The room no longer exists.");
  fn(room);
  save(room);
  return room;
}

/** The server picks the player; the bottle angle is decided here, so both phones animate to the same result. */
export function spinBottle(id: string) {
  return update(id, (room) => {
    if (stageOf(room) !== "ready") throw new Error("The bottle can't be spun now.");
    const target = Math.random() < 0.5 ? 0 : 1;
    const from = room.spin ? ((room.spin.to % 360) + 360) % 360 : 0;
    const turns = 4 + Math.floor(Math.random() * 2);
    const to = from + turns * 360 + ((target === 0 ? 0 : 180) - from + 360) % 360;
    room.spin = { id: (room.spin?.id ?? 0) + 1, target, from, to, startedAt: Date.now(), duration: SPIN_MS };
    room.stage = "spinning";
  });
}

export function choose(id: string, playerId: string, choice: Choice) {
  return update(id, (room) => {
    if (stageOf(room) !== "choosing" || room.players[room.spin!.target].id !== playerId) throw new Error("It's not your turn to choose.");
    room.stage = "asking";
    room.choice = choice;
  });
}

export function ask(id: string, playerId: string, question: string) {
  return update(id, (room) => {
    if (room.stage !== "asking" || room.players[room.spin!.target].id === playerId) throw new Error("It's not your turn to ask.");
    if (!question.trim()) throw new Error("Write a question first.");
    room.stage = "answering";
    room.question = question.trim();
  });
}

export function finishRound(id: string) {
  return update(id, (room) => {
    if (room.stage !== "answering") return;
    room.round++;
    room.stage = "ready";
    room.choice = null;
    room.question = null;
  });
}

export function sendMessage(id: string, playerId: string, text: string) {
  return update(id, (room) => {
    if (!text.trim()) return;
    room.messages.push({ id: uid(), from: playerId, text: text.trim(), at: Date.now() });
  });
}

export function leaveRoom(id: string) {
  localStorage.removeItem(KEY(id));
  channel.postMessage(id);
}

/** Calls `onChange` whenever another tab changes the room; returns the function that unsubscribes. */
export function subscribe(id: string, onChange: (room: Room | null) => void) {
  const onMessage = (e: MessageEvent) => e.data === id && onChange(load(id));
  const onStorage = (e: StorageEvent) => e.key === KEY(id) && onChange(load(id));
  channel.addEventListener("message", onMessage);
  window.addEventListener("storage", onStorage);
  return () => {
    channel.removeEventListener("message", onMessage);
    window.removeEventListener("storage", onStorage);
  };
}

/** Which room and seat this tab plays. Kept per tab, so a refresh resumes the game and a second tab is a second player. */
export interface Session {
  roomId: string;
  playerId: string;
}

export function loadSession(): Session | null {
  try {
    const s = JSON.parse(sessionStorage.getItem(SESSION) || "null") as Session | null;
    return s && load(s.roomId)?.players.some((p) => p.id === s.playerId) ? s : null;
  } catch {
    return null;
  }
}

export function saveSession(s: Session | null) {
  if (s) sessionStorage.setItem(SESSION, JSON.stringify(s));
  else sessionStorage.removeItem(SESSION);
}
