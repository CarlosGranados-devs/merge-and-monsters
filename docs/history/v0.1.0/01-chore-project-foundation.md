# 01 — chore/0.1.0-project-foundation

**Branch**: `chore/0.1.0-project-foundation`
**Status**: PR Open
**PR**: (pending push)
**Version**: 0.1.0
**Date**: 2025-01-27

---

## What Was Done

Established the full documentation and configuration base for Merge & Monsters. No application code introduced. All subsequent branches reference this structure.

---

## Main Changes

- `.kiro/steering/conventions.md`: work rules, commits, branches, versioning, i18n, DoD
- `.kiro/steering/agents.md`: agent entry point, non-negotiable rules, workflow, invariants
- `docs/INDEX.md`: master documentation map
- `docs/architecture/` (7 files): overview, project structure, telemetry mapping, game engine, audio synth, state management, HUD, i18n
- `docs/adr/v0.1.0/` (6 files): SPA architecture, Zustand state, canvas decoupling, Web Audio, Octokit ETag, i18n
- `docs/roadmap/v0.1.0/README.md`: 10-branch plan with stop points and dependencies
- `docs/tasks/v0.1.0/` (10 files, T01–T10): executable checklists for every branch
- `docs/history/` and `docs/gotchas/`: convention files, templates, v0.1.0 stubs
- `README.md`: updated with project description
- `.gitignore`: updated with standard Vite/Node entries

---

## Verification

- [x] `git ls-files private/` returns empty
- [x] All `docs/` files present and correctly linked
- [x] `.kiro/steering/` files load without errors
- [x] No application code introduced

---

## Gotchas

None.

---

## References

- Task: `docs/tasks/v0.1.0/01-project-foundation.md`
- Roadmap: `docs/roadmap/v0.1.0/README.md`
