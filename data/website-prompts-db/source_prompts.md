# Website Generation Prompts

A system prompt plus 26 scenario prompts for testing website generation. All business names and details are fictional.

## System prompt

```
You are a senior front-end engineer and visual designer. Your job is to turn the user's request into a single, complete HTML file that will be rendered directly inside a sandboxed iframe, with no build step and no other files.

Output format:
Return ONLY the HTML document, starting with <!DOCTYPE html> and ending with </html>. Do not add explanations, comments to the user, or markdown code fences.

Technical requirements:
1. Everything lives in one file: CSS in <style> tags, JavaScript in <script> tags.
2. Use plain HTML, CSS, and JavaScript. You may load libraries from a CDN when they improve the result: Tailwind CSS for styling; Three.js, React Three Fiber, drei, @react-three/postprocessing, and @react-three/cannon for 3D; D3 and Recharts for data visualization.
3. Include every script tag, import map, or module import a library needs to run. If you use React-based libraries, load React and set up the imports so the page works without a bundler.
4. Do not reference local files or images that may not exist. Draw visuals with inline SVG, CSS gradients, or canvas instead.
5. The page must load without console errors, and every button, link, form, tab, filter, and toggle you include must do something.

Design requirements:
6. Choose a visual direction that fits the subject (colors, typography, spacing, tone) rather than using the same generic template for every request.
7. Build a clear visual hierarchy with readable type, consistent spacing, and sufficient color contrast.
8. Make the layout fully responsive, from a 360px phone screen to a wide desktop, with touch-friendly controls on mobile.
9. Add polish where it helps: hover and focus states, smooth transitions, and scroll or entrance animations. Keep motion purposeful and respect prefers-reduced-motion.
10. Use semantic HTML, labels on form fields, and alt text or aria-labels where needed.

Content requirements:
11. Follow every specific detail the user gives (names, text, addresses, numbers, sections, colors) exactly as written.
12. When the request is short or vague, make sensible decisions yourself and deliver a complete, multi-section site instead of asking questions.
13. Write realistic, specific copy and sample data that fit the subject. Never use lorem ipsum or empty placeholder sections.
14. If the request describes a feature for an existing product, build a self-contained version of the surrounding interface so the feature can be seen and used in context.
15. Forms and data should work on the client only: validate input, show a success or result state, and use in-memory state or localStorage instead of a real backend.

Aim for something that looks and behaves like a finished, shipped product.
```

## Scenario prompts

### Portfolios and personal

**1.** A portfolio website for a wedding photographer named Lena Okafor. It should feel calm and editorial, with a full-screen gallery, an about section, three pricing packages, and a contact form.

**2.** Build me a developer portfolio with a 3D hero using Three.js, something like floating geometric shapes that react to the mouse. Sections: About, Projects (6 cards with tags and hover effects), Skills, Experience timeline, Contact. Dark theme with one accent color.

**3.** I need a one-page resume site I can also print. Name: Daniel Reyes, Senior Product Designer, 8 years of experience. Include a summary, work history with 3 roles, skills, education, and a "Download PDF" button that triggers the print dialog with a clean print stylesheet.

**4.** A birthday surprise website titled "For Maya, 25" with a countdown, a scrolling timeline of memories with placeholder photos, a section of reasons she's loved, and confetti when you click the cake at the end.

**5.** make a website for my cat

### Company and local business

**6.** Create a website for Halden & Pryce, a boutique corporate law firm. It needs to look trustworthy and premium, with practice areas, attorney profiles, case results in numbers, client testimonials, and a consultation request form.

**7.** Create a website for Saffron Courtyard, a North Indian restaurant at 42 Lakeview Road, Indiranagar, Bengaluru 560038, phone 080 5550 0142. Show a 4.7-star rating from 1,204 reviews, hours 12 pm to 11:30 pm daily, a menu with Starters, Tandoor, Curries, Biryani and Desserts with prices in rupees, a table reservation form, a photo gallery, and a map section for directions.

**8.** Website for BrightSmile Dental Clinic. Include services (cleaning, whitening, braces, implants, root canal, pediatric dentistry), a doctors section with 3 dentists, insurance accepted, opening hours Monday to Saturday 9 am to 7 pm, a review summary highlighting gentle staff and short wait times, and an appointment booking form that validates input and shows a confirmation.

**9.** A real estate listings page for a fictional agency called Northgate Homes. Show 12 property cards with price, beds, baths and area, and working filters for price range, bedrooms and property type. Clicking a card opens a modal with details and a mortgage estimate.

**10.** We are a small logistics company called Kestrel Freight. Build a corporate homepage with a shipment tracking input that returns a fake status timeline, a services grid, a map-style coverage section drawn in SVG, key stats that count up on scroll, and a quote request form.

### Landing pages and marketing

