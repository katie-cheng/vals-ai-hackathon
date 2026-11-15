You are working in `/app`, a Vite + React + TypeScript project with its dependencies already installed.
Build the web application described in the brief below inside this project.

Delivery requirements:
- `npm run build` must succeed and write a static site to `/app/dist`. The site is served from `/app/dist` as static files at `/`, with any path that has no file extension falling back to `index.html` so client-side routes work, and opened in Chromium at desktop and phone sizes.
- The brief asks for plain HTML, CSS and vanilla JavaScript files. Build it in this React + TypeScript project instead and treat the brief's suggested file structure as a guide to splitting the code; everything else in the brief stands, including Chart.js for the charts. You may install any npm packages; the network is available.
- Keep it client-side: no Next.js, no server, no SSR, no backend. All data and preferences live in the browser (`localStorage`) and survive a reload.
- Each section of the sidebar has its own route (for example `/tasks` or `#/tasks`), linked from the navigation, and loads directly from its URL.
- The app must render without network access once built: bundle fonts and icons instead of loading them from a CDN.
- Every page must load without console errors, and every image you reference must actually load.

---

# Build LifeOS – A Premium Personal Productivity Platform
Create a polished, modern, fully responsive personal productivity web application called **LifeOS**.
The application should feel like a real premium SaaS product, combining the simplicity of Notion, the task management experience of Todoist, and the analytics of a productivity tracker.
IMPORTANT: This is a frontend-only static website. Use HTML5, CSS3, and Vanilla JavaScript. Do not require a backend, database, authentication service, or paid API.
## 1. Design System
Create a minimal, clean, professional interface.
Visual direction:
- Off-white background (#F8F9FB).
- White content cards.
- Dark charcoal text.
- Soft indigo/blue primary accent.
- Subtle gray borders.
- Rounded corners (12–16px).
- Soft shadows.
- Modern typography using Inter or Geist.
- Consistent spacing and alignment.
Avoid:
- Excessive gradients.
- Neon colors.
- Overly large rounded elements.
- Cluttered dashboards.
- Unnecessary animations.
The final design should look like a professionally designed commercial SaaS application.
## 2. Application Layout
Create a desktop-first dashboard with:
**Sidebar navigation:**
- LifeOS logo.
- Overview.
- My Tasks.
- Habits.
- Calendar.
- Focus Mode.
- Notes.
- Analytics.
- Settings.
Include active navigation highlighting and a collapsible sidebar.
**Top navigation:**
- Page title.
- Search bar.
- Notification icon.
- Current date.
- User profile avatar.
- Theme toggle.
On mobile, convert the sidebar into a responsive navigation menu.
## 3. Dashboard Overview
Create an informative dashboard with:
- Personalized greeting.
- Current date.
- Daily productivity summary.
- Total tasks.
- Completed tasks.
- Pending tasks.
- Active habits.
- Weekly productivity score.
Add:
- Today's task list.
- Habit completion overview.
- Upcoming deadlines.
- Weekly productivity chart.
- Quick action buttons.
Use realistic sample data instead of placeholder lorem ipsum.
## 4. Task Management
Build a fully functional task management module.
Users must be able to:
- Create new tasks.
- Edit existing tasks.
- Delete tasks.
- Mark tasks as completed.
- Assign priority (Low, Medium, High).
- Set due dates.
- Assign categories.
- Search tasks.
- Filter by status and priority.
- Sort by deadline or creation date.
Add visual indicators for overdue tasks and completed tasks.
Include an attractive task creation modal.
## 5. Habit Tracker
Create a dedicated habit tracking page.
Features:
- Add new habits.
- Edit and delete habits.
- Mark habits completed for today.
- Display current streaks.
- Show weekly completion history.
- Calculate habit completion percentages.
- Display progress indicators.
Include sample habits such as:
- Read 20 minutes.
- Exercise.
- Drink enough water.
- Practice coding.
- Sleep on time.
## 6. Interactive Calendar
Create a monthly calendar interface.
Features:
- Navigate between months.
- Display scheduled tasks.
- Highlight the current date.
- Click a date to see its tasks.
- Add tasks to selected dates.
- Show task completion status.
Use a clean calendar layout with subtle visual indicators.
## 7. Focus Mode – Pomodoro Timer
Build a working Pomodoro timer.
Features:
- 25-minute focus session.
- 5-minute short break.
- 15-minute long break.
- Start, pause and reset controls.
- Session completion tracking.
- Focus session history.
Allow users to customize focus and break durations.
The timer must actually work using JavaScript.
## 8. Notes Manager
Create a personal notes section.
Features:
- Create notes.
- Edit notes.
- Delete notes.
- Search notes.
- Organize notes using categories.
- Pin important notes.
- Display last modified date.
Save all notes locally.
## 9. Analytics Dashboard
Create an analytics page with interactive charts.
Display:
- Daily task completion.
- Weekly productivity trends.
- Habit consistency.
- Focus hours.
- Task distribution by priority.
- Overall completion rate.
Use Chart.js for charts.
Charts must update when the underlying data changes.
## 10. Settings
Include:
- Light and dark themes.
- User display name customization.
- Pomodoro duration settings.
- Productivity preferences.
- Clear all local application data option with confirmation.
Persist preferences using localStorage.
## 11. JavaScript Functionality
This is a critical requirement.
Every visible interactive element must work.
Implement:
- CRUD operations for tasks, habits and notes.
- LocalStorage persistence.
- Dynamic search.
- Filtering and sorting.
- Working Pomodoro timer.
- Calendar navigation.
- Theme switching.
- Dynamic charts.
- Habit streak calculations.
- Task statistics.
- Toast notifications.
- Confirmation dialogs.
- Empty states and validation messages.
Do not create fake buttons or non-functional UI elements.
Data must persist after refreshing or reopening the browser.
## 12. Animations and User Experience
Use subtle professional animations:
- Smooth page transitions.
- Card hover effects.
- Button feedback.
- Modal fade-in animations.
- Progress bar animations.
- Sidebar transitions.
- Toast notifications.
Respect reduced-motion accessibility preferences.
## 13. Technical Requirements
Use:
- HTML5.
- CSS3.
- Vanilla JavaScript.
- Chart.js for analytics.
- Lucide icons or another lightweight icon library.
Organize the code into reusable functions and separate files.
Suggested project structure:
lifeos/
├── index.html
├── css/
│ └── style.css
├── js/
│ ├── app.js
│ ├── tasks.js
│ ├── habits.js
│ ├── calendar.js
│ ├── timer.js
│ ├── notes.js
│ └── analytics.js
├── assets/
│ └── images/
└── README.md
## 14. Quality Requirements
- Fully responsive on desktop, tablet and mobile.
- No broken layouts.
- No JavaScript console errors.
- No non-functional buttons.
- Proper input validation.
- Accessible color contrast.
- Semantic HTML.
- Clean and maintainable code.
- Consistent UI components.
- Realistic sample data on first launch.
## Final Objective
Deliver a complete, polished, functional static productivity web application.
The result should look like a real SaaS product that could be showcased in a professional frontend developer portfolio.
Prioritize functionality, design consistency, clean architecture, and user experience over unnecessary visual effects.
