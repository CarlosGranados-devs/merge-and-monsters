# T11 — Checkpoint 3

**Branch**: `fix/0.1.0-checkpoint-3`
**Owner**: C
**Status**: Completed
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

- [x] R10 `feature/0.1.0-hud-components-Y` merged to `main`

---

## Checklist

- [x] Branch cut from `main` after pre-condition is met
- [x] `pnpm typecheck` passes with zero errors
- [x] `pnpm biome check --write .` passes clean
- [x] `pnpm test` passes (all tests)
- [x] `pnpm build` completes without errors

**End-to-end manual test sequence**:
- [x] Load app — `RepoConnectModal` shown fullscreen
- [x] Click "Launch Dungeon Sandbox" — modal closes, game layout appears with `SandboxControls`
- [x] `HeroHud` shows correct weapon class (`Strict Blade`), HP bar, XP bar, gold = 0
- [x] Canvas renders dungeon floor and hero sprite with idle bob
- [x] Active monster sprite renders in right-center
- [x] Click "Simulate Commit" — floating damage number appears on canvas, XP bar increases, combat log entry added
- [x] Click "Simulate PR Merge" — same, additional XP awarded
- [x] Click "Simulate Issue Close" — monster defeated, `monsterSlain` SFX plays (if unmuted), gold counter increases, next monster appears (or canvas shows empty right-center)
- [x] Click mute button — subsequent SFX are silent; label changes
- [x] Click unmute — SFX return; label changes

**Security / correctness checks**:
- [x] `sessionStorage` does not contain a PAT after sandbox launch (no PAT to begin with; confirm it stays empty)
- [x] `localStorage` does not contain a PAT key
- [x] No string literals in JSX: `grep -r 'return.*"[A-Z]' src/components/` returns no matches
- [x] Both `en.json` and `es.json` have identical key sets: compare key count
- [x] No `any` in `src/components/`

**Docs**:
- [x] `docs/history/v0.1.0/` entry created or updated for R10
- [x] Branch pushed and PR opened

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