**11.** SaaS landing page for "Tallybook", an invoicing tool for freelancers. Hero with a product mockup built in HTML/CSS, a logo strip of made-up customers, 3 feature sections, a pricing table with a monthly/yearly toggle that updates prices, FAQ accordion, and footer.

**12.** Landing page for a meditation mobile app called Stillwater. Soft gradients, a phone mockup showing the app screen in pure CSS, a breathing animation people can follow, feature highlights, testimonials, and app store buttons.

**13.** A conference website for "DevSummit Lisbon 2027", a 3-day developer conference. Countdown to the event, speaker grid, a schedule with tabs for each day and track filters, ticket tiers, venue info, and sponsors.

**14.** A donation page for a nonprofit called Clean Rivers Trust. Tell the story with scroll animations, show a progress bar toward a $250,000 goal, preset donation amounts plus a custom one, a monthly-giving toggle, and an impact section that changes its text based on the amount selected.

**15.** A wedding invitation site for Aarav & Sofia, 14 February 2027, in Udaipur. Elegant and romantic, with their story, event schedule (Mehendi, Sangeet, Wedding, Reception), venue and travel info, a live countdown, and an RSVP form with meal preference.

### Rebuild-style, heavily specified

**16.** I'm practicing for my front-end class by rebuilding a travel site homepage for a fictional company called Wayfarely, as one HTML file. Here's what I want: - Thin dark promo bar at the top with "Summer sale: up to 30% off select stays" and a close button that hides it - White nav with a small orange compass logo and "wayfarely" wordmark on the left, links for Stays, Flights, Cars, Packages and Deals, and a "Sign in" button on the right - Hero with a soft sky gradient, headline "Where to next?" and a search card with tabs for Stays and Flights, destination input, two date fields and a guests dropdown - A row of 4 destination cards below using CSS gradients instead of photos - No image files, everything in SVG or CSS

**17.** Rebuild a news magazine front page for a made-up publication called The Meridian Post. Top bar with today's date and a subscribe button, a centered serif masthead, a category nav, one large lead story with two smaller stories beside it, a "Most Read" numbered list in a sidebar, an opinion row with author avatars drawn in SVG, and a newsletter signup in the footer. It should reflow nicely to a single column on mobile.

### Dashboards and data

**18.** Build a sales analytics dashboard using Recharts. Include KPI cards for revenue, orders, conversion rate and average order value, a revenue line chart with a 7d/30d/90d switch, a bar chart of sales by category, a donut chart of traffic sources, and a sortable table of recent orders. Use realistic mock data and a collapsible sidebar.

**19.** After the supplier scoring step, add a "Risk Assessment" panel that asks users about their sourcing setup. The inputs should include: 1. Sourcing country 2. Component category 3. Annual order volume 4. Lead time tolerance 5. Compliance requirements. Make sure this is integrated into the existing dashboard for our AI-Assisted Supplier Selection tool and outputs a ranked list of suppliers with a risk score and a short explanation for each.

**20.** Create an interactive D3 visualization that explains how a city's bike-share trips change over a day. Use generated data for 20 stations, an hour slider with a play button, circles sized by trip volume on an abstract map, and a linked bar chart showing the busiest stations for the selected hour.

**21.** A personal finance tracker. I should be able to add income and expenses with a category and date, see my balance update, view a monthly spending breakdown chart, set a budget per category with warnings when I go over, and have everything saved in localStorage.

### Interactive apps, 3D, and games

**22.** Build a 3D product configurator for a fictional sneaker called the Aero One using Three.js. Since there are no model files, build a stylized shoe from primitive shapes. Let users orbit the camera, change colors for the sole, body and laces from swatches, and see the price update in a side panel with an "Add to cart" button.

**23.** A kanban board app like a simple project tool. Three default columns (To Do, In Progress, Done), add/edit/delete cards, drag and drop between columns, colored labels, a search box that filters cards, and a dark mode toggle.

**24.** Make a typing speed test game. Show a random paragraph, highlight correct and incorrect characters as I type, a 60-second timer, live WPM and accuracy, a results screen with a chart of my WPM over time, and a local leaderboard of my best scores.

**25.** An online store page for a small candle brand called Ember & Oak. Product grid with 8 candles, filter by scent family, quick-view modal, a slide-out cart with quantity controls and a running total, a free-shipping progress bar at $50, and a checkout form that validates but doesn't submit anywhere.

### General

**26.** Create a modern, professional website for a small business. Include a navigation bar, a hero section with a headline and call-to-action button, an about section, a services or features section, customer testimonials, a contact form, and a footer with social links. It should be fully responsive and have smooth animations.

## Reusable template

Fill in the brackets to write a new scenario:

> Create a website for **[name]**, a **[type of business or person]**. The style should be **[mood/look]**. Include these sections: **[list]**. Key details to show: **[address, hours, prices, stats, etc.]**. Interactive elements: **[forms, filters, toggles, etc.]**.