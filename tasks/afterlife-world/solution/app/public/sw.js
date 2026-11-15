// AFTERLIFE service worker: shows notifications and opens the world when one is clicked.
// The push handler is ready for the hosted push server; this build has none, so no push messages arrive yet.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body, tag: data.id, icon: "/icon-192.png", data: { url: data.url || "/world" } }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/world";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((tabs) => {
      const open = tabs.find((t) => new URL(t.url).pathname === url);
      if (open) return open.focus();
      return self.clients.openWindow(url);
    }),
  );
});
