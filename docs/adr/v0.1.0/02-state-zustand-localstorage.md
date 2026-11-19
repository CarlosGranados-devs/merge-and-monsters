# 02 — Zustand + localStorage for Game State

**Date**: 2025-01-27
**Status**: Accepted

**Context**: The game needs persistent state (hero XP, gold, level, processed event IDs) that survives page refreshes. It also needs fast synchronous reads from the canvas loop, which cannot use React hooks.

## Decision

Use Zustand for all game state. Use Zustand's `persist` middleware with `localStorage` as the backend for the fields that must survive a refresh. The canvas loop reads state via `useGameStore.getState()`.

## Rationale

- Zustand's `getState()` method gives the canvas loop synchronous, non-reactive access with no overhead.
- `persist` middleware handles serialization and deserialization with minimal boilerplate.
- A single store keeps the data flow simple: one source of truth for both React components and the canvas engine.

## Alternatives Considered

- **Redux Toolkit**: more boilerplate, unnecessary for this scope. Rejected.
- **React Context**: no synchronous `getState()` escape hatch; causes re-renders at 60 FPS. Rejected.
- **IndexedDB**: async, overkill for the small data volume here. Rejected.

## Consequences

- `processedIds` is a `Set<string>` and must be manually serialized/deserialized in the persist config (JSON does not natively handle `Set`).
- `combatLog` and `monsterQueue` are not persisted; they are rebuilt on reconnect.

## References

- `docs/architecture/05-state-management.md`
- `src/store/useGameStore.ts`
