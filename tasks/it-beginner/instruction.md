You are working in `/app`, a Vite + React + TypeScript project with its dependencies already installed.
The current website is the GitHub repository the brief links to, checked out at `/app/existing-site/` (AjinLab/it-beginner-website, MIT licence): an Express, EJS and SQLite learning platform. Read its `README.md`, `db/database.js`, `routes/` and `views/`. Its curriculum (6 chapters, 42 lessons), quiz questions, cheatsheets, playground presets and features are the platform's real content; keep them, and build the improved or reconstructed site inside `/app` as the brief below asks. The lesson video files are not in the repository, so the lesson player shows a placeholder in place of the video.

Delivery requirements:
- `npm run build` must succeed and write a static site to `/app/dist`. The site is served from `/app/dist` as static files at `/`, with any path that has no file extension falling back to `index.html` so client-side routes work, and opened in Chromium at desktop and phone sizes.
- Keep it a client-side Vite + React app: no Next.js, no server, no SSR. You may install any npm packages; the network is available.
- There is no backend. Accounts, progress, notes, discussions, quiz attempts, saved snippets and certificates live in the browser (for example `localStorage`).
- Keep the demo administrator account from the current site's README (`admin@itbeginner.com`, password `admin123`) and show its email and password on the sign-in screen, so the admin area can be opened without a backend.
- Each page of the current website has its own route, linked from the navigation. The site is reviewed signed out, so the learning pages (dashboard, courses and lessons, playground, search, quizzes, resources, certificates) must work without an account.
- Every page must load without console errors, and every image you reference must actually load.

---

Website: [https://github.com/AjinLab/it-beginner-website](https://github.com/AjinLab/it-beginner-website)  
  
Improve or Reconstruct the current Website. make it production ready, proffesional one.
