# T05 — Checkpoint 1

**Branch**: `fix/0.1.0-checkpoint-1`
**Owner**: Y
**Status**: Completed
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

- [x] R03 `feature/0.1.0-github-client-Y` merged to `main` (PR #3)
- [x] R04 `feature/0.1.0-telemetry-mapper-C` merged to `main` (PR #4)

---

## Checklist

- [x] Branch cut from `main` after both pre-conditions are met
- [x] `pnpm install` clean (no missing deps)
- [x] `pnpm typecheck` passes with zero errors
- [x] `pnpm biome check --write .` passes clean
- [x] `pnpm test` passes (R03 + R04 unit tests)
- [x] Manual integration check: `getSandboxData()` output passed through all mapper functions returns valid `HeroState` and `MonsterEntity[]`
- [x] No type `any` introduced by either branch
- [x] `src/types/index.ts` has no duplicate or conflicting type definitions
- [x] Any import path corrections applied
- [x] `docs/history/v0.1.0/` entries created or updated for R03 and R04
- [x] Branch pushed and PR opened

---

## Common Issues to Check

- **Type drift**: `RawCommit`, `RawPr`, `RawIssue` defined in `src/types/index.ts` by R02 — verify R03 and R04 import from there, not redefine locally.
- **ETag cache key format**: confirm `githubClient.ts` and any tests agree on the `localStorage` key prefix (`etag:`).
- **Sandbox mock types**: confirm `getSandboxData()` returns all fields that `telemetryMapper` reads.
- **Test isolation**: R03 and R04 tests must not share `localStorage` state; each test clears the cache.

---

## Findings and Fixes

The integration test (`src/services/telemetryPipeline.test.ts`) failed on first run. Seven defects
were found in `telemetryMapper.ts` and fixed in this branch:

| # | Defect | Fix |
|---|--------|-----|
| 1 | PR dedupe used `pr.toString()` (`"[object Object]"`), so every PR shared one processed ID and XP was never re-awarded or never deduped correctly | Dedupe by `String(pr.id)` |
| 2 | XP was calculated over all commits, including already-processed ones (duplicate XP on refresh) | XP is calculated only over new commits and new PRs |
| 3 | `delta_lines` used `additions - deletions`; a rewrite with 100 added and 100 deleted scored the minimum 17 XP | Uses diff churn `additions + deletions`, as the architecture doc states |
| 4 | One log was applied to the summed delta of the whole window, contradicting the per-commit formula and the "reward atomic commits" intent | Per-commit XP is summed |
| 5 | Monster archetypes ignored `documentation` / `chore` / `debt` (Debt Slime) and the unlabeled fallback (Mystery Crawler); HP was not rounded, `hp` was decremented per queue position, and the Training Dummy had 10 HP and a gold reward | Archetype rules per label, `maxHp` rounded, `hp === maxHp`, queue sorted by HP, Training Dummy at 50 HP and 0 gold |
| 6 | `calculateMaxHp` used a `ratio * 200` scale with flat 20-point bonuses, not the documented `150` / `100` / `150` weights | Formula matches `docs/architecture/02-telemetry-mapping.md` |
| 7 | `mapToCombatEvents` emitted `xpGain` with `xp: 1` and a `levelUp` event per merged PR | `xpGain` carries the real per-commit XP or 50 for a PR; `levelUp` is left to the store, which owns level thresholds |

R04 unit tests were updated to assert the corrected behavior. No production behavior was added.

---

## Verification

| Command | Result |
|---------|--------|
| `pnpm install --frozen-lockfile` | Clean, lockfile matches `package.json` |
| `pnpm test` | 42 tests passed (3 files) |
| `pnpm typecheck` | Pass, zero errors |
| `pnpm biome check --write .` | Pass, no fixes applied |
| `pnpm build` | Pass |

Integration result with the Sandbox dataset: `weaponClass: strictBlade`, `xp: 693`, `maxHp: 463`,
and a four-monster queue ordered `750 / 413 / 325 / 195` HP.

---

## References

- Task R03: `docs/tasks/v0.1.0/03-github-client.md`
- Task R04: `docs/tasks/v0.1.0/04-telemetry-mapper.md`
- Roadmap: `docs/roadmap/v0.1.0/README.md`
- Gotchas: `docs/gotchas/v0.1.0/991-error-pr-dedup-tostring.md`
