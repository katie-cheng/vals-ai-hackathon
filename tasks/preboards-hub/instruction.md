You are working in `/app`, a Vite + React + TypeScript project with its dependencies already installed.
Build the web application described in the brief below inside this project.

Delivery requirements:
- The brief asks for a single HTML file; build it as a multi-file Vite + React app in this project instead. `npm run build` must succeed and write a static site to `/app/dist`. The site is served from `/app/dist` as static files at `/` and opened in Chromium at desktop and phone sizes.
- Keep it a client-side Vite + React app: no Next.js, no server, no SSR. You may install any npm packages; the network is available during development.
- The site may be reviewed without network access, so bundle everything it needs: install Tailwind CSS from npm (for example `tailwindcss` with `@tailwindcss/vite`) instead of the CDN script the brief mentions, and bundle the font files (for example from `@fontsource`) instead of linking a font CDN.
- There is no backend and no AI service. The voice companion answers from the app's own data in the browser, and speaks with `window.speechSynthesis`.
- Everything the brief asks to keep is saved in `localStorage` and must survive a page reload.
- The page must load without console errors, and every image you reference must actually load.

---

Build a complete, single-file HTML/CSS/JS web application for a Minimalist Glassmorphism Study & Exam Countdown Hub ("Preboards Hub") with interactive widgets and an integrated AI voice companion.

### 1. Visual Design & UI (Minimal Glassmorphism):
- Theme: Dark/Light mode toggle with smooth transitions. Use a sleek dark slate background (e.g., #0f172a) in dark mode or a clean soft gray in light mode.
- Style: Frosted glass elements (backdrop-filter: blur(16px), semi-transparent white/dark cards, subtle borders, and smooth shadows). Use Tailwind CSS via CDN.
- Typography: Clean modern font ("Plus Jakarta Sans" or "Inter").

### 2. Core Interactive Features:
- Live Countdown Timer: Large, precise countdown tracking down to Days, Hours, Minutes, and Seconds targeting November 27. Include a settings modal to change the target date/time.
- Subject & Status Tracker: A list of exam subjects (e.g., Math, Physics) with status badges ("Not Started", "In Progress", "Revise", "Mastered") that users can cycle through by clicking. Allow adding/deleting subjects.
- Daily Study Goals Checklist: An interactive task list where users can add daily goals, check them off (with strikethrough animation), and view a dynamic progress bar percentage.
- Focus Pomodoro Timer: A built-in 25-minute study / 5-minute break timer with Start, Pause, Reset, and Mode toggle controls.
- Daily Motivation: A randomized study quote card with a button to shuffle quotes.

### 3. Interactive AI Voice Companion (Speech Synthesis & Voice UI):
- Add a floating or header "AI Voice Companion" widget featuring an animated sound wave or pulsing orb visualizer.
- Include a text input or quick-action buttons where the user can ask questions or prompt study motivation.
- Use the browser's native SpeechSynthesis API (window.speechSynthesis) to have the AI voice read out motivational study tips, daily summaries, or countdown status alerts aloud when clicked or when a session completes.

### 4. Smart Reminders & Notifications:
- Request Notification permissions on load or via a button toggle.
- Set up automated browser notifications or visual alerts when study goals are due, when the Pomodoro break ends, or when daily countdown milestones are hit.
- Persistence: Save all tasks, subject statuses, theme choices, and custom countdown dates locally using localStorage so nothing is lost on refresh
