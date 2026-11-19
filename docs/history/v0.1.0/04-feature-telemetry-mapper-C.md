# 04 — feature/0.1.0-telemetry-mapper-C

**Branch**: `feature/0.1.0-telemetry-mapper-C`
**Status**: Merged
**PR**: https://github.com/YonaZakkart/merge-and-monsters/pull/4
**Owner**: C
**Version**: 0.1.0
**Date**: 2026-11-19

---

## What Was Done

Implemented the pure RPG mapping layer: logarithmic XP, weapon class derivation, hero max HP,
the monster queue, and combat event mapping. The module has no side effects and imports only the
shared types, so the store can call it from any context.

---

## Main Changes

- `src/services/telemetryMapper.ts`: `calculateXp`, `deriveWeaponClass`, `calculateMaxHp`,
  `buildMonsterQueue`, `mapToCombatEvents`.
- `src/services/telemetryMapper.test.ts`: 23 unit tests covering the formulas, the language table,
  HP bounds, the Training Dummy, and event mapping.

---

## Verification

- [x] `pnpm test` passed
- [x] `pnpm typecheck` passed
- [x] `pnpm biome check --write .` passed
- [x] `pnpm build` passed

---

## Gotchas

Checkpoint 1 found seven behavioral defects in this module (XP dedupe, churn vs net delta,
per-commit vs aggregate XP, archetype coverage, HP rounding, max HP weights, and event payloads).
They were fixed in `fix/0.1.0-checkpoint-1`; see `docs/tasks/v0.1.0/05-checkpoint-1.md` and
`docs/gotchas/v0.1.0/991-error-pr-dedup-tostring.md`.

The branch did not update its task, roadmap, or history records; Checkpoint 1 closed them.

---

## References

- Task: `docs/tasks/v0.1.0/04-telemetry-mapper.md`
- Roadmap: `docs/roadmap/v0.1.0/README.md` (Phase 2 — Core modules)
- ADR: `docs/adr/v0.1.0/05-telemetry-octokit-etag.md`
