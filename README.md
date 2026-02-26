# ◆ DailyBuildAI

> AI builds a brand-new website every single day.

DailyBuildAI is a "website of websites" — every day, Claude automatically generates a self-contained site (a game, a tool, generative art, an ambient experience, and more), which gets hosted and archived here in one central hub.

---

## How it works

1. **Builder** — a Node.js script calls the Claude API with a creative prompt based on the day's category
2. **Output** — a single self-contained `index.html` is saved to `builds/YYYY-MM-DD/`
3. **Manifest** — `builds.json` is updated with the build's title, category, and description
4. **Hub** — the main `index.html` reads `builds.json` and renders today's build + the full archive

---

## Project structure

```
DailyBuildAI/
├── index.html              ← Hub (gallery + archive)
├── hub.css                 ← Styles
├── hub.js                  ← Reads builds.json, renders everything
├── builds.json             ← Manifest of all builds
├── builds/
│   └── YYYY-MM-DD/
│       └── index.html      ← Each daily build (fully self-contained)
└── builder/
    ├── generate.js         ← Daily site generator
    ├── package.json
    └── .env.example
```

---

## Running the builder

```bash
cd builder
cp .env.example .env       # add your ANTHROPIC_API_KEY
npm install
node generate.js           # builds today's site
```

**Options:**
```bash
node generate.js --dry-run             # preview without writing files
node generate.js --date=2026-03-01     # build for a specific date
node generate.js --force               # overwrite an existing build
```

---

## Self-hosting

This is a fully static site — no server required.

**Serve locally:**
```bash
npx serve .
```

**Deploy:** drag the entire project folder to any static host (Nginx, Caddy, Apache, Netlify, Vercel, GitHub Pages, etc.). No build step needed.

---

## Automating daily builds

Add a cron job to run the builder each day and deploy the result:

```cron
0 8 * * * cd /path/to/DailyBuildAI/builder && node generate.js
```

---

## Build categories

Each day is assigned a category deterministically based on the date:

- Generative Art
- Mini Game
- Interactive Tool
- Landing Page
- Ambient Experience
- Data Visualization
- Typography Play
- CSS Art
- Browser Toy
- Digital Experiment

---

Built with [Claude](https://anthropic.com) · Every build lives forever
