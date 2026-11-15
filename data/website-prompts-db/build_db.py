"""Parse source_prompts.md into prompts.json, prompts.jsonl, prompts.csv and prompts.db."""
import csv
import json
import re
import sqlite3
from pathlib import Path

ROOT = Path(__file__).parent
SRC = (ROOT / "source_prompts.md").read_text()

LIBRARIES = ["Three.js", "Recharts", "D3", "Tailwind", "React"]

META = {
    1: dict(slug="wedding-photographer-portfolio", title="Lena Okafor wedding photography portfolio", entity="Lena Okafor",
            requirements=["Calm, editorial visual style", "Full-screen gallery", "About section", "Three pricing packages", "Contact form"]),
    2: dict(slug="developer-portfolio-3d", title="Developer portfolio with Three.js hero", entity=None,
            requirements=["Three.js 3D hero of floating geometric shapes", "Shapes react to mouse", "About section", "Projects section with 6 cards with tags and hover effects", "Skills section", "Experience timeline", "Contact section", "Dark theme with one accent color"]),
    3: dict(slug="printable-resume", title="Daniel Reyes printable resume", entity="Daniel Reyes",
            requirements=["Name Daniel Reyes", "Title Senior Product Designer", "8 years of experience", "Summary", "Work history with 3 roles", "Skills", "Education", "\"Download PDF\" button opens print dialog", "Clean print stylesheet"]),
    4: dict(slug="birthday-surprise", title="\"For Maya, 25\" birthday surprise", entity="Maya",
            requirements=["Title \"For Maya, 25\"", "Countdown", "Scrolling timeline of memories with placeholder photos", "Section of reasons she's loved", "Clickable cake at the end triggers confetti"]),
    5: dict(slug="cat-website", title="Website for my cat", entity=None,
            requirements=["Complete multi-section site about a cat despite vague request"]),
    6: dict(slug="corporate-law-firm", title="Halden & Pryce law firm", entity="Halden & Pryce",
            requirements=["Trustworthy, premium look", "Practice areas", "Attorney profiles", "Case results in numbers", "Client testimonials", "Consultation request form"]),
    7: dict(slug="indian-restaurant", title="Saffron Courtyard restaurant", entity="Saffron Courtyard",
            requirements=["Address 42 Lakeview Road, Indiranagar, Bengaluru 560038", "Phone 080 5550 0142", "4.7-star rating from 1,204 reviews", "Hours 12 pm to 11:30 pm daily", "Menu with Starters, Tandoor, Curries, Biryani and Desserts", "Menu prices in rupees", "Table reservation form", "Photo gallery", "Map section for directions"]),
    8: dict(slug="dental-clinic", title="BrightSmile Dental Clinic", entity="BrightSmile Dental Clinic",
            requirements=["Services: cleaning, whitening, braces, implants, root canal, pediatric dentistry", "Doctors section with 3 dentists", "Insurance accepted", "Hours Monday to Saturday 9 am to 7 pm", "Review summary highlighting gentle staff and short wait times", "Appointment booking form validates input", "Booking form shows confirmation"]),
    9: dict(slug="real-estate-listings", title="Northgate Homes listings", entity="Northgate Homes",
            requirements=["12 property cards", "Cards show price, beds, baths and area", "Working price range filter", "Working bedrooms filter", "Working property type filter", "Clicking a card opens a details modal", "Modal includes mortgage estimate"]),
    10: dict(slug="logistics-homepage", title="Kestrel Freight corporate homepage", entity="Kestrel Freight",
             requirements=["Shipment tracking input returns fake status timeline", "Services grid", "Map-style coverage section drawn in SVG", "Key stats count up on scroll", "Quote request form"]),
    11: dict(slug="saas-invoicing-landing", title="Tallybook SaaS landing page", entity="Tallybook",
             requirements=["Hero with product mockup built in HTML/CSS", "Logo strip of made-up customers", "3 feature sections", "Pricing table", "Monthly/yearly toggle updates prices", "FAQ accordion", "Footer"]),
    12: dict(slug="meditation-app-landing", title="Stillwater meditation app landing page", entity="Stillwater",
             requirements=["Soft gradients", "Phone mockup of app screen in pure CSS", "Followable breathing animation", "Feature highlights", "Testimonials", "App store buttons"]),
    13: dict(slug="developer-conference", title="DevSummit Lisbon 2027 conference", entity="DevSummit Lisbon 2027",
             requirements=["3-day developer conference", "Countdown to the event", "Speaker grid", "Schedule with tabs for each day", "Schedule track filters", "Ticket tiers", "Venue info", "Sponsors"]),
    14: dict(slug="nonprofit-donation", title="Clean Rivers Trust donation page", entity="Clean Rivers Trust",
             requirements=["Story told with scroll animations", "Progress bar toward $250,000 goal", "Preset donation amounts", "Custom donation amount", "Monthly-giving toggle", "Impact section text changes with selected amount"]),
    15: dict(slug="wedding-invitation", title="Aarav & Sofia wedding invitation", entity="Aarav & Sofia",
             requirements=["Couple Aarav & Sofia", "Date 14 February 2027", "Location Udaipur", "Elegant, romantic style", "Their story", "Event schedule: Mehendi, Sangeet, Wedding, Reception", "Venue and travel info", "Live countdown", "RSVP form with meal preference"]),
    16: dict(slug="travel-site-rebuild", title="Wayfarely travel homepage rebuild", entity="Wayfarely",
             requirements=["Thin dark promo bar with \"Summer sale: up to 30% off select stays\"", "Promo bar close button hides it", "White nav with small orange compass logo", "\"wayfarely\" wordmark on the left", "Nav links: Stays, Flights, Cars, Packages, Deals", "\"Sign in\" button on the right", "Hero with soft sky gradient", "Headline \"Where to next?\"", "Search card with Stays and Flights tabs", "Destination input, two date fields and guests dropdown", "Row of 4 destination cards using CSS gradients", "No image files; everything SVG or CSS"]),
    17: dict(slug="news-magazine-rebuild", title="The Meridian Post front page rebuild", entity="The Meridian Post",
             requirements=["Top bar with today's date", "Subscribe button", "Centered serif masthead", "Category nav", "One large lead story with two smaller stories beside it", "\"Most Read\" numbered list in sidebar", "Opinion row with SVG author avatars", "Newsletter signup in footer", "Reflows to single column on mobile"]),
    18: dict(slug="sales-dashboard", title="Recharts sales analytics dashboard", entity=None,
             requirements=["Uses Recharts", "KPI cards: revenue, orders, conversion rate, average order value", "Revenue line chart", "7d/30d/90d switch", "Bar chart of sales by category", "Donut chart of traffic sources", "Sortable recent orders table", "Realistic mock data", "Collapsible sidebar"]),
    19: dict(slug="supplier-risk-assessment", title="Supplier Selection risk assessment panel", entity="AI-Assisted Supplier Selection",
             requirements=["Risk Assessment panel after supplier scoring step", "Input: sourcing country", "Input: component category", "Input: annual order volume", "Input: lead time tolerance", "Input: compliance requirements", "Integrated into surrounding supplier selection dashboard", "Outputs ranked list of suppliers", "Each supplier has a risk score", "Each supplier has a short explanation"]),
    20: dict(slug="bike-share-d3", title="D3 bike-share trips visualization", entity=None,
             requirements=["Uses D3", "Generated data for 20 stations", "Hour slider", "Play button animates hours", "Circles sized by trip volume on abstract map", "Linked bar chart of busiest stations for selected hour"]),
    21: dict(slug="finance-tracker", title="Personal finance tracker", entity=None,
             requirements=["Add income and expenses", "Entries have category and date", "Balance updates", "Monthly spending breakdown chart", "Budget per category", "Warnings when over budget", "Everything saved in localStorage"]),
    22: dict(slug="sneaker-configurator-3d", title="Aero One Three.js sneaker configurator", entity="Aero One",
             requirements=["Uses Three.js", "Stylized shoe built from primitive shapes", "Orbit camera controls", "Color swatches for sole", "Color swatches for body", "Color swatches for laces", "Side panel price updates", "\"Add to cart\" button"]),
    23: dict(slug="kanban-board", title="Kanban board app", entity=None,
             requirements=["Default columns To Do, In Progress, Done", "Add cards", "Edit cards", "Delete cards", "Drag and drop between columns", "Colored labels", "Search box filters cards", "Dark mode toggle"]),
    24: dict(slug="typing-speed-test", title="Typing speed test game", entity=None,
             requirements=["Random paragraph", "Highlights correct and incorrect characters", "60-second timer", "Live WPM", "Live accuracy", "Results screen with WPM-over-time chart", "Local leaderboard of best scores"]),
    25: dict(slug="candle-store", title="Ember & Oak candle store", entity="Ember & Oak",
             requirements=["Product grid with 8 candles", "Filter by scent family", "Quick-view modal", "Slide-out cart", "Cart quantity controls", "Running total", "Free-shipping progress bar at $50", "Checkout form validates without submitting"]),
    26: dict(slug="generic-small-business", title="Generic small business website", entity=None,
             requirements=["Navigation bar", "Hero with headline and call-to-action button", "About section", "Services or features section", "Customer testimonials", "Contact form", "Footer with social links", "Fully responsive", "Smooth animations"]),
}


