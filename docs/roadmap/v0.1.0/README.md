# Roadmap — Version 0.1.0

**Version**: 0.1.0
**Status**: In Progress
**Phase**: Foundation

---

## Branch Plan

| No. | Branch | Purpose | Status |
|-----|--------|---------|--------|
| R01 | `chore/0.1.0-project-foundation` | .kiro steering, docs structure, ADRs, roadmap, tasks | In Progress |
| R02 | `feature/0.1.0-scaffold` | Vite + React + TS + Tailwind + Biome + i18n scaffold | Planned |
| R03 | `feature/0.1.0-github-client` | githubClient.ts with Octokit, ETag caching, Sandbox mock | Planned |
| R04 | `feature/0.1.0-telemetry-mapper` | telemetryMapper.ts: XP, HP, weapon class, monsters | Planned |
| R05 | `feature/0.1.0-game-store` | useGameStore.ts with Zustand persist | Planned |
| R06 | `feature/0.1.0-canvas-renderer` | GameLoop.ts + Renderer.ts at 60 FPS | Planned |
| R07 | `feature/0.1.0-audio-synth` | SoundSynth.ts with Web Audio oscillators | Planned |
| R08 | `feature/0.1.0-hud-components` | RepoConnectModal, HeroHud, CombatLog, SandboxControls | Planned |
| R09 | `chore/0.1.0-review-phase-1` | Code review, lint, typecheck, regression, docs update | Planned |
| R10 | `chore/release-0.1.0` | Version bump, final README, regression, tag prep | Planned |

---

## Stop Points

- **R09** (`chore/0.1.0-review-phase-1`): review all code from R02–R08. Fix bugs, clean lint, update docs. User validates before R10.
- **R10** (`chore/release-0.1.0`): bump `package.json` to `0.1.0`, update public README, run final regression, prep tag. User merges and creates tag.

---

## Dependencies

```
R01 (foundation)
  -> R02 (scaffold) must exist before any code branch
     -> R03, R04 can run in parallel (pure modules, no UI)
     -> R05 depends on types from R04
     -> R06 depends on R05 (reads store)
     -> R07 depends on R05 (muted flag in store)
     -> R08 depends on R03, R04, R05, R06, R07
        -> R09 (review)
           -> R10 (release)
```

---

## References

- `docs/tasks/v0.1.0/` — executable checklists for each branch
- `docs/history/v0.1.0/` — record of branches pushed
- `docs/adr/v0.1.0/` — technical decisions
