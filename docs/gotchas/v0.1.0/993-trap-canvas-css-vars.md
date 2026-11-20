# 993 — trap: CSS custom properties do not resolve in canvas fillStyle

**Version**: 0.1.0
**Status**: Resolved
**Type**: trap
**Found in branch**: `feature/0.1.0-canvas-renderer-Y`
**Resolved in branch**: `feature/0.1.0-canvas-renderer-Y`

---

## Symptoms

The R02 placeholder drew a background with `ctx.fillStyle = 'var(--color-bg)'`. The canvas stayed
transparent: assigning an invalid CSS color to a canvas context is a silent no-op, so every fill and
stroke kept the previous (default black/transparent) style. No console error is raised.

---

## Reproduction

```ts
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'var(--color-gold)'; // ignored
ctx.fillRect(0, 0, 100, 100);        // draws black
```

---

## Root Cause

`CanvasRenderingContext2D.fillStyle` only accepts a parsed CSS color, gradient, or pattern. Custom
property references are resolved by the CSS cascade for DOM elements, not by the canvas API.

---

## Solution

The engine keeps a `COLORS` map of hex literals in `src/engine/Renderer.ts` and never reads CSS
variables. `index.html` and `globals.css` keep the variables for the DOM/HUD, so the palette has one
source of truth per layer.

---

## Verification

- `src/engine/Renderer.test.ts` asserts draw calls are issued with the palette.
- Headless Firefox render shows the floor, walls, sprites, and HP bars.

---

## References

- `src/engine/Renderer.ts`
- Task: `docs/tasks/v0.1.0/07-canvas-renderer.md`
