# 991 — error: PR dedupe collapsed every pull request into one ID

**Version**: 0.1.0
**Status**: Resolved
**Type**: error
**Found in branch**: `fix/0.1.0-checkpoint-1` (code from `feature/0.1.0-telemetry-mapper-C`)
**Resolved in branch**: `fix/0.1.0-checkpoint-1`

---

## Symptoms

`calculateXp` treated all merged pull requests as a single event. The first poll awarded XP for
every PR, but the processed-ID set stored `"[object Object]"` once, so later polls found that same
string and awarded nothing for genuinely new PRs. The reverse also happened: XP was awarded again
for PRs that had already been processed when the set was rebuilt.

---

## Reproduction

```ts
calculateXp([], [prA, prB], new Set());
// totalXp === 100 (two PRs), newProcessedIds === Set { "[object Object]" }
```

The second call with that set returns `totalXp === 0` even if `prC` is new.

---

## Root Cause

`pr.toString()` calls `Object.prototype.toString` on a plain object, which always returns
`"[object Object]"`. It never reads `pr.id`, so the identifier is constant for every PR.

---

## Solution

Deduplicate with `String(pr.id)`, matching the "merged PR IDs" contract in
`docs/architecture/02-telemetry-mapping.md`. The unit test `deduplicates merged PRs by numeric id`
now guards the behavior.

---

## Verification

- `src/services/telemetryMapper.test.ts` — replaying the same PR list with the returned
  `newProcessedIds` yields `totalXp === 0`.
- `src/services/telemetryPipeline.test.ts` — replaying the Sandbox payload yields `totalXp === 0`.

---

## References

- Task: `docs/tasks/v0.1.0/05-checkpoint-1.md`
- Architecture: `docs/architecture/02-telemetry-mapping.md`
