# T07 — Canvas Renderer

**Branch**: `feature/0.1.0-canvas-renderer-Y`
**Owner**: Y
**Status**: Completed
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

- [x] `GameLoop.start(canvas)` starts the rAF loop
- [x] `GameLoop.stop()` cancels the rAF handle cleanly
- [x] Each frame reads state via `useGameStore.getState()` with no React hook calls
- [x] Renderer draws dungeon floor tiles (programmatic, no images)
- [x] Renderer draws hero sprite (2 idle frames, left-center)
- [x] Renderer draws monster sprite (2 idle frames, right-center) or empty if `activeMonster` is null
- [x] Renderer draws HP bars above each sprite
- [x] Renderer draws floating damage numbers (rise + fade over 40 frames)
- [x] Screen shake applies on `critHit` combat events (intensity 8px, decay 0.85)
- [x] Particle bursts emit on hit events (10 particles, 30 frame lifetime)
- [x] Bob animation alternates every 30 ticks
- [x] Attack animation plays for 15 frames then returns to idle
- [x] `App.tsx` starts loop on mount, stops on unmount via `useEffect` cleanup
- [x] Canvas resizes on window resize via `ResizeObserver`
- [x] `pnpm biome check --write .` and `pnpm typecheck` pass
- [x] Branch pushed and PR opened

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

## Implementation Notes

- `GameLoop` exports `start(canvas)` / `stop()` plus the animation helpers `applyCombatEvent` and
  `advanceAnimation`. `start` paints one frame synchronously before scheduling rAF, so the canvas is
  never blank while the first frame is pending.
- Combat events reach the engine through `useGameStore.getState().drainCombatEvents()`. The loop
  consumes the whole batch once per frame; the store is the only producer.
- `App.tsx` sizes the canvas from `getBoundingClientRect()` multiplied by `devicePixelRatio` and
  observes the container with `ResizeObserver`. The renderer works in device pixels.
- Screen shake triggers when `heroAttack.damage >= 50` (the crit threshold). A PR merge deals 50
  damage, so it always shakes.
- Colors are hex literals: CSS custom properties such as `var(--color-bg)` do not resolve inside
  `canvas.fillStyle` (the R02 placeholder used them and silently drew nothing).

Known gap: closing a real GitHub issue is not detected yet. The client fetches a closed issue count,
not closed issue events, so only the Sandbox simulation defeats monsters. Revisit before v0.2.0.

---

## Verification

| Command | Result |
|---------|--------|
| `pnpm test` | 17 engine tests pass (72 total) |
| `pnpm typecheck` | Pass |
| `pnpm biome check --write .` | Pass |
| `pnpm build` | Pass |
| Headless render | Dungeon floor, walls, hero, monster, and both HP bars visible at 896x504 CSS px |

---

## References

- `docs/adr/v0.1.0/03-engine-canvas-decoupled.md`
- `docs/architecture/03-game-engine.md`
- `src/store/useGameStore.ts`