def specificity(prompt: str) -> str:
    words = len(prompt.split())
    if words < 15:
        return "vague"
    if words < 60:
        return "moderate"
    return "heavy"


def parse():
    system_prompt = re.search(r"## System prompt\s+```\n(.*?)\n```", SRC, re.S).group(1)
    scenarios_md = SRC.split("## Scenario prompts", 1)[1].split("## Reusable template", 1)[0]
    template = re.search(r"## Reusable template.*?\n> (.*)", SRC, re.S).group(1).strip()

    prompts = []
    category = None
    for line in scenarios_md.splitlines():
        if line.startswith("### "):
            category = line[4:].strip()
            continue
        m = re.match(r"\*\*(\d+)\.\*\*\s+(.*)", line)
        if not m:
            continue
        num, text = int(m.group(1)), m.group(2).strip()
        meta = META[num]
        prompts.append({
            "id": num,
            "task_id": f"{num:02d}-{meta['slug']}",
            "category": category,
            "title": meta["title"],
            "entity": meta["entity"],
            "prompt": text,
            "word_count": len(text.split()),
            "specificity": specificity(text),
            "libraries": [lib for lib in LIBRARIES if re.search(rf"\b{re.escape(lib)}\b", text)],
            "requirements": meta["requirements"],
        })
    assert [p["id"] for p in prompts] == list(range(1, 27)), "expected 26 scenario prompts"
    return system_prompt, template, prompts


