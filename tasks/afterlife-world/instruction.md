You are working in `/app`, a Vite + React + TypeScript project with its dependencies already installed.
Build the product described in the brief below inside this project.

Delivery requirements:
- `npm run build` must succeed and write a static site to `/app/dist`. The site is served from `/app/dist` as static files at `/` (unknown paths fall back to `index.html`) and opened in Chromium at desktop sizes with a keyboard and mouse and at phone and tablet sizes with touch.
- Keep it a client-side Vite + React app: no Next.js, no server, no SSR. You may install any npm packages; the network is available. WebGL is available, but in a software renderer, so the world must stay usable at a low frame rate.
- There is no backend, push server or WebSocket server for this build. Stand in for the shared backend inside the browser: accounts, profiles, inventory, currency, friends, messages, properties, purchases and progress persist in the browser (for example IndexedDB or `localStorage`) and pass through one validation layer that plays the server's role. Two tabs of the same browser stand in for two devices on that backend: chat and other changes made in one must reach the other in real time without a reload (for example over `BroadcastChannel` in place of WebSockets).
- No push credentials (VAPID keys or a Firebase project) exist, and there is no Android SDK or signing keystore, so no APK can be built or signed here. The brief says what to do when signing credentials or build infrastructure are unavailable; delivery to a closed browser is in the same position.
- The page must load without console errors, and every image you reference must actually load.

---

<PLATFORM\_AND\_DEVICE\_SUPPORT>
Build AFTERLIFE as a fully responsive 3D multiplayer virtual world accessible directly through web browsers on Android phones, iPhones, tablets, laptops, and desktop computers. Do not require installation to use the website. Adapt controls, graphics quality, interface, and 3D performance automatically to each device. Support keyboard and mouse on computers and touch controls with virtual joysticks on mobile devices.
</PLATFORM\_AND\_DEVICE\_SUPPORT>

<REAL\_NOTIFICATION\_SYSTEM>
Implement real notifications using Web Push API, Service Workers, and a secure push notification backend. Request notification permission only after user consent. Support notifications for friend requests, messages, invitations, events, purchases, marketplace activity, and important account updates. Deliver notifications even when the website is not currently open, where the browser and operating system support it. Include notification preferences, mute controls, unread counts, and notification history. Add real-time in-app notifications using WebSockets. Never simulate successful delivery.
</REAL\_NOTIFICATION\_SYSTEM>

<REAL\_ANDROID\_APK>
Keep the complete AFTERLIFE website available in browsers. Additionally, create a separate installable Android APK that provides a genuine mobile AFTERLIFE experience. Use a properly configured Android project with a secure connection to the same backend, account system, multiplayer services, and notifications. Implement push notifications through Firebase Cloud Messaging or an equivalent real push service. Generate a genuine signed release APK using a valid Android signing keystore. Provide APK download on the website, display the actual version and file size, and verify the generated APK before publishing it. Preserve the signing key securely and document the signing process. Never provide a fake APK, unsigned release, broken download, or fabricated download counter. If signing credentials or build infrastructure are unavailable, clearly identify what is required instead of claiming completion.
</REAL\_ANDROID\_APK>

<SHARED\_BACKEND>
The website and Android APK must use the same real accounts, player profiles, inventory, currency, friends, messages, properties, purchases, and saved progress. Changes made on one device must synchronize with other devices. Implement secure authentication, database persistence, real-time multiplayer communication, and server-side validation.
</SHARED\_BACKEND>
