# T04 — Telemetry Mapper

**Branch**: `feature/0.1.0-telemetry-mapper-C`
**Owner**: C
**Status**: Completed
**Version**: 0.1.0

---

## Objective

Implement `src/services/telemetryMapper.ts`: pure functions that convert raw GitHub API payloads into typed RPG entities (HeroState, MonsterEntity[], CombatEvent[]).

Corresponds to task 3 in `.kiro/specs/merge-and-monsters/tasks.md`.

---

## Scope

- `src/services/telemetryMapper.ts` — all mapping functions
- `src/services/telemetryMapper.test.ts` — unit tests

No side effects. No imports from the store. No network calls.

---

## Checklist

- [x] `calculateXp(commits, mergedPrs, processedIds)` returns `{ totalXp, newProcessedIds }`
- [x] XP formula: `floor(25 * ln(1 + delta_lines)) + 50 * n_pr`; `delta_lines` clamped to [1, 2000]
- [x] `deriveWeaponClass(language)` covers all 10 language-to-weapon mappings
- [x] `calculateMaxHp(closedIssues, totalIssues, hasReadme, hasCi)` returns a value in [100, 500]
- [x] `buildMonsterQueue(openIssues)` returns `MonsterEntity[]` sorted by severity (highest HP first)
- [x] Monster HP formula: `base * (1 + 0.15 * min(ageDays, 60))`
- [x] Zero open issues returns a single Training Dummy monster
- [x] `mapToCombatEvents(newCommits, newPrs, closedIssues)` returns `CombatEvent[]`
- [x] All formulas tested with boundary inputs (0 lines, 2000 lines, 60+ days, empty arrays)
- [x] `pnpm test` passes
- [x] `pnpm biome check --write .` passes
- [x] Branch pushed and PR opened

---

## Acceptance Criteria

1. `calculateXp` with `delta_lines = 0` clamps to 1 and returns `floor(25 * ln(2)) = 17`.
2. `calculateXp` with `delta_lines = 3000` clamps to 2000 and returns `floor(25 * ln(2001)) = 190`.
3. `calculateXp` does not award XP for IDs already in `processedIds`.
4. `deriveWeaponClass('TypeScript')` returns `'strictBlade'`.
5. `deriveWeaponClass(null)` returns `'adventurerFist'`.
6. A `bug` issue open for 30 days has HP `150 * (1 + 0.15 * 30) = 825`.
7. A `bug` issue open for 90 days has HP `150 * (1 + 0.15 * 60) = 1500` (capped at 60 days).

---

## Checkpoint 1 Corrections

R05 (`fix/0.1.0-checkpoint-1`) verified this module against the Sandbox dataset and corrected seven
behaviors that did not match `docs/architecture/02-telemetry-mapping.md`: PR dedupe key, XP over
processed IDs, churn vs net delta, per-commit XP, archetype coverage, HP rounding, and combat event
payloads. Details in `docs/tasks/v0.1.0/05-checkpoint-1.md`. Acceptance criterion 2's arithmetic was
also corrected (190, not 189).

---

## References

- `docs/adr/v0.1.0/05-telemetry-octokit-etag.md`
- `docs/architecture/02-telemetry-mapping.md`
- `src/types/index.ts`
