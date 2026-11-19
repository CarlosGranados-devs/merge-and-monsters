# 03 — Canvas Loop Decoupled from React

**Date**: 2025-01-27
**Status**: Accepted

**Context**: A 60 FPS game loop cannot depend on React's render cycle. React re-renders are triggered by state changes and may run at unpredictable intervals. Calling `setState` from inside `requestAnimationFrame` at 60 FPS would cause 60 React re-renders per second, destroying performance.

## Decision

`GameLoop.ts` and `Renderer.ts` are plain TypeScript modules that live in `src/engine/`. They read game state via `useGameStore.getState()` on every frame. They never call React hooks, never call `setState`, and never import from React.

React components subscribe to the Zustand store normally and re-render only when game state changes (which happens at human-interaction frequency, not frame frequency).

## Rationale

- `getState()` is a synchronous, zero-overhead read. It does not trigger subscriptions.
- Animation state (bob tick, shake intensity, particles, floating numbers) lives inside `GameLoop.ts` as a plain mutable object — it is not game state and does not need to be shared with React.
- This matches the constraint in `.kiro/steering/tech-stack.md`: "Keep the 60 FPS HTML5 canvas render loop completely decoupled from React state re-renders."

## Alternatives Considered

- **Canvas inside a React component with `useRef` and `useEffect`**: the ref and effect are fine for mounting the canvas, but the loop itself must not use hooks internally. This is the approach used for initialization, not for the loop body.
- **React Three Fiber**: heavy dependency, not needed for a 2D pixel-art game. Rejected.

## Consequences

- `App.tsx` starts the loop via `GameLoop.start(canvasRef.current)` inside `useEffect` and stops it on cleanup. This is the only React-engine coupling.
- Animation state is not inspectable via React devtools, which is acceptable for 2D game internals.

## References

- `.kiro/steering/tech-stack.md`
- `docs/architecture/03-game-engine.md`
- `src/engine/GameLoop.ts`
- `src/engine/Renderer.ts`
