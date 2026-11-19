# Merge & Monsters

A browser-based retro pixel-art dungeon crawler RPG powered by live GitHub repository telemetry.

Your commits award hero XP. Open issues spawn monsters scaled by severity and age. Closing an issue defeats the active monster and awards gold. Everything runs in the browser with no server.

Built for the Kiroween **Frankenstein** category.

---

## Setup

Requires [Node.js](https://nodejs.org) 18+ and [pnpm](https://pnpm.io).

```bash
git clone https://github.com/<owner>/merge-and-monsters
cd merge-and-monsters
pnpm install
pnpm dev
```

Open `http://localhost:5173`.

---

## Play

### Connect a Repository

Enter a GitHub repository slug (`owner/repo`) or a full URL. Optionally add a Personal Access Token (PAT) for a higher API rate limit (5,000 req/hr vs 60 req/hr). The PAT is stored only in `sessionStorage` and cleared when the tab closes.

### Sandbox Mode

Click **Launch Dungeon Sandbox** to play with a pre-configured mock repository. No GitHub account or internet connection required. Use the sandbox controls to simulate commits, PR merges, and issue closes.

### Hero Progression

- Commits award XP based on diff size: `floor(25 * ln(1 + lines_changed)) + 50 * merged_prs`
- Small, atomic commits give proportionally more XP per line than mega-diffs
- The repository's primary language determines the hero's weapon class
- Repository health (issue close ratio, README, CI) sets the hero's max HP

### Monster Combat

- Each open GitHub issue spawns a monster
- Monster HP: `base_hp * (1 + 0.15 * age_in_days)` (age capped at 60 days)
- `bug`/`critical` issues -> Regression Golem (150 base HP)
- `enhancement` issues -> Backlog Wraith (100 base HP)
- `documentation`/`chore` issues -> Debt Slime (75 base HP)
- Closing an issue defeats the active monster and awards gold

---

## Development

```bash
pnpm dev          # development server
pnpm build        # production build
pnpm typecheck    # TypeScript type check
pnpm biome check --write .  # lint and format
pnpm test         # run tests
```

---

## Deploy

The build output is a static folder. Deploy `dist/` to any CDN, GitHub Pages, Vercel, or Netlify.

```bash
pnpm build
# upload dist/ to your hosting
```

---

## Stack

- Vite + React 19 + TypeScript (strict)
- Tailwind CSS
- Zustand (state)
- @octokit/rest (GitHub API)
- HTML5 Canvas (60 FPS renderer)
- Web Audio API (synthesized SFX, zero audio files)
- i18next (English + Spanish)
- Biome (lint + format)

---

## Documentation

Full architecture, decision records, roadmap, and task history live in `docs/`. Start at `docs/INDEX.md`.
