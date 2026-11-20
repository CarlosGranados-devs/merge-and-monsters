# Implementation Plan — Merge & Monsters

- [x] 0. Project foundation: .kiro steering files, docs/ structure (architecture, ADRs, roadmap, tasks, history, gotchas), README, and .gitignore
- [x] 1. Scaffold Vite + React + TypeScript project with pnpm, Tailwind CSS, and Biome configuration
- [x] 2. Implement GitHub telemetry client (`src/services/githubClient.ts`) with Octokit, ETag caching, and offline Sandbox mock dataset
- [x] 3. Implement deterministic RPG mapper (`src/services/telemetryMapper.ts`) for logarithmic XP, hero weapon classes, and issue-based monster scaling
- [x] 4. Create Zustand global store (`src/store/useGameStore.ts`) with `localStorage` persistence for processed event IDs
- [x] 5. Build 60 FPS HTML5 Canvas dungeon renderer (`src/engine/GameLoop.ts` & `Renderer.ts`) with pixel-art sprites, floating damage numbers, and screen shake
- [ ] 6. Build zero-asset 8-bit Web Audio synthesizer (`src/engine/SoundSynth.ts`) with mute toggle
- [x] 7. Build dark obsidian & satin gold HUD (`RepoConnectModal`, `HeroHud`, `CombatLog`, and Sandbox simulation controls)
- [ ] 8. Configure production build and deploy static bundle