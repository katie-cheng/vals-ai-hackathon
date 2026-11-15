// The real-time link between open tabs of this browser. It stands in for the WebSocket connection to the world server:
// every event goes to the other tabs over BroadcastChannel and to listeners in this tab.
import type { Message, Note } from "./types";

export interface PeerState {
  tab: string;
  accountId: string;
  name: string;
  cloak: string;
  x: number;
  z: number;
  y: number;
  ry: number;
  at: number;
}

export type BusEvent =
  | { t: "changed"; ids: string[] }
  | { t: "note"; note: Note }
  | { t: "chat"; message: Message }
  | { t: "presence"; peer: PeerState }
  | { t: "leave"; tab: string }
  | { t: "emote"; tab: string; name: string; emote: string };

type Listener = (e: BusEvent) => void;

const listeners = new Set<Listener>();
const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("afterlife-world-v1") : null;
channel?.addEventListener("message", (e: MessageEvent<BusEvent>) => listeners.forEach((l) => l(e.data)));

export const TAB_ID = crypto.randomUUID();

export const bus = {
  live: !!channel,
  emit(e: BusEvent, { local = true } = {}) {
    channel?.postMessage(e);
    if (local) listeners.forEach((l) => l(e));
  },
  on(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
