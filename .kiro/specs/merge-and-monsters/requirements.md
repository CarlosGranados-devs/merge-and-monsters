# Requirements Document — Merge & Monsters

## 1. Overview
**Merge & Monsters** is a browser-based retro pixel-art dungeon crawler RPG powered by live GitHub repository telemetry. Built for the Kiroween **Frankenstein** category, the application stitches software engineering workflows together with classic 16-bit RPG progression.

## 2. User Stories & Acceptance Criteria

### US-1: Repository Connection & Sandbox Mode
- **As a** developer or hackathon judge, **I want to** connect any public GitHub repository via `owner/repo` slug or launch an instant offline Sandbox mode, **so that** I can immediately experience the dungeon crawler without mandatory OAuth friction.
- **Acceptance Criteria:**
  1. The start screen accepts a GitHub repository URL or `owner/repo` string.
  2. An optional Personal Access Token (PAT) input allows authenticated requests (up to 5,000 req/hr) and is stored strictly in `sessionStorage`.
  3. A **"Launch Dungeon Sandbox"** button loads a pre-configured mock repository and unlocks simulation controls (`Simulate Commit`, `Simulate PR Merge`, `Simulate Issue Close`).

### US-2: Telemetry-to-Hero Progression
- **As a** developer, **I want** my commits, merged pull requests, and repository health to determine my hero's stats and gear, **so that** clean engineering habits translate into tangible RPG power.
- **Acceptance Criteria:**
  1. Hero XP is calculated logarithmically from commit diff sizes and merged PR counts to reward atomic commits over noisy mega-commits.
  2. Primary repository language dynamically assigns the hero's weapon class (e.g., TypeScript -> Strict Blade, Python -> Script Staff, Dockerfile -> Container Shield).
  3. Repository health (closed-to-total issue ratio, README presence, CI workflows) sets maximum Hero HP.

### US-3: Issue-Driven Monster Spawning
- **As a** developer, **I want** open GitHub issues to spawn distinct dungeon monsters scaled by severity and age, **so that** resolving technical debt feels like clearing dungeon floors.
- **Acceptance Criteria:**
  1. Open issues map to monster archetypes based on labels (`bug`/`critical` -> Regression Golem, `enhancement` -> Backlog Wraith, `documentation`/`chore` -> Debt Slime).
  2. Monster HP scales proportionally to issue severity and days elapsed since creation.
  3. Closing an issue on GitHub (or via Sandbox trigger) executes a finishing strike, defeats the active monster, awards loot gold, and advances to the next issue.

### US-4: 60 FPS Pixel-Art Canvas & Procedural 8-Bit Audio
- **As a** player, **I want** smooth retro visuals and responsive sound effects, **so that** combat actions feel tactile and engaging.
- **Acceptance Criteria:**
  1. The dungeon scene renders at 60 FPS on an HTML5 `<canvas>` decoupled from React DOM re-renders.
  2. Combat events trigger sprite animations, floating damage numbers, screen shake on critical hits, and synthesized 8-bit SFX via the Web Audio API (with a mute toggle).
  3. A live terminal-style **Combat Log** records every translated GitHub event.

## 3. Non-Functional Requirements
- **Rate-Limit Resilience:** GitHub REST requests must cache `ETag` headers and store processed event IDs in `localStorage` to prevent duplicate XP awards or redundant API quota usage.
- **Visual Identity:** Minimalist dark obsidian (`#0D0D0F`) and satin gold (`#D4AF37`) HUD wrapping the central pixel-art viewport.