import {
  Award,
  ChartColumn,
  Compass,
  FingerprintPattern,
  Heart,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";

export const HE = [0.76, 0, 0.24, 1];
export const services = [
    {
      slug: "growth-strategy",
      name: "Growth Strategy",
      tagline: "A 90-day roadmap from where you are to where the revenue is.",
      icon: Compass,
      image: "/images/insight-1.jpg",
      description: [
        "Most teams don't have a growth problem — they have a focus problem. Ten channels, three ICPs, and no shared definition of what good looks like. Our growth strategy engagement replaces noise with a single, sequenced plan the whole company can rally behind.",
        "We audit your funnel end-to-end, size every opportunity against effort, then hand you a quarter-by-quarter roadmap with owners, budgets, and targets. You leave knowing exactly what to do, in what order, and why.",
      ],
      outcomes: [
        {
          value: 3.2,
          decimals: 1,
          suffix: "×",
          label: "avg. pipeline growth in 2 quarters",
        },
        {
          value: 90,
          suffix: "",
          label: "day roadmap, sequenced & costed",
        },
        {
          value: 41,
          prefix: "+",
          suffix: "%",
          label: "avg. lift in win rate",
        },
      ],
      deliverables: [
        "Full-funnel audit & teardown",
        "ICP & positioning refresh",
        "Channel opportunity scoring",
        "90-day sequenced roadmap",
        "Budget & hiring plan",
        "Board-ready strategy deck",
      ],
      process: [
        {
          title: "Diagnose",
          desc: "Stakeholder interviews, data deep-dive, and a ruthless audit of every funnel stage.",
        },
        {
          title: "Prioritise",
          desc: "We score every lever on impact vs. effort and kill the bottom 70%.",
        },
        {
          title: "Sequence",
          desc: "The winners become a week-by-week plan with owners and budgets.",
        },
        {
          title: "Activate",
          desc: "We launch the first sprints with your team and hand over the playbook.",
        },
      ],
    },
    {
      slug: "revenue-operations",
      name: "Revenue Operations",
      tagline: "The systems, data, and handoffs that let revenue scale without chaos.",
      icon: Workflow,
      image: "/images/case-ledger.jpg",
      description: [
        "Growth breaks operations before it breaks anything else. Leads rot in spreadsheets, marketing and sales argue about attribution, and nobody trusts the dashboard. RevOps fixes the plumbing so every new dollar of pipeline actually converts.",
        "We design your lifecycle stages, rebuild your CRM, automate the busywork, and install one source of truth for reporting — then train your team to run it without us.",
      ],
      outcomes: [
        {
          value: 63,
          prefix: "-",
          suffix: "%",
          label: "avg. reduction in lead response time",
        },
        {
          value: 98,
          suffix: "%",
          label: "CRM data accuracy after rebuild",
        },
        {
          value: 12,
          suffix: "hrs",
          label: "saved per rep, per week on average",
        },
      ],
      deliverables: [
        "Lifecycle stage redesign",
        "CRM audit & rebuild (HubSpot / Salesforce)",
        "Lead routing & scoring",
        "Automation playbooks",
        "Attribution & dashboards",
        "Team enablement training",
      ],
      process: [
        {
          title: "Map",
          desc: "We trace every lead from first touch to closed-won and find the leaks.",
        },
        {
          title: "Design",
          desc: "New stages, SLAs, routing rules, and a clean data model.",
        },
        {
          title: "Build",
          desc: "CRM rebuild, automations, and dashboards — tested with real deals.",
        },
        {
          title: "Embed",
          desc: "Training, documentation, and a 30-day hypercare window.",
        },
      ],
    },
    {
      slug: "brand-positioning",
      name: "Brand & Positioning",
      tagline: "Say the thing only you can say — and make the market believe it.",
      icon: FingerprintPattern,
      image: "/images/insight-2.jpg",
      description: [
        "Vague positioning sounds like every other firm in your space. Kora fixes this with messaging built around credibility and conversion: sharp category framing, proof-led narratives, and a visual identity that looks like the outcome you sell.",
        "The result is a brand your sales team actually uses — one-pagers, decks, and a homepage that turn skeptics into booked calls.",
      ],
      outcomes: [
        {
          value: 2.4,
          decimals: 1,
          suffix: "×",
          label: "avg. lift in demo conversion",
        },
        {
          value: 38,
          prefix: "+",
          suffix: "%",
          label: "increase in branded search",
        },
        {
          value: 6,
          suffix: " wks",
          label: "from kickoff to launch, typical",
        },
      ],
      deliverables: [
        "Category & competitive teardown",
        "Positioning & messaging house",
        "Homepage & core page copy",
        "Visual identity refresh",
        "Sales deck & one-pagers",
        "Brand guidelines",
      ],
      process: [
        {
          title: "Listen",
          desc: "Customer interviews that surface the words your buyers actually use.",
        },
        {
          title: "Frame",
          desc: "Category POV, differentiated pillars, and a message hierarchy.",
        },
        {
          title: "Design",
          desc: "Identity and key assets built to convert, not just to look good.",
        },
        {
          title: "Launch",
          desc: "Rollout plan across site, sales, and social — with measurement.",
        },
      ],
    },
    {
      slug: "performance-marketing",
      name: "Performance Marketing",
      tagline: "Paid acquisition engineered for payback period, not vanity ROAS.",
      icon: TrendingUp,
      image: "/images/insight-3.jpg",
      description: [
        "Ad platforms reward advertisers who feed them creative volume and clean data. We run performance marketing as an experimentation engine: structured testing roadmaps, creator-grade creative sprints, and budgets that follow payback — not last-click ROAS.",
        "Every account gets a growth model that ties spend to pipeline and revenue, so finance finally stops asking what marketing actually does.",
      ],
      outcomes: [
        {
          value: 3.8,
          decimals: 1,
          suffix: "×",
          label: "avg. blended ROAS across accounts",
        },
        {
          value: 34,
          prefix: "-",
          suffix: "%",
          label: "avg. CAC reduction in 120 days",
        },
        {
          value: 40,
          suffix: "+",
          label: "creative variants tested per month",
        },
      ],
      deliverables: [
        "Growth model & forecasting",
        "Account restructure",
        "Creative testing roadmap",
        "Landing page program",
        "Weekly experiment reports",
        "Creative production sprints",
      ],
      process: [
        {
          title: "Model",
          desc: "We build your unit economics into a spend model with payback targets.",
        },
        {
          title: "Test",
          desc: "Structured creative and audience experiments, 10+ per month.",
        },
        {
          title: "Scale",
          desc: "Winners get budget; losers get killed fast. No sacred cows.",
        },
        {
          title: "Compound",
          desc: "Learnings feed landing pages, email, and organic — the whole funnel.",
        },
      ],
    },
    {
      slug: "sales-enablement",
      name: "Sales Enablement",
      tagline: "Turn founder-led magic into a repeatable, team-led sales motion.",
      icon: Users,
      image: "/images/case-nova.jpg",
      description: [
        "The founder closes; everyone else struggles. That gap is a process problem, not a talent problem. We codify what works into stages, talk tracks, mutual action plans, and content that helps champions sell internally.",
        "Within one quarter, your team runs a consistent motion with forecast accuracy you can take to the board.",
      ],
      outcomes: [
        {
          value: 29,
          prefix: "+",
          suffix: "%",
          label: "avg. lift in close rate",
        },
        {
          value: 62,
          prefix: "-",
          suffix: "%",
          label: "shorter ramp time for new reps",
        },
        {
          value: 91,
          suffix: "%",
          label: "forecast accuracy after 2 quarters",
        },
      ],
      deliverables: [
        "Sales process redesign",
        "Discovery & demo frameworks",
        "Objection & battle cards",
        "Mutual action plan templates",
        "Content for late-stage deals",
        "Coaching & call reviews",
      ],
      process: [
        {
          title: "Shadow",
          desc: "We join calls, review recordings, and find where deals actually stall.",
        },
        {
          title: "Codify",
          desc: "Winning behaviours become frameworks, scripts, and assets.",
        },
        {
          title: "Coach",
          desc: "Weekly call reviews and role-plays until the motion sticks.",
        },
        {
          title: "Measure",
          desc: "Stage conversion and forecast dashboards keep it honest.",
        },
      ],
    },
    {
      slug: "analytics-experimentation",
      name: "Analytics & Experimentation",
      tagline: "Twelve tests a quarter. Compounding wins. No more opinion-led roadmaps.",
      icon: ChartColumn,
      image: "/images/case-atlas.jpg",
      description: [
        "Teams that test win. Teams that argue about button colours lose. We install an experimentation operating system — tracking you can trust, a prioritised backlog, and a weekly cadence that ships learnings, not just tickets.",
        "CRO, lifecycle, pricing, onboarding: every surface becomes a surface for compounding gains.",
      ],
      outcomes: [
        {
          value: 12,
          suffix: "",
          label: "experiments shipped per quarter, guaranteed",
        },
        {
          value: 18,
          prefix: "+",
          suffix: "%",
          label: "avg. conversion lift per winning test",
        },
        {
          value: 100,
          suffix: "%",
          label: "tracking coverage across the funnel",
        },
      ],
      deliverables: [
        "Tracking & event taxonomy",
        "Experiment backlog (ICE-scored)",
        "A/B testing program",
        "CRO roadmap & design",
        "Learning library & reports",
        "Analytics dashboards",
      ],
      process: [
        {
          title: "Instrument",
          desc: "Clean tracking, event dictionary, and trusted dashboards.",
        },
        {
          title: "Hypothesise",
          desc: "Research-backed backlog scored on impact, confidence, ease.",
        },
        {
          title: "Run",
          desc: "Weekly shipping cadence with rigorous readouts.",
        },
        {
          title: "Bank",
          desc: "Wins ship to 100%; learnings compound in your library.",
        },
      ],
    },
  ],
  caseStudies = [
    {
      slug: "nova-cloud",
      client: "Nova Cloud",
      industry: "SaaS",
      title: "From stalled pipeline to 3.2× qualified demos in two quarters",
      excerpt:
        "A Series B infrastructure platform with a great product and an invisible pipeline. We rebuilt positioning, demand, and the demo motion — then watched the calendar fill.",
      image: "/images/case-nova.jpg",
      year: "2026",
      duration: "6 months",
      services: ["Growth Strategy", "Brand & Positioning", "Sales Enablement"],
      metrics: [
        {
          value: 212,
          prefix: "+",
          suffix: "%",
          label: "qualified pipeline growth",
        },
        {
          value: 38,
          prefix: "−",
          suffix: "%",
          label: "reduction in CAC",
        },
        {
          value: 4.6,
          decimals: 1,
          suffix: "×",
          label: "return on engagement",
        },
      ],
      challenge: [
        "Nova Cloud had raised a strong Series B on the back of founder-led sales — then hit a wall. The pipeline was lumpy, demos converted at 11%, and every deal depended on the CEO joining the call.",
        "Worse, the market lumped them in with three cheaper competitors. Prospects arrived price-shopping instead of problem-solving, and the sales cycle dragged past 90 days.",
      ],
      approach: [
        {
          title: "Reposition around the expensive problem",
          desc: "Customer interviews revealed buyers cared about one thing: migration risk. We reframed Nova as the zero-risk migration platform and rewrote every surface around it.",
        },
        {
          title: "Rebuild the demand engine",
          desc: "We killed six underperforming channels, doubled down on two, and launched a creative testing program that shipped 40+ variants a month.",
        },
        {
          title: "Codify the demo that closes",
          desc: "We shadowed 30 calls, extracted the founder's magic, and turned it into a repeatable demo framework with mutual action plans for every deal.",
        },
      ],
      results: [
        "Within two quarters, qualified demos were up 3.2× and the sales cycle had compressed to 54 days. The CEO stepped out of deals entirely — close rates went up anyway.",
        "Nova closed their two largest logos to date off the new motion and carried the playbook into their Series C narrative.",
      ],
      quote: {
        text: "Kora didn't give us a deck. They gave us a machine — positioning, pipeline, and a sales motion our team actually runs.",
        author: "Priya Raman",
        role: "CEO, Nova Cloud",
      },
    },
    {
      slug: "ledgerly",
      client: "Ledgerly",
      industry: "Fintech",
      title: "Repositioning a fintech for enterprise — and doubling ACV",
      excerpt:
        "Ledgerly was winning SMBs and losing every enterprise deal to incumbents. We rebuilt trust signals, the enterprise motion, and RevOps to match.",
      image: "/images/case-ledger.jpg",
      year: "2025",
      duration: "8 months",
      services: ["Brand & Positioning", "Revenue Operations", "Sales Enablement"],
      metrics: [
        {
          value: 168,
          prefix: "+",
          suffix: "%",
          label: "enterprise pipeline growth",
        },
        {
          value: 2.1,
          decimals: 1,
          suffix: "×",
          label: "increase in average ACV",
        },
        {
          value: 94,
          suffix: "%",
          label: "logo retention after 12 months",
        },
      ],
      challenge: [
        "Ledgerly's product was enterprise-ready but their go-to-market wasn't. Security reviews stalled deals, the CRM was a graveyard of dead opportunities, and enterprise buyers simply didn't take them seriously.",
        "The team needed more than a rebrand — they needed an enterprise-grade operating system for trust, process, and proof.",
      ],
      approach: [
        {
          title: "Make trust tangible",
          desc: "Security hub, compliance content, customer proof wall, and a repositioned narrative around control and auditability.",
        },
        {
          title: "Install an enterprise motion",
          desc: "Multi-threading playbooks, exec alignment frameworks, and mutual action plans replaced single-threaded hope.",
        },
        {
          title: "Rebuild RevOps",
          desc: "Salesforce rebuild, lifecycle redesign, and dashboards the board could finally believe in.",
        },
      ],
      results: [
        "Enterprise pipeline grew 168% in three quarters and ACV more than doubled. Security review cycle time dropped by half, and forecast accuracy hit 91%.",
        "Ledgerly now closes six-figure deals in a motion their 20-person sales team runs without founder involvement.",
      ],
      quote: {
        text: "Enterprise buyers treat us like an incumbent now. The trust work alone paid for the engagement ten times over.",
        author: "Marcus Webb",
        role: "CRO, Ledgerly",
      },
    },
    {
      slug: "bloom-and-co",
      client: "Bloom & Co",
      industry: "DTC",
      title: "Scaling a DTC brand past $10M without torching CAC",
      excerpt:
        "A beloved home-fragrance brand stuck at $4M, over-dependent on one paid channel. We diversified acquisition and built retention into a second growth engine.",
      image: "/images/case-bloom.jpg",
      year: "2026",
      duration: "9 months",
      services: ["Performance Marketing", "Analytics & Experimentation", "Growth Strategy"],
      metrics: [
        {
          value: 10.4,
          decimals: 1,
          prefix: "$",
          suffix: "M",
          label: "revenue run-rate achieved",
        },
        {
          value: 3.8,
          decimals: 1,
          suffix: "×",
          label: "blended ROAS at scale",
        },
        {
          value: 57,
          prefix: "+",
          suffix: "%",
          label: "repeat purchase rate",
        },
      ],
      challenge: [
        "Bloom & Co had product-market fit and a cult following — but 80% of revenue came from a single paid social channel, and CAC had doubled in 18 months. Every attempt to scale spend just bought more expensive customers.",
        "Meanwhile, retention was an afterthought: no lifecycle program, no subscription push, and a leaky post-purchase experience.",
      ],
      approach: [
        {
          title: "Diversify acquisition",
          desc: "We launched search, creator whitelisting, and a retail-partnership funnel — taking paid social from 80% to 45% of new customers.",
        },
        {
          title: "Turn retention into a channel",
          desc: "Full lifecycle rebuild: welcome, post-purchase, replenishment, and winback — plus a subscription program that now drives 22% of revenue.",
        },
        {
          title: "Experiment relentlessly",
          desc: "12+ tests per quarter across PDPs, offers, and checkout. Winners compounded into an 18% conversion lift.",
        },
      ],
      results: [
        "Bloom crossed $10M run-rate in nine months while holding 3.8× blended ROAS. Repeat rate climbed 57%, and the brand is no longer hostage to a single algorithm.",
        "The experimentation program still runs today — now staffed entirely by Bloom's in-house team, trained by Kora.",
      ],
      quote: {
        text: "They scaled us past $10M and made us dangerous enough to keep going without them. That's the highest compliment I can give an agency.",
        author: "Sofia Marchetti",
        role: "Founder, Bloom & Co",
      },
    },
    {
      slug: "atlas-freight",
      client: "Atlas Freight",
      industry: "B2B",
      title: "Building a demand engine for a 40-year-old logistics brand",
      excerpt:
        "Atlas ran on referrals and trade shows while digital-native competitors ate their lunch. We built inbound from zero to the #1 sourced-revenue channel.",
      image: "/images/case-atlas.jpg",
      year: "2025",
      duration: "12 months",
      services: ["Growth Strategy", "Revenue Operations", "Analytics & Experimentation"],
      metrics: [
        {
          value: 5.1,
          decimals: 1,
          suffix: "×",
          label: "growth in inbound leads",
        },
        {
          value: 62,
          prefix: "−",
          suffix: "%",
          label: "shorter sales cycle",
        },
        {
          value: 8.2,
          decimals: 1,
          prefix: "$",
          suffix: "M",
          label: "pipeline sourced from inbound",
        },
      ],
      challenge: [
        "Atlas Freight had four decades of reputation and zero digital presence. Competitors with slick content and instant-quote tools were winning the exact shippers Atlas served best.",
        "Internally, there was no CRM discipline, no content, and deep skepticism that 'marketing' could ever work for freight.",
      ],
      approach: [
        {
          title: "Find the wedge",
          desc: "We identified mid-market shippers frustrated by opaque pricing — and made transparent, educational content the spearhead.",
        },
        {
          title: "Build the engine",
          desc: "SEO program, quote-tool landing system, and paid search capturing high-intent demand the sales team had never seen.",
        },
        {
          title: "Wire it to revenue",
          desc: "HubSpot implementation with instant lead routing, speed-to-lead SLAs, and full closed-loop reporting.",
        },
      ],
      results: [
        "Inbound went from 0 to 5.1× leads and $8.2M in sourced pipeline inside a year. Speed-to-lead dropped from days to under five minutes.",
        "Most importantly, the skepticism is gone: marketing now holds a permanent seat in Atlas's revenue planning.",
      ],
      quote: {
        text: "I thought marketing was brochures. Kora built us a revenue channel our sales team fights over.",
        author: "Tom Okafor",
        role: "Managing Director, Atlas Freight",
      },
    },
  ],
  team = [
    {
      name: "Maya Chen",
      role: "Founder & Managing Partner",
      bio: "Ex-VP Growth at two unicorns. Maya has led 80+ engagements and still joins every strategy kickoff personally.",
      image: "/images/team-1.jpg",
    },
    {
      name: "Jonas Weber",
      role: "Head of Growth Strategy",
      bio: "Former management consultant turned operator. Jonas builds the roadmaps — sequenced, costed, and board-ready.",
      image: "/images/team-2.jpg",
    },
    {
      name: "Amara Okafor",
      role: "Director of Revenue Operations",
      bio: "HubSpot and Salesforce architect. Amara has rebuilt 40+ CRMs and the teams that run them.",
      image: "/images/team-3.jpg",
    },
    {
      name: "Daniel Reyes",
      role: "Creative Director",
      bio: "Brand and performance creative. Daniel makes work that wins both awards and pipeline reviews.",
      image: "/images/team-4.jpg",
    },
  ],
  insights = [
    {
      slug: "90-day-growth-roadmap",
      title: "The 90-day growth roadmap we run with every client",
      category: "Strategy",
      excerpt:
        "Diagnose, prioritise, sequence, activate. The exact operating cadence behind 120+ engagements — and how to steal it.",
      image: "/images/insight-1.jpg",
      date: "Oct 28, 2026",
      readTime: "8 min read",
      author: {
        name: "Maya Chen",
        role: "Founder & Managing Partner",
      },
      body: [
        {
          type: "p",
          text: "Every engagement at Kora starts the same way: a blank whiteboard, a skeptical executive team, and a funnel full of leaks. And every engagement runs on the same 90-day cadence. Not because we're lazy — because it works.",
        },
        {
          type: "p",
          text: "The roadmap has four phases, each with a clear exit criterion. You don't move to phase two because two weeks passed. You move because the diagnosis is signed off and the leaks are ranked.",
        },
        {
          type: "h2",
          text: "Phase 1 — Diagnose (weeks 1–2)",
        },
        {
          type: "p",
          text: "We interview stakeholders, tear down the funnel data, and mystery-shop your own buying experience. The output is a leak map: every stage, its conversion rate, its benchmark, and the revenue trapped inside.",
        },
        {
          type: "quote",
          text: "Most teams don't have a growth problem — they have twelve small leaks they never ranked.",
        },
        {
          type: "h2",
          text: "Phase 2 — Prioritise (week 3)",
        },
        {
          type: "p",
          text: "Every opportunity gets scored on impact, confidence, and effort. Then we do the hardest thing in consulting: we kill the bottom 70%. Focus is the strategy.",
        },
        {
          type: "h2",
          text: "Phase 3 — Sequence (week 4)",
        },
        {
          type: "p",
          text: "Winners become a week-by-week plan with owners, budgets, and targets. Nothing ships 'when we get to it' — everything has a date and a name attached.",
        },
        {
          type: "h2",
          text: "Phase 4 — Activate (weeks 5–12)",
        },
        {
          type: "list",
          items: [
            "Weekly sprint rituals with your team",
            "Experiment scorecards, not activity reports",
            "Kill/scale decisions every two weeks",
            "A playbook handoff so the machine runs without us",
          ],
        },
        {
          type: "p",
          text: "Steal the cadence. Run it for one quarter. If your pipeline doesn't move, we'll be shocked — and we'd love to hear why.",
        },
      ],
    },
    {
      slug: "positioning-leaking-pipeline",
      title: "Why your positioning is leaking pipeline",
      category: "Positioning",
      excerpt:
        "If prospects arrive price-shopping, your positioning failed before sales ever got a chance. Here's the fix.",
      image: "/images/insight-2.jpg",
      date: "Oct 14, 2026",
      readTime: "6 min read",
      author: {
        name: "Daniel Reyes",
        role: "Creative Director",
      },
      body: [
        {
          type: "p",
          text: "Ask your last ten lost deals why they chose a competitor. If the answer rhymes with 'they were cheaper' or 'we couldn't tell you apart,' you don't have a sales problem. You have a positioning problem.",
        },
        {
          type: "p",
          text: "Vague positioning forces every prospect to do the differentiation work themselves. Most won't bother — they'll shortlist on price, and you'll lose to whoever discounts hardest.",
        },
        {
          type: "h2",
          text: "The three symptoms",
        },
        {
          type: "list",
          items: [
            "Your homepage could belong to any of your competitors with a logo swap",
            "Sales invents new positioning on every call",
            "Win rates drop as deal size grows",
          ],
        },
        {
          type: "quote",
          text: "Differentiation that lives only in the founder's head isn't positioning. It's a secret.",
        },
        {
          type: "h2",
          text: "The fix: frame the expensive problem",
        },
        {
          type: "p",
          text: "Great positioning doesn't start with what you do. It starts with the expensive problem you solve — named in the customer's words, quantified in their math, and framed so competitors can't claim it without lying.",
        },
        {
          type: "p",
          text: "Do that work once, properly, and every downstream motion — demand, sales, retention — gets easier. Skip it, and you'll pay the tax on every deal forever.",
        },
      ],
    },
    {
      slug: "channel-mix-that-works",
      title: "CAC is up. Here's the channel mix that still works",
      category: "Marketing",
      excerpt:
        "Paid social got expensive. Search got crowded. The winners in 2026 run a portfolio — here's ours.",
      image: "/images/insight-3.jpg",
      date: "Sep 30, 2026",
      readTime: "7 min read",
      author: {
        name: "Jonas Weber",
        role: "Head of Growth Strategy",
      },
      body: [
        {
          type: "p",
          text: "Blended CAC is up across nearly every account we manage. The brands still growing aren't finding a magic channel — they're running a disciplined portfolio where no single source owns more than 40% of pipeline.",
        },
        {
          type: "h2",
          text: "The 2026 portfolio",
        },
        {
          type: "list",
          items: [
            "High-intent capture (search + review sites): the floor under your pipeline",
            "Creator-led paid social: whitelisted, native, refreshed weekly",
            "Lifecycle & retention: the cheapest revenue you'll ever book",
            "One compounding bet: SEO, community, or partnerships",
          ],
        },
        {
          type: "quote",
          text: "Diversification isn't about doing more. It's about never being hostage to one algorithm again.",
        },
        {
          type: "h2",
          text: "How we allocate",
        },
        {
          type: "p",
          text: "We start with unit economics, not benchmarks. Payback targets set the budget envelope per channel; creative testing velocity decides who earns more. Kill/scale reviews run every two weeks — no sacred cows, no annual plans gathering dust.",
        },
        {
          type: "p",
          text: "The mix will keep shifting. The operating system — model, test, scale, compound — doesn't have to.",
        },
      ],
    },
    {
      slug: "lean-revops-stack",
      title: "RevOps in 2026: the lean stack we recommend",
      category: "Operations",
      excerpt: "You don't need 14 tools. You need five, wired correctly, with one source of truth.",
      image: "/images/case-ledger.jpg",
      date: "Sep 12, 2026",
      readTime: "5 min read",
      author: {
        name: "Amara Okafor",
        role: "Director of Revenue Operations",
      },
      body: [
        {
          type: "p",
          text: "The average scale-up we audit runs 14 revenue tools and trusts zero dashboards. The fix is rarely another purchase — it's subtraction, then wiring.",
        },
        {
          type: "h2",
          text: "The lean five",
        },
        {
          type: "list",
          items: [
            "CRM as the system of record — clean stages, enforced SLAs",
            "Enrichment + routing so every lead lands in the right hands fast",
            "Sequencing for outbound and speed-to-lead automation",
            "Conversation intelligence for coaching and win/loss truth",
            "One BI view the board, marketing, and sales all quote",
          ],
        },
        {
          type: "quote",
          text: "A CRM nobody trusts is just an expensive spreadsheet with notifications.",
        },
        {
          type: "h2",
          text: "The order matters",
        },
        {
          type: "p",
          text: "Fix lifecycle stages before buying tools. Fix routing before buying enrichment. Fix the dashboard before the next board meeting. Sequence the plumbing, then scale the pressure.",
        },
      ],
    },
    {
      slug: "founder-led-to-team-led-sales",
      title: "From founder-led to team-led sales: the handoff playbook",
      category: "Sales",
      excerpt:
        "The founder closes, everyone else struggles. Closing that gap is a process project, not a hiring project.",
      image: "/images/case-bloom.jpg",
      date: "Aug 27, 2026",
      readTime: "9 min read",
      author: {
        name: "Maya Chen",
        role: "Founder & Managing Partner",
      },
      body: [
        {
          type: "p",
          text: "Founder-led sales works because founders carry three unfair advantages: total product knowledge, instant credibility, and the authority to promise things. Reps have none of these — so handing them a quota and a deck is a setup for failure.",
        },
        {
          type: "h2",
          text: "Step 1 — Shadow before you script",
        },
        {
          type: "p",
          text: "Join 20 calls. Record them (with permission). Find the moments deals actually move: the story, the objection reframe, the proof point. That's your raw material.",
        },
        {
          type: "h2",
          text: "Step 2 — Codify the motion",
        },
        {
          type: "list",
          items: [
            "Discovery framework with exit criteria per stage",
            "Demo narrative, not a feature tour",
            "Objection and battle cards from real losses",
            "Mutual action plans for every qualified deal",
          ],
        },
        {
          type: "quote",
          text: "If the process only works when the founder is on the call, you don't have a process.",
        },
        {
          type: "h2",
          text: "Step 3 — Coach weekly, measure honestly",
        },
        {
          type: "p",
          text: "Call reviews, role-plays, and stage-conversion dashboards. Within a quarter, the founder should be optional on deals — within two, absent. That's the test.",
        },
      ],
    },
    {
      slug: "experimentation-cadence",
      title: "Experimentation cadence: how we ship 12 tests a quarter",
      category: "Analytics",
      excerpt:
        "Velocity beats genius. The operating system behind our testing programs — backlog, rituals, and readouts.",
      image: "/images/about-team.jpg",
      date: "Aug 08, 2026",
      readTime: "6 min read",
      author: {
        name: "Jonas Weber",
        role: "Head of Growth Strategy",
      },
      body: [
        {
          type: "p",
          text: "Most teams run three tests a year and call it CRO. Our clients ship twelve a quarter — not because they're bigger, but because they run a system. Here's the system.",
        },
        {
          type: "h2",
          text: "The backlog",
        },
        {
          type: "p",
          text: "Every idea enters one backlog, scored ICE: impact, confidence, ease. Research — session replays, surveys, support tickets — feeds it monthly. Opinions are welcome; they just score low on confidence.",
        },
        {
          type: "h2",
          text: "The rituals",
        },
        {
          type: "list",
          items: [
            "Monday: prioritise the week's ships",
            "Wednesday: review live tests, no peeking at losers early",
            "Friday: readout — ship, kill, or iterate, documented in the library",
          ],
        },
        {
          type: "quote",
          text: "A test you don't document is a lesson you'll pay to learn twice.",
        },
        {
          type: "h2",
          text: "The compounding part",
        },
        {
          type: "p",
          text: "Winners ship to 100% and get applied across surfaces — PDP learnings inform checkout, checkout learnings inform onboarding. That's how 12 tests a quarter becomes 18% conversion lift a year.",
        },
      ],
    },
  ],
  plans = [
    {
      name: "Growth Sprint",
      badge: "Best for validation",
      blurb: "A focused 3-week engagement to diagnose your funnel and hand you the roadmap.",
      oneTime: 4800,
      unit: "one-time",
      cta: "Start with a Sprint",
      benefits: [
        "Full-funnel audit & teardown",
        "Leak map with revenue sizing",
        "ICP & messaging review",
        "90-day sequenced roadmap",
        "Budget & hiring recommendations",
        "2 working sessions with partners",
        "Board-ready strategy deck",
        "30 days of async follow-up",
      ],
    },
    {
      name: "Growth Partner",
      badge: "Most popular",
      blurb: "Your embedded growth team — strategy, execution, and experiments, every week.",
      monthly: 6500,
      unit: "/month",
      cta: "Become a Partner",
      featured: !0,
      benefits: [
        "Everything in Growth Sprint",
        "Dedicated strategist + specialists",
        "Weekly sprint rituals & reporting",
        "Always-on experiment program",
        "Channel management (up to 3)",
        "Landing page & CRO program",
        "RevOps support & dashboards",
        "Slack access, same-day replies",
        "Quarterly planning workshops",
        "Pause or cancel with 30 days notice",
      ],
    },
    {
      name: "Embedded Team",
      badge: "For scale-ups",
      blurb: "A full pod inside your org — for teams spending $100k+/mo or rebuilding GTM.",
      monthly: 12e3,
      unit: "/month",
      cta: "Build my pod",
      benefits: [
        "Everything in Growth Partner",
        "Cross-functional pod of 5+",
        "Creative production sprints",
        "Sales enablement & coaching",
        "Custom data & attribution builds",
        "Executive steering committee",
        "Hiring support for in-house roles",
        "On-site workshops, quarterly",
        "Annual planning & board support",
        "Priority access to partners",
      ],
    },
  ],
  testimonials = [
    {
      quote:
        "Kora didn't give us a deck. They gave us a machine — positioning, pipeline, and a sales motion our team actually runs.",
      name: "Priya Raman",
      role: "CEO, Nova Cloud",
      metric: "3.2×",
      metricLabel: "qualified demos",
    },
    {
      quote:
        "Enterprise buyers treat us like an incumbent now. The trust work alone paid for the engagement ten times over.",
      name: "Marcus Webb",
      role: "CRO, Ledgerly",
      metric: "2.1×",
      metricLabel: "average ACV",
    },
    {
      quote:
        "They scaled us past $10M and made us dangerous enough to keep going without them. That's the highest compliment I can give.",
      name: "Sofia Marchetti",
      role: "Founder, Bloom & Co",
      metric: "$10.4M",
      metricLabel: "revenue run-rate",
    },
    {
      quote: "I thought marketing was brochures. Kora built us a revenue channel our sales team fights over.",
      name: "Tom Okafor",
      role: "Managing Director, Atlas Freight",
      metric: "5.1×",
      metricLabel: "inbound leads",
    },
  ],
  faqs = [
    {
      q: "How fast will we see results?",
      a: "Quick wins typically land in the first 30 days — messaging fixes, routing, obvious funnel leaks. Compounding results build over 90 days as experiments stack. We set explicit 30/60/90 targets in week one, and report against them weekly.",
    },
    {
      q: "Who will actually work on our account?",
      a: "A partner leads every engagement, backed by dedicated specialists — never handed to juniors. You'll know everyone's name, and you'll talk to them weekly. Our strategists run a maximum of four accounts each.",
    },
    {
      q: "How is this different from hiring in-house?",
      a: "A senior growth hire costs $150k+ and takes six months to ramp — and they're still one person. A Kora pod gives you strategy, creative, RevOps, and analytics from week one, with 120+ engagements of pattern recognition. Many clients later hire in-house with our help.",
    },
    {
      q: "What do you need from our team?",
      a: "Two hours a week from a decision-maker, access to your data, and honest answers in interviews. We handle the rest. The engagements that move fastest are the ones where founders show up to the weekly sprint.",
    },
    {
      q: "Do you require long-term contracts?",
      a: "No. Growth Sprint is a fixed 3-week engagement. Retainers run month-to-month after an initial 90 days — the minimum window to prove compounding results. You can pause or cancel with 30 days notice.",
    },
    {
      q: "What if it doesn't work?",
      a: "Every engagement starts with a diagnostic. If we don't find at least 3× our fee in addressable opportunity, we'll tell you — and refund the Sprint in full. In six years, we've issued that refund twice.",
    },
  ],
  clientLogos = [
    "Nova Cloud",
    "Ledgerly",
    "Bloom & Co",
    "Atlas Freight",
    "Northbeam",
    "Helios",
    "Fernway",
    "Cobalt",
  ],
  stats = [
    {
      value: 120,
      suffix: "+",
      label: "growth engagements delivered",
    },
    {
      value: 240,
      prefix: "$",
      suffix: "M",
      label: "client pipeline generated",
    },
    {
      value: 4.8,
      decimals: 1,
      suffix: "×",
      label: "average return on engagement",
    },
    {
      value: 94,
      suffix: "%",
      label: "of clients stay past year one",
    },
  ],
  processSteps = [
    {
      n: "01",
      title: "Diagnose",
      desc: "Stakeholder interviews, data deep-dives, and a ruthless audit of every funnel stage. We find where revenue is actually leaking — and size the prize.",
      tags: ["Funnel audit", "Data teardown", "Leak map"],
    },
    {
      n: "02",
      title: "Prioritise",
      desc: "Every lever scored on impact vs. effort. We kill the bottom 70% and keep the few moves that change the trajectory. Focus is the strategy.",
      tags: ["Opportunity scoring", "Kill list", "Roadmap"],
    },
    {
      n: "03",
      title: "Activate",
      desc: "Weekly sprints with your team — shipping experiments, creative, and fixes. Kill/scale decisions every two weeks. No 60-page decks gathering dust.",
      tags: ["Weekly sprints", "Experiments", "Reporting"],
    },
    {
      n: "04",
      title: "Compound",
      desc: "Winners scale, learnings bank into your playbook, and your team learns to run the machine. We make ourselves optional — that's the point.",
      tags: ["Scale winners", "Playbooks", "Handoff"],
    },
  ],
  values = [
    {
      icon: Lightbulb,
      title: "Outcomes over output",
      desc: "Nobody ever grew from a 60-page deck. We measure ourselves on pipeline, revenue, and retention — the numbers that survive a board meeting.",
    },
    {
      icon: ShieldCheck,
      title: "Radical honesty",
      desc: "If your positioning is vague, we'll say so. If a channel is dying, we'll kill it. You hire us for the truth, not for comfort.",
    },
    {
      icon: Heart,
      title: "Make ourselves optional",
      desc: "Every playbook, dashboard, and framework is built for handoff. Our proudest metric is clients who outgrow us.",
    },
    {
      icon: Award,
      title: "Senior only, always",
      desc: "No juniors learning on your budget. Every account is led by a partner and staffed by specialists with 8+ years in the game.",
    },
  ],
  timeline = [
    {
      year: "2019",
      title: "Two laptops, one whiteboard",
      desc: "Maya and Jonas leave big-consulting and bigger-agency jobs to start Kora with three brave clients.",
    },
    {
      year: "2021",
      title: "The 90-day operating system",
      desc: "After 30 engagements, the patterns become a playbook: diagnose, prioritise, activate, compound.",
    },
    {
      year: "2023",
      title: "RevOps & creative join the pod",
      desc: "Clients asked for execution, not just advice. We build the creative and RevOps practices in-house.",
    },
    {
      year: "2025",
      title: "120+ engagements, $240M pipeline",
      desc: "Kora crosses 120 engagements with a 94% retention rate — and a waitlist for the first time.",
    },
    {
      year: "2026",
      title: "The consultancy that compounds",
      desc: "Today: 24 senior specialists, six practices, and one obsession — growth you can measure.",
    },
  ];
