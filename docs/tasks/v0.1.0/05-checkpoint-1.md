# T05 — Checkpoint 1

**Branch**: `fix/0.1.0-checkpoint-1`
**Owner**: Y
**Status**: Pending
**Version**: 0.1.0

---

## Objective

Integration gate between Phase 2 (Core Modules) and Phase 3 (State & Engine).

Branches R03 (`github-client-Y`) and R04 (`telemetry-mapper-C`) must both be merged to `main`
before this branch is cut. This checkpoint verifies they work together correctly, fixes any
type mismatches or import errors, and confirms the full data pipeline works end-to-end:
Sandbox mock data flows through `githubClient` -> `telemetryMapper` -> typed RPG entities.

No new functionality. No new feature code.

---

## Pre-conditions

- [ ] R03 `feature/0.1.0-github-client-Y` merged to `main`
- [ ] R04 `feature/0.1.0-telemetry-mapper-C` merged to `main`

---

## Checklist

- [ ] Branch cut from `main` after both pre-conditions are met
- [ ] `pnpm install` clean (no missing deps)
- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm biome check --write .` passes clean
- [ ] `pnpm test` passes (R03 + R04 unit tests)
- [ ] Manual integration check: `getSandboxData()` output passed through all mapper functions returns valid `HeroState` and `MonsterEntity[]`
- [ ] No type `any` introduced by either branch
- [ ] `src/types/index.ts` has no duplicate or conflicting type definitions
- [ ] Any import path corrections applied
- [ ] `docs/history/v0.1.0/` entries created or updated for R03 and R04
- [ ] Branch pushed and PR opened

---

## Common Issues to Check

- **Type drift**: `RawCommit`, `RawPr`, `RawIssue` defined in `src/types/index.ts` by R02 — verify R03 and R04 import from there, not redefine locally.
- **ETag cache key format**: confirm `githubClient.ts` and any tests agree on the `localStorage` key prefix (`etag:`).
- **Sandbox mock types**: confirm `getSandboxData()` returns all fields that `telemetryMapper` reads.
- **Test isolation**: R03 and R04 tests must not share `localStorage` state; each test clears the cache.

---

## References

- Task R03: `docs/tasks/v0.1.0/03-github-client.md`
- Task R04: `docs/tasks/v0.1.0/04-telemetry-mapper.md`
- Roadmap: `docs/roadmap/v0.1.0/README.md`
