You are working in `/app`, a Vite + React + TypeScript project with its dependencies already installed.
Build the website described in the brief below inside this project.

The website the brief links to is checked out at `/source` (github.com/AjinLab/it-beginner-website at commit `eeb90a3`, MIT licence):
an Express + EJS + SQLite app. Read it there; its course data is seeded in `/source/db/database.js`. The lesson videos are not part of
the repository.

Delivery requirements:
- `npm run build` must succeed and write a static site to `/app/dist`. The site is served from `/app/dist` as static files at `/` and opened in Chromium at desktop and phone sizes. Unknown paths fall back to `index.html`.
- Keep it a client-side Vite + React app: no Next.js, no server, no SSR. You may install any npm packages; the network is available.
- There is no backend. Keep the site's course content and what a learner can do on it, with state kept in the browser. Do not put pages behind a sign-in: a visitor reaches every page by following links from the home page, and each page also loads when its URL is opened directly.
- Every page must load without console errors, and every image you reference must actually load.

---

Website: [https://github.com/AjinLab/it-beginner-website](https://github.com/AjinLab/it-beginner-website)  

Improve or Reconstruct the current Website. make it production ready, proffesional one.
