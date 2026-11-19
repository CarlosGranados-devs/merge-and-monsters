# INDEX — Documentation Map

**Project**: Merge & Monsters
**Last updated**: 2025-01-27
**Current version**: `0.1.0` (in progress)
**Branch**: `chore/0.1.0-project-foundation`

> Entry point for agents: `.kiro/steering/agents.md`. Work conventions: `.kiro/steering/conventions.md`.

---

## 1. Root Documents

| File | Purpose |
|------|---------|
| `README.md` | Public project overview, setup, and play instructions. |
| `docs/INDEX.md` | This map. |

---

## 2. Directory Structure

```text
docs/
├── INDEX.md                  # this file
├── architecture/             # how the system works (living docs, updated with the system)
├── adr/                      # technical decisions
│   └── v0.1.0/               # ADRs for version 0.1.0
├── roadmap/                  # branch plan and stop points per version
│   └── v0.1.0/               # roadmap for version 0.1.0
├── tasks/                    # executable work with checklists
│   └── v0.1.0/               # tasks for version 0.1.0
├── history/                  # record of every branch pushed and ready for PR
│   └── v0.1.0/               # branch history for version 0.1.0
└── gotchas/                  # bugs, traps, and unexpected behaviors
    ���── v0.1.0/               # gotchas found during version 0.1.0
```

- Numbering is **global** and does not reset between versions.
- README convention files live at the root of each folder and apply to all versions.
- `architecture/` is not versioned by subfolder: it describes the current system and is updated in place.

---

## 3. Architecture

| File | Content |
|------|---------|
| `architecture/00-overview.md` | Purpose, principles, stack, module map, and data flow. |
| `architecture/01-project-structure.md` | Folder layout, responsibilities, and dependency rules. |
| `architecture/02-telemetry-mapping.md` | GitHub API client, ETag caching, XP/HP formulas, monster archetypes. |
| `architecture/03-game-engine.md` | Canvas loop, renderer, sprite system, particles, and screen shake. |
| `architecture/04-audio-synth.md` | Web Audio API oscillator design, waveforms, and mute toggle. |
| `architecture/05-state-management.md` | Zustand store structure, localStorage persistence, and canvas sync. |
| `architecture/06-hud-and-ui.md` | HUD components, dark/gold palette, combat log, and modal structure. |
| `architecture/07-i18n.md` | Locales, namespaces, keys, and format conventions. |

---

## 4. ADR — Decision Register

### Version `0.1.0` — `adr/v0.1.0/`

| No. | File | Decision | Status |
|-----|------|----------|--------|
| 01 | `adr/v0.1.0/01-architecture-client-spa.md` | 100% client SPA, no backend | Accepted |
| 02 | `adr/v0.1.0/02-state-zustand-localstorage.md` | Zustand + localStorage for game state | Accepted |
| 03 | `adr/v0.1.0/03-engine-canvas-decoupled.md` | Canvas loop decoupled from React renders | Accepted |
| 04 | `adr/v0.1.0/04-audio-web-audio-api.md` | Zero-asset SFX via Web Audio API | Accepted |
| 05 | `adr/v0.1.0/05-telemetry-octokit-etag.md` | Octokit with ETag caching and Sandbox fallback | Accepted |
| 06 | `adr/v0.1.0/06-i18n-en-es.md` | i18next with English source and Spanish translation | Accepted |

---

## 5. Roadmap

### Version `0.1.0` — `roadmap/v0.1.0/`

| No. | Branch | File | Status |
|-----|--------|------|--------|
| R01 | `chore/0.1.0-project-foundation` | `roadmap/v0.1.0/01-project-foundation.md` | In Progress |
| R02 | `feature/0.1.0-scaffold` | `roadmap/v0.1.0/02-scaffold.md` | Planned |
| R03 | `feature/0.1.0-github-client` | `roadmap/v0.1.0/03-github-client.md` | Planned |
| R04 | `feature/0.1.0-telemetry-mapper` | `roadmap/v0.1.0/04-telemetry-mapper.md` | Planned |
| R05 | `feature/0.1.0-game-store` | `roadmap/v0.1.0/05-game-store.md` | Planned |
| R06 | `feature/0.1.0-canvas-renderer` | `roadmap/v0.1.0/06-canvas-renderer.md` | Planned |
| R07 | `feature/0.1.0-audio-synth` | `roadmap/v0.1.0/07-audio-synth.md` | Planned |
| R08 | `feature/0.1.0-hud-components` | `roadmap/v0.1.0/08-hud-components.md` | Planned |
| R09 | `chore/0.1.0-review-phase-1` | `roadmap/v0.1.0/09-review-phase-1.md` | Planned |
| R10 | `chore/release-0.1.0` | `roadmap/v0.1.0/10-release-0.1.0.md` | Planned |

---

## 6. Tasks

### Version `0.1.0` — `tasks/v0.1.0/`

| No. | File | Branch | Status |
|-----|------|--------|--------|
| T01 | `tasks/v0.1.0/01-project-foundation.md` | R01 | In Progress |
| T02 | `tasks/v0.1.0/02-scaffold.md` | R02 | Pending |
| T03 | `tasks/v0.1.0/03-github-client.md` | R03 | Pending |
| T04 | `tasks/v0.1.0/04-telemetry-mapper.md` | R04 | Pending |
| T05 | `tasks/v0.1.0/05-game-store.md` | R05 | Pending |
| T06 | `tasks/v0.1.0/06-canvas-renderer.md` | R06 | Pending |
| T07 | `tasks/v0.1.0/07-audio-synth.md` | R07 | Pending |
| T08 | `tasks/v0.1.0/08-hud-components.md` | R08 | Pending |
| T09 | `tasks/v0.1.0/09-review-phase-1.md` | R09 | Pending |
| T10 | `tasks/v0.1.0/10-release-0.1.0.md` | R10 | Pending |

---

## 7. Branch History

### Version `0.1.0` — `history/v0.1.0/`

| No. | File | Branch | Status |
|-----|------|--------|--------|
| 01 | `history/v0.1.0/01-chore-project-foundation.md` | `chore/0.1.0-project-foundation` | In Progress |

---

## 8. Gotchas

### Version `0.1.0` — `gotchas/v0.1.0/`

No findings recorded yet.

---

## 9. Documentation Changelog

| Date | Change |
|------|--------|
| 2025-01-27 | Initial documentation structure created. ADRs, architecture, roadmap, tasks, history, and gotchas folders for v0.1.0. Steering files in .kiro/. |
