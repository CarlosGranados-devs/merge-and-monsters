# T09 — Review Phase 1

**Branch**: `chore/0.1.0-review-phase-1`
**Status**: Pending
**Version**: 0.1.0

---

## Objective

Code review and stabilization of R02–R08. No new features. Fix all lint, typecheck, and test failures. Verify all acceptance criteria. Update documentation.

This is a stop point: the next phase (R10 release) does not start until the user validates this branch.

---

## Scope

- Review all source files in `src/`
- Run full verification suite
- Fix any bugs or quality issues found
- Update architecture docs if behavior changed
- Update task statuses in `docs/tasks/v0.1.0/`

---

## Checklist

- [ ] `pnpm build` passes clean
- [ ] `pnpm typecheck` passes with zero errors and zero `any`
- [ ] `pnpm biome check --write .` passes clean
- [ ] `pnpm test` passes (all test files)
- [ ] All acceptance criteria from T02–T08 verified manually
- [ ] Canvas loop verified not to trigger React re-renders (checked via React DevTools profiler)
- [ ] No external audio files in `public/` or `dist/`
- [ ] PAT not present in `localStorage` after a connect flow
- [ ] Both locale files have matching keys
- [ ] `docs/tasks/v0.1.0/` statuses updated for T02–T08
- [ ] `docs/INDEX.md` history table updated
- [ ] Any bugs found recorded in `docs/gotchas/v0.1.0/`
- [ ] Branch pushed and PR opened
- [ ] User validation received before proceeding to R10

---

## Acceptance Criteria

1. All automated checks pass.
2. Manual smoke test: load app, launch sandbox, simulate all three actions, verify HUD updates and combat log entries appear.
3. No `TODO` comments remain in `src/` that are unresolved.
4. Documentation accurately reflects the implemented system.

---

## References

- `docs/roadmap/v0.1.0/README.md` — stop point definition
- `docs/tasks/v0.1.0/` — all previous tasks
