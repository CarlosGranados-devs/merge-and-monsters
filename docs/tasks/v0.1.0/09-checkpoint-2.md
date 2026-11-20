# T09 — Checkpoint 2

**Branch**: `fix/0.1.0-checkpoint-2`
**Owner**: C
**Status**: Completed
**Version**: 0.1.0

---

## Objective

Integration gate between Phase 3 (State & Engine) and Phase 4 (UI).

Branches R06 (`game-store-C`), R07 (`canvas-renderer-Y`), and R08 (`audio-synth-C`) must all
be merged to `main` before this branch is cut. This checkpoint wires the engine modules to the
store, verifies no React hook calls exist in `src/engine/`, and runs a manual smoke test of the
full game loop without any HUD components.

No new functionality. No new feature code.

---

## Pre-conditions

- [ ] R06 `feature/0.1.0-game-store-C` merged to `main`
- [ ] R07 `feature/0.1.0-canvas-renderer-Y` merged to `main`
- [ ] R08 `feature/0.1.0-audio-synth-C` merged to `main`

---

## Checklist

- [ ] Branch cut from `main` after all three pre-conditions are met
- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm biome check --write .` passes clean
- [ ] `pnpm test` passes (all tests from R05–R08)
- [ ] `GameLoop.ts` reads `useGameStore.getState()` — no `useStore`, no `useState`, no React imports
- [ ] `Renderer.ts` has no React imports
- [ ] `SoundSynth.ts` reads `muted` from the store via `useGameStore.getState()`
- [ ] `SoundSynth.setMuted(true/false)` calls `useGameStore.getState().setMuted()`
- [ ] `App.tsx` starts the loop via `GameLoop.start(canvasRef.current)` inside `useEffect`
- [ ] `App.tsx` stops the loop in `useEffect` cleanup
- [ ] Manual smoke test: canvas renders tile background, sprite bobs at ~60 FPS
- [ ] Manual smoke test: `store.simulateCommit()` triggers a floating number on canvas
- [ ] Manual smoke test: `store.simulateIssueClose()` plays `monsterSlain` SFX (unmuted)
- [ ] No `any` introduced in R06–R08
- [ ] `docs/history/v0.1.0/` entries created or updated for R06, R07, and R08
- [ ] Branch pushed and PR opened

---

## Common Issues to Check

- **Store shape mismatch**: `GameLoop` reads fields from `getState()` — verify field names match the store interface exactly (`hero`, `activeMonster`, `muted`, not aliases).
- **Canvas sizing**: `Renderer.ts` uses `canvas.width`/`canvas.height` — verify `App.tsx` sets these after mount.
- **AudioContext autoplay**: the first `SoundSynth.play()` call must follow a user gesture. In the smoke test, trigger it by clicking a button.
- **Muted flag sync**: if `store.muted` is `true` on load (persisted), `SoundSynth.isMuted()` must return `true` without a manual toggle.

---

## Outcome

The branch merged a single file (`docs/history/v0.1.0/09-fix-checkpoint-2.md`). The history claimed
`GameLoop.renderFrame()` played SFX for every combat event, but `GameLoop.ts` was unchanged and
nothing imported `SoundSynth`. R10 completed the wiring (`eventTypeToSfxType`, `SoundSynth.play`) and
added tests, so the mute toggle now has an effect.

---

## References

- Task R06: `docs/tasks/v0.1.0/06-game-store.md`
- Task R07: `docs/tasks/v0.1.0/07-canvas-renderer.md`
- Task R08: `docs/tasks/v0.1.0/08-audio-synth.md`
- Roadmap: `docs/roadmap/v0.1.0/README.md`
