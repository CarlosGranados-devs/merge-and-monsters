# T01 — Project Foundation

**Branch**: `chore/0.1.0-project-foundation`
**Status**: In Progress
**Version**: 0.1.0

---

## Objective

Establish the .kiro steering files, documentation structure, ADRs, roadmap, tasks, and history folders so every subsequent branch has a stable reference base. No application code is written in this branch.

---

## Scope

- `.kiro/steering/` files: `tech-stack.md` (already present), `conventions.md`, `agents.md`
- `docs/` full structure: INDEX, architecture (7 files), ADR (6 files), roadmap, tasks, history, gotchas
- Updated `README.md` with project description
- Updated `.gitignore` with standard Vite/Node entries
- `private/` folder stays in `.gitignore` (already set)

---

## Checklist

- [x] `.kiro/steering/conventions.md` created
- [x] `.kiro/steering/agents.md` created
- [x] `docs/INDEX.md` created
- [x] `docs/architecture/00-overview.md` created
- [x] `docs/architecture/01-project-structure.md` created
- [x] `docs/architecture/02-telemetry-mapping.md` created
- [x] `docs/architecture/03-game-engine.md` created
- [x] `docs/architecture/04-audio-synth.md` created
- [x] `docs/architecture/05-state-management.md` created
- [x] `docs/architecture/06-hud-and-ui.md` created
- [x] `docs/architecture/07-i18n.md` created
- [x] `docs/adr/v0.1.0/01-architecture-client-spa.md` created
- [x] `docs/adr/v0.1.0/02-state-zustand-localstorage.md` created
- [x] `docs/adr/v0.1.0/03-engine-canvas-decoupled.md` created
- [x] `docs/adr/v0.1.0/04-audio-web-audio-api.md` created
- [x] `docs/adr/v0.1.0/05-telemetry-octokit-etag.md` created
- [x] `docs/adr/v0.1.0/06-i18n-en-es.md` created
- [x] `docs/roadmap/v0.1.0/README.md` created with branch plan and stop points
- [x] `docs/tasks/v0.1.0/` files created (T01–T10)
- [x] `docs/history/v0.1.0/` placeholder and convention created
- [x] `docs/gotchas/v0.1.0/` placeholder and convention created
- [x] `README.md` updated with project description, setup, and play instructions
- [x] `.gitignore` updated with standard entries
- [x] Branch pushed and PR opened

---

## Acceptance Criteria

1. All `.kiro/steering/` files are in place and load without errors in Kiro CLI.
2. `docs/INDEX.md` accurately reflects the full structure.
3. All ADRs reference the correct source files (paths that will exist after R02+).
4. No application code is introduced.
5. `git ls-files private/` returns empty (private folder not tracked).

---

## Verification

- `git status` shows no untracked files in `private/`
- `git ls-files docs/` lists all expected documentation files
- Kiro CLI loads the steering files without errors

---

## References

- `docs/roadmap/v0.1.0/README.md` — R01
- `docs/history/v0.1.0/01-chore-project-foundation.md` — branch record
