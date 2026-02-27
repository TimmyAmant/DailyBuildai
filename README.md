# ◆ DailyBuildAI

> AI builds a brand-new website every single day.

DailyBuildAI is a "website of websites." Every day, AI generates a completely self-contained site — a game, a tool, generative art, an ambient experience, a data viz, or something nobody's thought of yet. Zero templates, zero human code. Every build is reviewed and approved by a human before it goes live, then archived forever.

---

## What it is

A living archive of AI creativity. Each build is a single HTML file with all CSS and JS inlined — no frameworks, no dependencies, no build tools. Just one file that does one thing, built from scratch every day.

The hub at [dailybuildai.com](https://dailybuildai.com) shows every build ever made, with a countdown to the next one.

---

## How it works

1. **Prompt** — AI receives a creative brief with no fixed rotation. The category is wide open: games, tools, art, experiments, anything.
2. **Build** — AI generates a fully self-contained `index.html` with inline CSS and JS. No external dependencies.
3. **Review** — A human reviews the build. Once approved, it goes live with a "Human approved" badge.
4. **Archive** — `builds.json` is updated and the build appears on the hub. Every build lives at its own URL forever.

---

## Project structure

```
DailyBuildAI/
├── index.html              ← Homepage (hero + last 10 builds)
├── archive.html            ← Full archive page (all builds)
├── about.html              ← About the project
├── contact.html            ← Contact page
├── hub.css                 ← Hub styles + custom build thumbnails
├── hub.js                  ← Reads builds.json, renders archive grid
├── builds.json             ← Manifest of every build
├── BUILD_CHECKLIST.md      ← Checklist for creating new builds
├── builds/
│   ├── 2026-02-24/
│   │   └── index.html      ← Build #1: Cosmic Canvas
│   ├── 2026-02-25/
│   │   └── index.html      ← Build #2: ScrapeView
│   ├── 2026-02-26/
│   │   └── index.html      ← Build #3: Life Dashboard
│   └── 2026-02-27/
│       └── index.html      ← Build #4: Cipher Machine
└── builder/
    ├── generate.js         ← Claude API automation script
    └── package.json
```

---

## Site layout

**Homepage** — Hero section with the tagline, a countdown timer to midnight (when the next build drops), and a 2×2 stat grid. Below that, the 10 most recent builds as cards with custom CSS artwork.

**Archive** — Every build ever made, newest first. Each card shows the title, description, category, date, and a human-approved badge if reviewed.

**Build pages** — Each daily build lives at `/builds/YYYY-MM-DD/`. Every build has a back arrow to return to the hub and a DailyBuild badge with its number.

**About** — How the project works, the 4-step process, and what makes it different.

**Contact** — Reach out at contact@dailybuildai.com.

---

## Status

| Stat | Value |
|------|-------|
| Total builds | 4 |
| First build | Feb 24, 2026 |
| Latest build | Feb 27, 2026 |
| Streak | 4 days |
| Categories used | Generative Art, Interactive Tool, Data Visualization, Cryptography Tool |
| Human approved | 3 of 4 |
| Lines of human code | 0 |

### Build log

| # | Date | Title | Category | Approved |
|---|------|-------|----------|----------|
| 1 | 2026-02-24 | Cosmic Canvas | Generative Art | Yes |
| 2 | 2026-02-25 | ScrapeView | Interactive Tool | Yes |
| 3 | 2026-02-26 | Life Dashboard | Data Visualization | Yes |
| 4 | 2026-02-27 | Cipher Machine | Cryptography Tool | No |

---

Built with [Claude](https://anthropic.com) · Every build lives forever
