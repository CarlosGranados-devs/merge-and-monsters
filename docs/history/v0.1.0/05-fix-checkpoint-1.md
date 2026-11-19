# 05 — fix/0.1.0-checkpoint-1

**Branch**: `fix/0.1.0-checkpoint-1`
**Status**: PR Open
**PR**: https://github.com/YonaZakkart/merge-and-monsters/pull/5
**Owner**: Y
**Version**: 0.1.0
**Date**: 2026-11-19

---

## What Was Done

Integration gate between Phase 2 and Phase 3. R03 and R04 were merged into `main`, then this branch
verified the pipeline `githubClient -> telemetryMapper -> HeroState / MonsterEntity[]` with a new
integration test over the Sandbox dataset.

The test failed on first run and exposed seven defects in `telemetryMapper.ts`, all fixed here.
No new production behavior was added.

---

## Main Changes

- `src/services/telemetryPipeline.test.ts` (new): composes the Sandbox payload into a `HeroState`
  and a monster queue, asserts exact XP / HP / archetype output, replay dedupe, event XP totals, and
  the Training Dummy fallback.
- `src/services/telemetryMapper.ts`: PR dedupe by `String(pr.id)`; XP only over new commits and PRs;
  diff churn `additions + deletions`; per-commit XP summed; archetype rules for
  bug/enhancement/documentation/unlabeled; `maxHp` rounded with `hp === maxHp`; queue sorted by HP;
  Training Dummy at 50 HP and 0 gold; max HP weights aligned with the architecture doc;
  `mapToCombatEvents` emits real XP and leaves `levelUp` to the store.
- `src/services/telemetryMapper.test.ts`: assertions updated for the corrected behavior, plus new
  cases for churn, per-commit XP, PR dedupe, and the Debt Slime / Mystery Crawler archetypes.
- `.kiro/steering/`: agents are no longer listed as co-authors (see gotcha 992).

---

## Verification

- [x] `pnpm install --frozen-lockfile` clean
- [x] `pnpm test` passed (42 tests, 3 files)
- [x] `pnpm typecheck` passed
- [x] `pnpm biome check --write .` passed
- [x] `pnpm build` passed
- [x] Sandbox pipeline: `strictBlade`, 693 XP, 463 max HP, queue `750 / 413 / 325 / 195`

---

## Gotchas

- `docs/gotchas/v0.1.0/991-error-pr-dedup-tostring.md` — PR dedupe collapsed every PR into one ID.
- `docs/gotchas/v0.1.0/992-trap-coauthor-org-email.md` — co-author trailers need a GitHub user account.

---

## References

- Task: `docs/tasks/v0.1.0/05-checkpoint-1.md`
- Roadmap: `docs/roadmap/v0.1.0/README.md` (Checkpoint 1)
- ADR: `docs/adr/v0.1.0/05-telemetry-octokit-etag.md`
