You are working in `/app`, a Vite + React + TypeScript project with its dependencies already installed.
Build the scoreboard described in the brief below inside this project.

Delivery requirements:
- `npm run build` must succeed and write a static site to `/app/dist`. The site is served from `/app/dist` as static files at `/`, with any path that has no file extension falling back to `index.html` so client-side routes work, and opened in Chromium at desktop and phone sizes.
- The brief asks for one HTML file; deliver it as this client-side Vite + React app instead: no Next.js, no server, no SSR. You may install any npm packages; the network is available while you build, but not when the site is reviewed, so bundle any fonts and images you use.
- There is no backend. Teams, logos and scores live in the browser (for example `localStorage`) and survive a reload.
- The scoreboard is the home page. The operator page is its own route, linked from the scoreboard. If you protect it with a PIN or password, show the demo one on its lock screen.
- The operator adds team logos by uploading image files from their computer. No team list and no logos are provided: the real teams are entered on the night.
- In a fresh browser the site shows a sample league of at least four teams with scores, marked as sample data, so the scoreboard has something to show; the operator can remove or replace them.
- The scoreboard and the operator page may be open in two tabs of the same browser (a projector and a laptop): a change made on the operator page shows on the scoreboard without a reload.
- Every page must load without console errors, and every image you reference must actually load.

---

The task is to make a custom Html file for displaying scores of teams for a quiz competition The name of the competition is JCQL(Jagadish Chandra quiz league) this is happening in our hostel Jagadish Abas
the ui will be super aesthetic and not ai sloppy and it have to have good visuals 
And the most important thing I want it to have a page for me as a operator where I can add the names of the teams and the logos and always the teams will be sorted with according to there score high to low
feel free to add anything that I may miss for the functionality and design 
make no mistakes