def write(system_prompt, template, prompts):
    (ROOT / "system_prompt.txt").write_text(system_prompt + "\n")
    (ROOT / "prompts.json").write_text(json.dumps(
        {"system_prompt": system_prompt, "template": template, "prompts": prompts}, indent=2, ensure_ascii=False) + "\n")
    with open(ROOT / "prompts.jsonl", "w") as f:
        for p in prompts:
            f.write(json.dumps(p, ensure_ascii=False) + "\n")
    with open(ROOT / "prompts.csv", "w", newline="") as f:
        cols = ["id", "task_id", "category", "title", "entity", "specificity", "word_count", "libraries", "requirements", "prompt"]
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for p in prompts:
            w.writerow({**p, "libraries": "; ".join(p["libraries"]), "requirements": "; ".join(p["requirements"])})

    db = ROOT / "prompts.db"
    db.unlink(missing_ok=True)
    con = sqlite3.connect(db)
    con.executescript("""
        CREATE TABLE system_prompt (id INTEGER PRIMARY KEY, text TEXT NOT NULL, template TEXT NOT NULL);
        CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL);
        CREATE TABLE prompts (
            id INTEGER PRIMARY KEY,
            task_id TEXT UNIQUE NOT NULL,
            category_id INTEGER NOT NULL REFERENCES categories(id),
            title TEXT NOT NULL,
            entity TEXT,
            specificity TEXT NOT NULL CHECK (specificity IN ('vague', 'moderate', 'heavy')),
            word_count INTEGER NOT NULL,
            prompt TEXT NOT NULL
        );
        CREATE TABLE prompt_libraries (prompt_id INTEGER REFERENCES prompts(id), library TEXT NOT NULL, PRIMARY KEY (prompt_id, library));
        CREATE TABLE requirements (
            id INTEGER PRIMARY KEY,
            prompt_id INTEGER NOT NULL REFERENCES prompts(id),
            position INTEGER NOT NULL,
            text TEXT NOT NULL
        );
        CREATE VIEW prompts_full AS
            SELECT p.id, p.task_id, c.name AS category, p.title, p.entity, p.specificity, p.word_count,
                   (SELECT group_concat(library, ', ') FROM prompt_libraries l WHERE l.prompt_id = p.id) AS libraries,
                   (SELECT count(*) FROM requirements r WHERE r.prompt_id = p.id) AS n_requirements,
                   p.prompt
            FROM prompts p JOIN categories c ON c.id = p.category_id;
    """)
    con.execute("INSERT INTO system_prompt VALUES (1, ?, ?)", (system_prompt, template))
    cats = {}
    for p in prompts:
        if p["category"] not in cats:
            cats[p["category"]] = con.execute("INSERT INTO categories (name) VALUES (?)", (p["category"],)).lastrowid
        con.execute("INSERT INTO prompts VALUES (?,?,?,?,?,?,?,?)",
                    (p["id"], p["task_id"], cats[p["category"]], p["title"], p["entity"], p["specificity"], p["word_count"], p["prompt"]))
        con.executemany("INSERT INTO prompt_libraries VALUES (?,?)", [(p["id"], lib) for lib in p["libraries"]])
        con.executemany("INSERT INTO requirements (prompt_id, position, text) VALUES (?,?,?)",
                        [(p["id"], i, r) for i, r in enumerate(p["requirements"], 1)])
    con.commit()
    con.close()


if __name__ == "__main__":
    write(*parse())
