export type Toast = { id: string; title: string; body: string };

export const notificationsSupported = () => typeof window !== "undefined" && "Notification" in window;

export function permission(): NotificationPermission | "unsupported" {
  return notificationsSupported() ? Notification.permission : "unsupported";
}

/** Shows a system notification when allowed. Returns whether one was shown. */
export function systemNotify(title: string, body: string) {
  if (!notificationsSupported() || Notification.permission !== "granted") return false;
  try {
    new Notification(title, { body, icon: "/favicon.svg", tag: title });
    return true;
  } catch {
    return false;
  }
}
