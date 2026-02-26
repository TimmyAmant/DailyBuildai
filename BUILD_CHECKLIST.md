# DailyBuildAI — New Build Checklist

Every time a new site is built, check off each item before considering it done.

## Pre-Build
- [ ] Verify today's date does NOT already exist in `builds.json` — no duplicate dates
- [ ] Pick a category from `ALL_CATEGORIES` in `hub.js` (or a new one)
- [ ] Confirm the build folder `builds/YYYY-MM-DD/` does not already exist

## Build
- [ ] Create `builds/YYYY-MM-DD/index.html` — fully self-contained (inline CSS/JS, zero external deps)
- [ ] Include the `.hud-back` arrow linking to `/` at the top
- [ ] Include the DailyBuild badge with the correct build number
- [ ] Include the correct date in the HUD
- [ ] Site works on mobile (responsive)
- [ ] No external dependencies — everything inline

## Archive Artwork
- [ ] Create a custom CSS thumbnail class (e.g. `.thumb-my-build`) in `hub.css`
- [ ] The thumbnail should visually represent the build's theme using CSS-only (gradients, shapes, pseudo-elements)
- [ ] Add the `thumbClass` value to the build entry in `builds.json`

## Registration
- [ ] Add the build entry to `builds.json` with all fields:
  - `date` — YYYY-MM-DD
  - `title` — short name
  - `category` — from the category list
  - `description` — one-liner for the archive card
  - `path` — `/builds/YYYY-MM-DD/`
  - `approved` — set to `false` (human flips to `true`)
  - `thumbClass` — the CSS class for the custom thumbnail
- [ ] Verify the homepage shows the new build card
- [ ] Verify the archive page shows the new build card
- [ ] Verify clicking the card opens the build and it works
- [ ] Verify the back arrow returns to the hub

## Deploy
- [ ] Git add all new/changed files
- [ ] Git commit with build name and date
- [ ] Git push to remote
