# Architecture Overview — Merge & Monsters

**Last updated**: 2025-01-27
**Version**: 0.1.0

---

## Purpose

Merge & Monsters is a 100% client-side SPA that turns a GitHub repository's activity into a retro pixel-art dungeon crawler. Commits award hero XP, open issues spawn monsters scaled by severity and age, and closing an issue defeats the active monster. The experience runs entirely in the browser with no server.

---

## Principles

1. **No backend.** All state lives in `localStorage` and `sessionStorage`. The GitHub REST API is the only external dependency.
2. **Canvas decoupled from React.** The 60 FPS render loop reads Zustand state directly via `getState()` and never triggers React re-renders.
3. **Zero audio assets.** All SFX are synthesized at runtime via the Web Audio API.
4. **Graceful degradation.** Rate-limited or offline users fall back to Sandbox mode without losing game state.
5. **i18n from day one.** Every user-visible string goes through `t()`. English is the source; Spanish is maintained in parallel.

---

## Stack

| Layer | Tool |
|-------|------|
| Bundler | Vite |
| UI framework | React 19 + TypeScript (strict) |
| Styling | Tailwind CSS |
| State | Zustand |
| GitHub API | @octokit/rest |
| Canvas rendering | HTML5 Canvas API (native) |
| Audio | Web Audio API (native) |
| i18n | i18next + react-i18next |
| Linting / formatting | Biome |
| Package manager | pnpm |

---

## Module Map

```text
src/
├── services/
│   ├── githubClient.ts      # Octokit wrapper, ETag caching, Sandbox fallback
│   └── telemetryMapper.ts   # Pure functions: commits/PRs/issues -> HeroState, MonsterEntity[], CombatEvent[]
├── store/
│   └── useGameStore.ts      # Zustand store: hero stats, monster queue, combat log, processed IDs
├── engine/
│   ├── GameLoop.ts          # requestAnimationFrame loop, reads store via getState()
│   ├── Renderer.ts          # Canvas draw calls: tiles, sprites, particles, damage numbers, shake
│   └── SoundSynth.ts        # Web Audio oscillators: attack, crit, levelUp, monsterSlain
├── components/
│   ├── RepoConnectModal.tsx  # Repository slug input, PAT field, Sandbox launch button
│   ├── HeroHud.tsx           # Hero name, HP bar, XP bar, weapon class, gold
│   ├── CombatLog.tsx         # Terminal-style scrolling log of translated GitHub events
│   └── SandboxControls.tsx   # Simulate Commit / PR Merge / Issue Close buttons
├── lib/
│   └── i18n/
│       ├── index.ts          # i18next configuration
│       └── locales/
│           ├── en.json       # English strings (source)
│           └── es.json       # Spanish strings
├── types/
│   └── index.ts             # HeroState, MonsterEntity, CombatEvent, WeaponClass, RepoHealth
├── App.tsx
└── main.tsx
```

---

## Data Flow

```text
GitHub REST API
      |
      v
githubClient.ts  ---- ETag cache (localStorage) ---->  raw API payloads
      |
      v
telemetryMapper.ts  (pure functions, no side effects)
      |
      +-----> HeroState (XP, HP, weapon class)
      +-----> MonsterEntity[] (from open issues)
      +-----> CombatEvent[] (from closed issues / commits)
      |
      v
useGameStore.ts  (Zustand)
      |
      +-----> React components (HeroHud, CombatLog, RepoConnectModal)  [via subscribe]
      +-----> GameLoop.ts / Renderer.ts                                [via getState()]
```

---

## Visual Identity

| Token | Value | Use |
|-------|-------|-----|
| `--color-bg` | `#0D0D0F` | Page and HUD background |
| `--color-gold` | `#D4AF37` | Borders, headings, HP fill, gold counter |
| `--color-text` | `#E8E8E8` | Body text |
| `--color-danger` | `#C0392B` | Monster HP, critical hit numbers |
| `--color-muted` | `#555566` | Disabled states, placeholder text |

The pixel-art canvas viewport sits centered on the dark background. The HUD wraps it with the gold/dark palette. No glassmorphism; flat dark surfaces with gold accents.

---

## Key Formulas

**Hero XP per commit**
```
XP = floor(25 * ln(1 + delta_lines)) + 50 * n_pr
```
- `delta_lines`: net line changes, clamped to [1, 2000]
- `n_pr`: merged pull requests in the fetched window

**Monster HP**
```
HP = base_severity * (1 + 0.15 * age_days)
```
- `base_severity`: 150 (bug/critical), 100 (enhancement), 75 (default)
- `age_days`: issue age in days, capped at 60

---

## Persistence Strategy

| Data | Storage | Reason |
|------|---------|--------|
| Processed commit/PR/issue IDs | `localStorage` | Survive page refresh; prevent duplicate XP |
| Hero state (XP, HP, gold, level) | `localStorage` via Zustand persist | Resume session |
| GitHub PAT | `sessionStorage` | Cleared on tab close; never persisted long-term |
| ETag headers per endpoint | `localStorage` | Conditional requests save API quota |

---

## References

- `docs/adr/v0.1.0/` — all technical decisions for this version
- `docs/architecture/02-telemetry-mapping.md` — XP and monster formulas in detail
- `docs/architecture/03-game-engine.md` — Canvas loop and renderer design
- `docs/architecture/04-audio-synth.md` — Web Audio SFX design
- `docs/architecture/05-state-management.md` — Zustand store shape
