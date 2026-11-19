# Technical Design Document — Merge & Monsters

## 1. Architecture Overview
Merge & Monsters is a 100% client-side Single Page Application (SPA) built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**. Keeping the architecture serverless ensures zero-latency local state execution, trivial static deployment, and strict isolation of optional GitHub tokens inside the user's browser.

```text
+-------------------+      +-----------------------+      +--------------------+
|  GitHub REST API  | ---> |  telemetryMapper.ts   | ---> |   useGameStore     |
|  (Octokit + ETag) |      |  (XP / HP / Monsters) |      |   (Zustand State)  |
+-------------------+      +-----------------------+      +---------+----------+
                                                                    |
                           +-----------------------+                |
                           |   React HUD & Logs    | <--------------+
                           |  (Tailwind Dark/Gold) |                |
                           +-----------------------+                v
                                                          +--------------------+
                                                          |   GameLoop.ts      |
                                                          | (Canvas 60 FPS +   |
                                                          |  Web Audio Synth)  |
                                                          +--------------------+
```
## 2. Core Mathematical 

FormulasHero Experience Gain
To incentivize small, atomic commits rather than massive unreviewed diffs:

$$XP_{\text{commit}} = \left\lfloor 25 \cdot \ln(1 + \Delta_{\text{lines}}) \right\rfloor + 50 \cdot N_{\text{PR}}$$$\Delta_{\text{lines}}$: Clamped net line additions/deletions ($1 \le \Delta_{\text{lines}} \le 2000$).$N_{\text{PR}}$: Number of merged pull requests in the fetched window.

Monster Hit Points
Open issues grow stronger the longer they remain unresolved:
$$HP_{\text{monster}} = B_{\text{severity}} \cdot \left(1 + 0.15 \cdot t_{\text{days}}\right)$$$B_{\text{severity}}$: Base HP by label (critical/bug = 150, enhancement = 100, default = 75).$t_{\text{days}}$: Age of the open issue in days, capped at 60 days to keep bosses defeatable.

## 3 ModulePathResponsibility
GitHub Clientsrc/services/githubClient.tsWraps @octokit/rest with conditional If-None-Match (ETag) caching and fallback to Sandbox mock payloads.Telemetry Mappersrc/services/telemetryMapper.tsPure functions converting commits, PRs, languages, and issues into deterministic HeroState, MonsterEntity[], and CombatEvent[].Game Storesrc/store/useGameStore.tsZustand store holding hero stats, active monster queue, processed event SHA/ID set (localStorage), and combat log entries.Game Loop & Renderersrc/engine/GameLoop.ts & Renderer.tsIndependent requestAnimationFrame loop rendering tile background, hero/monster idle & attack frames, particle bursts, and floating damage text.Audio Synthesizersrc/engine/SoundSynth.tsZero-asset Web Audio API oscillator generator producing square/triangle wave SFX (attack, crit, levelUp, monsterSlain).

## 4. State Synchronization Strategy
React components subscribe to Zustand slices (HeroHud, CombatLog, RepoConnectModal).

GameLoop.ts reads directly from useGameStore.getState() inside each animation frame and consumes queued CombatEvent items sequentially so animations never overlap or trigger React re-renders at 60 FPS.

## 5. Error Handling & Edge Cases
Empty Repositories: Repositories with 0 open issues spawn a repeatable "Training Dummy" monster so the player can still test commit attacks.

API Rate Limit (403): Displays a non-blocking banner prompting the user to add a free read-only GitHub PAT or switch seamlessly to Sandbox mode.