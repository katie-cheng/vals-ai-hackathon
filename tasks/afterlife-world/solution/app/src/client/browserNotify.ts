// Browser notifications through the service worker. Permission is only requested from a button the player presses.
export type Permission = NotificationPermission | "unsupported";

export const notificationsSupported = () => typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;

export const permission = (): Permission => (notificationsSupported() ? Notification.permission : "unsupported");

export async function askPermission(): Promise<Permission> {
  if (!notificationsSupported()) return "unsupported";
  return Notification.requestPermission();
}

export async function registerWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

/** Shows a system notification. The note id is the tag, so several open tabs replace each other's copy instead of stacking. */
export async function showBrowserNotification(id: string, title: string, body: string) {
  if (permission() !== "granted") return false;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return false;
  await reg.showNotification(title, { body, tag: id, icon: "/icon-192.png", data: { url: "/world" } });
  return true;
}
