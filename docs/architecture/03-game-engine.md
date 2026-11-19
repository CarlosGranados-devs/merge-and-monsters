# Game Engine — Canvas Renderer

**Last updated**: 2025-01-27
**Version**: 0.1.0

---

## Responsibility

`src/engine/GameLoop.ts` owns the `requestAnimationFrame` loop.
`src/engine/Renderer.ts` performs all canvas draw calls.

Neither module imports React hooks or triggers re-renders. They read game state exclusively via `useGameStore.getState()`.

---

## GameLoop

```text
GameLoop.start(canvas: HTMLCanvasElement)
  -> stores canvas ref and 2D context
  -> starts rAF loop

GameLoop.stop()
  -> cancels rAF handle

Each frame:
  1. Read state: useGameStore.getState()
  2. Consume one pending CombatEvent from the queue (if any)
  3. Advance animation timers (hero, monster, particles, shake, floating numbers)
  4. Call Renderer.draw(ctx, state, animationState)
  5. Schedule next frame
```

The loop is started once by `App.tsx` after the canvas element mounts. It is stopped on unmount.

---

## Renderer

Draw order per frame (painter's algorithm, back to front):

1. **Background**: tiled dungeon floor pattern (programmatic, no image assets)
2. **Dungeon walls**: top and side borders drawn with rectangles
3. **Monster sprite**: idle bob or attack flash, positioned right-center
4. **Hero sprite**: idle bob or attack swing, positioned left-center
5. **HP bars**: monster bar above monster, hero bar above hero
6. **Floating damage numbers**: rise and fade over ~40 frames
7. **Screen shake offset**: applied to the entire canvas transform on critical hits
8. **Particle bursts**: small rectangles emitted on hit, fade over ~30 frames

### Sprites

Sprites are drawn entirely with Canvas 2D API calls (rectangles, arcs, lines). No image files. Each character has two animation frames (idle A, idle B) that alternate every 30 ticks to produce a subtle bob effect.

### Screen Shake

On a critical hit event, the canvas context is translated by a random offset within `[-shakeIntensity, +shakeIntensity]` on both axes. Intensity decays by 10% per frame until it reaches zero.

```text
shake_intensity = 8   // pixels, on crit
decay_factor    = 0.85
```

### Floating Damage Numbers

Each `CombatEvent` with a damage value spawns a floating number:
- Color: gold (`#D4AF37`) for hero attacks, red (`#C0392B`) for monster attacks
- Font: monospace bold, 16 px
- Motion: rises 2 px per frame, fades linearly over 40 frames

---

## Animation State

`GameLoop.ts` maintains a local animation state object that is never stored in Zustand. It resets on `start()`.

```typescript
interface AnimationState {
  heroBobTick: number;
  monsterBobTick: number;
  heroAttacking: boolean;
  heroAttackTick: number;
  monsterAttacking: boolean;
  monsterAttackTick: number;
  shakeIntensity: number;
  particles: Particle[];
  floatingNumbers: FloatingNumber[];
}
```

---

## Canvas Dimensions

The canvas element is sized to fill its container via CSS. Renderer uses `canvas.width` and `canvas.height` at draw time. On window resize, `App.tsx` updates `canvas.width` and `canvas.height` from `getBoundingClientRect()`.

---

## References

- `docs/adr/v0.1.0/03-engine-canvas-decoupled.md`
- `src/engine/GameLoop.ts`
- `src/engine/Renderer.ts`
- `src/store/useGameStore.ts`
