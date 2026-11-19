# T11 — Checkpoint 3

**Branch**: `fix/0.1.0-checkpoint-3`
**Owner**: C
**Status**: Pending
**Version**: 0.1.0

---

## Objective

Final integration gate before the stabilization review (R12).

Branch R10 (`hud-components-Y`) must be merged to `main` before this branch is cut. This
checkpoint runs a full end-to-end manual test of the complete application: modal connect flow,
sandbox mode, all three simulation buttons, HUD live updates, combat log, canvas and audio all
working together. It also performs a targeted security check on PAT handling.

No new functionality. No new feature code.

---

## Pre-conditions

- [ ] R10 `feature/0.1.0-hud-components-Y` merged to `main`

---

## Checklist

- [ ] Branch cut from `main` after pre-condition is met
- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm biome check --write .` passes clean
- [ ] `pnpm test` passes (all tests)
- [ ] `pnpm build` completes without errors

**End-to-end manual test sequence**:
- [ ] Load app — `RepoConnectModal` shown fullscreen
- [ ] Click "Launch Dungeon Sandbox" — modal closes, game layout appears with `SandboxControls`
- [ ] `HeroHud` shows correct weapon class (`Strict Blade`), HP bar, XP bar, gold = 0
- [ ] Canvas renders dungeon floor and hero sprite with idle bob
- [ ] Active monster sprite renders in right-center
- [ ] Click "Simulate Commit" — floating damage number appears on canvas, XP bar increases, combat log entry added
- [ ] Click "Simulate PR Merge" — same, additional XP awarded
- [ ] Click "Simulate Issue Close" — monster defeated, `monsterSlain` SFX plays (if unmuted), gold counter increases, next monster appears (or canvas shows empty right-center)
- [ ] Click mute button — subsequent SFX are silent; label changes
- [ ] Click unmute — SFX return; label changes

**Security / correctness checks**:
- [ ] `sessionStorage` does not contain a PAT after sandbox launch (no PAT to begin with; confirm it stays empty)
- [ ] `localStorage` does not contain a PAT key
- [ ] No string literals in JSX: `grep -r 'return.*"[A-Z]' src/components/` returns no matches
- [ ] Both `en.json` and `es.json` have identical key sets: compare key count
- [ ] No `any` in `src/components/`

**Docs**:
- [ ] `docs/history/v0.1.0/` entry created or updated for R10
- [ ] Branch pushed and PR opened

---

## Common Issues to Check

- **Combat log scroll**: auto-scroll to bottom; verify it does not jump when the user is scrolled up manually.
- **Modal focus trap**: Tab key must not escape the modal while it is open.
- **Mute persistence**: reload the page while muted — HUD should show muted state without user toggling.
- **Canvas resize**: resize the browser window — canvas should scale without distortion or blank areas.
- **Race condition**: rapid clicks on "Simulate Commit" should not stack overlapping animations.

---

## References

- Task R10: `docs/tasks/v0.1.0/10-hud-components.md`
- Roadmap: `docs/roadmap/v0.1.0/README.md`
