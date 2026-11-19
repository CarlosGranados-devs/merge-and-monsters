# T06 — Canvas Renderer

**Branch**: `feature/0.1.0-canvas-renderer`
**Status**: Pending
**Version**: 0.1.0

---

## Objective

Implement `src/engine/GameLoop.ts` and `src/engine/Renderer.ts`: a 60 FPS `requestAnimationFrame` loop with sprite rendering, HP bars, floating damage numbers, particles, and screen shake.

Corresponds to task 5 in `.kiro/specs/merge-and-monsters/tasks.md`.

---

## Scope

- `src/engine/GameLoop.ts`
- `src/engine/Renderer.ts`
- `App.tsx` updated to mount the canvas and start/stop the loop

No React hooks or setState calls inside the engine modules.

---

## Checklist

- [ ] `GameLoop.start(canvas)` starts the rAF loop
- [ ] `GameLoop.stop()` cancels the rAF handle cleanly
- [ ] Each frame reads state via `useGameStore.getState()` with no React hook calls
- [ ] Renderer draws dungeon floor tiles (programmatic, no images)
- [ ] Renderer draws hero sprite (2 idle frames, left-center)
- [ ] Renderer draws monster sprite (2 idle frames, right-center) or empty if `activeMonster` is null
- [ ] Renderer draws HP bars above each sprite
- [ ] Renderer draws floating damage numbers (rise + fade over 40 frames)
- [ ] Screen shake applies on `critHit` combat events (intensity 8px, decay 0.85)
- [ ] Particle bursts emit on hit events (10 particles, 30 frame lifetime)
- [ ] Bob animation alternates every 30 ticks
- [ ] Attack animation plays for 15 frames then returns to idle
- [ ] `App.tsx` starts loop on mount, stops on unmount via `useEffect` cleanup
- [ ] Canvas resizes on window resize via `ResizeObserver`
- [ ] `pnpm biome check --write .` and `pnpm typecheck` pass
- [ ] Branch pushed and PR opened

---

## Acceptance Criteria

1. The browser shows sprites bobbing at a visible frame rate.
2. After `simulateCommit()` or a real commit event, a floating damage number appears and fades.
3. After `simulateIssueClose()`, the monster sprite disappears and particles burst.
4. No `setState` or React hook calls appear anywhere in `src/engine/`.
5. `useGameStore.getState` is the only store access method used in the engine.

---

## Sprite Design (Canvas 2D only)

Hero (left-center, 32x48 px logical):
- Body: rectangle `#4A90D9` (blue)
- Head: circle or rectangle, skin tone `#F5CBA7`
- Weapon: small rectangle in `#D4AF37` (gold)
- Frame A: weapon at rest angle; Frame B: weapon slightly raised

Monster archetypes (right-center, 40x48 px logical):
- Regression Golem: grey rectangle body with cracks
- Backlog Wraith: semi-transparent dark form with jagged edges
- Debt Slime: round green form
- Mystery Crawler: simple dark spider shape
- Training Dummy: wooden post shape in brown

---

## References

- `docs/adr/v0.1.0/03-engine-canvas-decoupled.md`
- `docs/architecture/03-game-engine.md`
- `src/store/useGameStore.ts`
