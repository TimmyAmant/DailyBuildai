#!/usr/bin/env node
/**
 * DailyBuildAI — daily site generator
 * Usage: node generate.js [--date YYYY-MM-DD] [--dry-run]
 *
 * Set ANTHROPIC_API_KEY in .env or your environment.
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Load .env ──────────────────────────────────────────
const envPath = resolve(__dirname, '.env');
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .forEach(l => {
      const [k, ...v] = l.split('=');
      process.env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
    });
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('✗ ANTHROPIC_API_KEY is not set. Add it to builder/.env');
  process.exit(1);
}

// ── Args ───────────────────────────────────────────────
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const dateArg = args.find(a => a.startsWith('--date='))?.split('=')[1]
  || args[args.indexOf('--date') + 1];
const TARGET_DATE = dateArg || new Date().toISOString().slice(0, 10);

// ── Categories ─────────────────────────────────────────
const CATEGORIES = [
  'Generative Art',
  'Mini Game',
  'Interactive Tool',
  'Landing Page',
  'Ambient Experience',
  'Data Visualization',
  'Typography Play',
  'CSS Art',
  'Browser Toy',
  'Digital Experiment',
];

// Deterministic category pick from date so the same date always gets the same category
function pickCategory(date) {
  const hash = date.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return CATEGORIES[hash % CATEGORIES.length];
}

// ── Prompt templates per category ─────────────────────
const PROMPTS = {
  'Generative Art': `Create a stunning generative art piece. It should produce a unique, evolving visual — think particle systems, fractal-like patterns, or procedural landscapes. The art should look different each time the page loads. Make it interactive (click/mouse/keys).`,

  'Mini Game': `Build a fun, playable browser mini-game. It should have a clear goal, simple controls (keyboard and/or mouse), score tracking, and a game-over state with restart. Pick something creative — not just snake or tetris.`,

  'Interactive Tool': `Build a genuinely useful interactive tool. Examples: a color palette generator, a gradient builder, a type scale calculator, a noise/texture generator, a Pomodoro timer with a beautiful UI, a unit converter with instant results. Make it beautiful and functional.`,

  'Landing Page': `Design a fake product landing page for a fictional but plausible tech product. Include a hero section, feature highlights, a pricing section, and a footer. The design should be modern, visually polished, and use a strong color palette. The product should sound real and desirable.`,

  'Ambient Experience': `Create a relaxing, ambient browser experience. Think: animated backgrounds that respond to the current time of day, a breathing exercise guide, an ASMR-like visual loop, or a "zen garden" canvas. Should work without interaction but also respond to it.`,

  'Data Visualization': `Build an interesting data visualization. Either generate fake-but-believable data or visualize something mathematical (prime numbers, Fibonacci, Lorenz attractor, etc.). Use canvas or SVG. Should be animated and visually beautiful.`,

  'Typography Play': `Create a typographic art piece or experiment. Think: kinetic text, a font stress-tester, text that reacts to mouse movement, a headline generator with wild CSS effects, or generative poetry. Typography should be the star.`,

  'CSS Art': `Create a complex CSS-only illustration or animation — no canvas, minimal JS (only for toggling states if needed). The art should be impressive technically and visually, demonstrating creative CSS mastery.`,

  'Browser Toy': `Build a delightful, pointless but fun browser toy. Think: a confetti cannon, a bubble wrap popper, a virtual snow globe, a doodle synthesizer, or a "face maker" with emoji parts. Pure fun, zero utility required.`,

  'Digital Experiment': `Create an experimental, avant-garde digital experience. Push the limits of what a browser can show — unusual UI patterns, reality-bending visuals, fourth-wall breaks, weird interactions. Be bold and surprising.`,
};

// ── Build the prompt ───────────────────────────────────
function buildPrompt(category, date) {
  const [year, month, day] = date.split('-');
  const d = new Date(`${date}T00:00:00`);
  const dateStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return `You are building today's entry for DailyBuildAI — a site where AI creates a brand new website every single day.

Today's date: ${dateStr}
Today's category: ${category}

Your task: ${PROMPTS[category]}

REQUIREMENTS:
- Output a SINGLE, self-contained HTML file — all CSS and JS must be inline
- No external dependencies (no CDN links, no external fonts, no images from URLs)
- Must work perfectly when opened directly in a browser with no server
- Visually polished — dark or light theme is fine but it must look intentional and beautiful
- Include a subtle footer credit: "DailyBuildAI · ${dateStr}" in small text

TECHNICAL REQUIREMENTS:
- Valid HTML5 with proper meta tags and a descriptive <title>
- Responsive — works on mobile and desktop
- Accessible where practical (alt text, aria labels for interactive elements)
- Performance-conscious — no infinite loops that block the main thread

IMPORTANT:
- Return ONLY the raw HTML file content
- Start with <!DOCTYPE html>
- Do NOT wrap in markdown code blocks
- Do NOT add any explanation before or after the HTML`;
}

// ── Extract title from generated HTML ─────────────────
function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (!m) return 'Untitled Build';
  // Strip " · DailyBuildAI ..." suffix if present
  return m[1].replace(/\s*[·|—].*$/, '').trim() || 'Untitled Build';
}

// ── Extract description from meta tag ─────────────────
function extractDesc(html) {
  const m = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  return m ? m[1].trim() : '';
}

// ── Main ───────────────────────────────────────────────
async function main() {
  console.log(`\n◆ DailyBuildAI Generator`);
  console.log(`  Date: ${TARGET_DATE}`);

  const category = pickCategory(TARGET_DATE);
  console.log(`  Category: ${category}`);

  // Check if build already exists
  const buildDir = resolve(ROOT, 'builds', TARGET_DATE);
  const buildFile = resolve(buildDir, 'index.html');

  if (existsSync(buildFile) && !args.includes('--force')) {
    console.log(`  ⚠ Build already exists. Use --force to overwrite.\n`);
    process.exit(0);
  }

  console.log(`  Calling Claude…`);
  const client = new Anthropic();

  let html;
  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      messages: [
        { role: 'user', content: buildPrompt(category, TARGET_DATE) }
      ],
    });

    html = msg.content[0].type === 'text' ? msg.content[0].text : '';

    // Strip accidental markdown fences
    html = html.replace(/^```html?\n?/i, '').replace(/\n?```\s*$/i, '').trim();

    if (!html.toLowerCase().startsWith('<!doctype html')) {
      throw new Error('Response did not start with <!DOCTYPE html>');
    }
  } catch (err) {
    console.error(`  ✗ Claude API error: ${err.message}`);
    process.exit(1);
  }

  const title = extractTitle(html);
  const description = extractDesc(html) || `A ${category.toLowerCase()} built by AI on ${TARGET_DATE}`;

  console.log(`  Title: "${title}"`);
  console.log(`  ${html.length.toLocaleString()} chars generated`);

  if (dryRun) {
    console.log(`\n  [dry-run] Would write to ${buildFile}`);
    console.log(`  [dry-run] Would update builds.json\n`);
    return;
  }

  // Write build file
  mkdirSync(buildDir, { recursive: true });
  writeFileSync(buildFile, html, 'utf8');
  console.log(`  ✓ Wrote ${buildFile}`);

  // Update builds.json
  const manifestPath = resolve(ROOT, 'builds.json');
  let manifest = { builds: [] };
  if (existsSync(manifestPath)) {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  }

  // Remove existing entry for this date (if --force)
  manifest.builds = manifest.builds.filter(b => b.date !== TARGET_DATE);

  manifest.builds.push({
    date: TARGET_DATE,
    title,
    category,
    description,
    path: `/builds/${TARGET_DATE}/`,
  });

  // Keep sorted by date
  manifest.builds.sort((a, b) => a.date.localeCompare(b.date));

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`  ✓ Updated builds.json`);
  console.log(`\n  Done! Open /builds/${TARGET_DATE}/ to view.\n`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
