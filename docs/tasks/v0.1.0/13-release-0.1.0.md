# T10 — Release 0.1.0

**Branch**: `chore/release-0.1.0`
**Owner**: C
**Status**: Pending
**Version**: 0.1.0

---

## Objective

Close version 0.1.0: bump `package.json` to `0.1.0`, update the public README, run final regression, and prepare the tag. No new features.

This is the final stop point. The user merges the PR and creates the tag `v0.1.0` after the merge.

---

## Scope

- `package.json` version field set to `0.1.0`
- `README.md` updated with screenshots, full setup instructions, and play guide
- Final regression run on the full verification suite
- `docs/INDEX.md` updated with final state
- `docs/history/v0.1.0/` all entries updated to `Merged` status

---

## Checklist

- [ ] `package.json` `version` field set to `"0.1.0"`
- [ ] `pnpm build` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm biome check --write .` passes
- [ ] `pnpm test` passes
- [ ] `README.md` has: project description, setup steps, sandbox instructions, keyboard shortcuts, deploy instructions
- [ ] `docs/INDEX.md` changelog updated
- [ ] All `docs/history/v0.1.0/` branch records show correct final status
- [ ] Branch pushed and PR opened
- [ ] Tag `v0.1.0` **not** created yet (user creates after merge)

---

## Acceptance Criteria

1. `package.json` version is `"0.1.0"`.
2. `README.md` can be followed by a new user to run the app locally in under 5 minutes.
3. All automated checks pass.
4. No features added in this branch.

---

## References

- `docs/roadmap/v0.1.0/README.md` — release stop point
- `.kiro/steering/conventions.md` — versioning rules
