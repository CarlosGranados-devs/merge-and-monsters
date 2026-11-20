# 07 — feature/0.1.0-canvas-renderer-Y

**Branch**: `feature/0.1.0-canvas-renderer-Y`
**Status**: Ready for PR
**PR**: (pending push)
**Owner**: Y
**Version**: 0.1.0
**Date**: 2026-11-19

---

## What Was Done

Built the 60 FPS canvas engine and, because R06 landed empty, recovered the Zustand store it depends
on.

- `Renderer.ts` draws everything with Canvas 2D calls: tiled dungeon floor, walls with a gold
  hairline, hero and monster sprites (two idle frames via a 30-tick bob), HP bars, floating numbers,
  and particles. No image assets.
- `GameLoop.ts` owns the `requestAnimationFrame` loop and the animation state. It reads the store
  with `getState()` only, drains combat events, advances timers, and draws. No React imports.
- `App.tsx` mounts the canvas, sizes it with `devicePixelRatio`, observes the container with
  `ResizeObserver`, starts the loop on mount, and stops it on unmount.

---

## Main Changes

- `src/engine/Renderer.ts` (new): palette, layout, sprite drawing, HP bars, floating numbers,
  particles, screen shake, `drawScene`.
- `src/engine/GameLoop.ts` (new): `GameLoop.start/stop`, `applyCombatEvent`, `advanceAnimation`.
- `src/engine/Renderer.test.ts`, `src/engine/GameLoop.test.ts` (new): 17 tests covering layout,
  draw calls, shake, HP bars, event reactions, timer expiry, and loop start/stop.
- `src/store/useGameStore.ts` (recovered, new): full store per the architecture doc, plus
  `pendingEvents` and `drainCombatEvents()` for the engine.
- `src/store/useGameStore.test.ts` (new): 13 tests for sandbox, connect, PAT handling, queue
  advance, log trimming, persistence, and reset.
- `src/App.test.tsx` (new): mount starts the loop, unmount stops it.
- `src/App.tsx`: placeholder canvas drawing replaced by the engine; `ResizeObserver` + DPR sizing.

---

## Verification

- [x] `pnpm test` passed (72 tests, 7 files)
- [x] `pnpm typecheck` passed
- [x] `pnpm biome check --write .` passed
- [x] `pnpm build` passed
- [x] Headless Firefox render: floor, walls, hero, monster, and both HP bars draw at 896x504 CSS px
- [x] `src/engine/` has no React imports (`grep -r "from 'react'" src/engine` is empty)

---

## Gotchas

- `canvas.fillStyle = 'var(--color-bg)'` silently draws nothing; canvas needs hex literals
  (`docs/gotchas/v0.1.0/993-trap-canvas-css-vars.md`).
- R06 merged empty; see `docs/history/v0.1.0/06-feature-game-store-C.md`.

---

## Known Gaps

- Closing a real GitHub issue is not detected: the client fetches a closed issue count, not closed
  issue events. Only the Sandbox controls defeat monsters in v0.1.0.
- `App.tsx` still shows the R02 placeholder HUD; R10 replaces it and adds the connect modal and
  sandbox controls, which is how a player will reach `launchSandbox()`.

---

## References

- Task: `docs/tasks/v0.1.0/07-canvas-renderer.md`
- Roadmap: `docs/roadmap/v0.1.0/README.md` (Phase 3 — State & Engine)
- ADR: `docs/adr/v0.1.0/03-engine-canvas-decoupled.md`
