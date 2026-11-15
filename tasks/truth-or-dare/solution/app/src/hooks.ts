import { useCallback, useEffect, useState } from "react";
import * as server from "./server";
import type { Room, Session } from "./server";
import { REVEAL_MS } from "./server";

/** The room this tab plays in, kept in sync with the other phone. Re-renders only when the room changes or a timed stage ends. */
export function useRoom(session: Session | null) {
  const [room, setRoom] = useState<Room | null>(() => (session ? server.getRoom(session.roomId) : null));
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!session) return setRoom(null);
    setRoom(server.getRoom(session.roomId));
    const refresh = () => setRoom(server.getRoom(session.roomId));
    const unsubscribe = server.subscribe(session.roomId, setRoom);
    // After a dropped connection or a backgrounded tab, read the latest state instead of trusting what is on screen.
    const onVisible = () => document.visibilityState === "visible" && refresh();
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      unsubscribe();
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [session]);

  // The spin ends on a clock both phones share: re-render once when the bottle stops and once when the result is revealed.
  const spinStop = room?.stage === "spinning" && room.spin ? room.spin.startedAt + room.spin.duration : 0;
  useEffect(() => {
    if (!spinStop) return;
    const timers = [spinStop, spinStop + REVEAL_MS].map((at) => setTimeout(() => setTick((n) => n + 1), Math.max(0, at - Date.now()) + 20));
    return () => timers.forEach(clearTimeout);
  }, [spinStop]);

  return [room, setRoom] as const;
}

export function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

/** Height of the on-screen keyboard (0 when closed), from the visual viewport. */
export function useKeyboardInset(active: boolean) {
  const [inset, setInset] = useState(0);
  const measure = useCallback(() => {
    const vv = window.visualViewport;
    setInset(vv ? Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)) : 0);
  }, []);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!active || !vv) return;
    measure();
    vv.addEventListener("resize", measure);
    vv.addEventListener("scroll", measure);
    return () => {
      vv.removeEventListener("resize", measure);
      vv.removeEventListener("scroll", measure);
    };
  }, [active, measure]);
  return inset;
}
