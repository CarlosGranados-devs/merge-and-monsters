# T06 — Game Store

**Branch**: `feature/0.1.0-game-store-C`
**Owner**: C
**Status**: Completed
**Version**: 0.1.0

---

## Objective

Implement `src/store/useGameStore.ts`: the Zustand store with localStorage persistence, all game actions, and the connection/sandbox flow.

Corresponds to task 4 in `.kiro/specs/merge-and-monsters/tasks.md`.

---

## Scope

- `src/store/useGameStore.ts`
- Integration with `githubClient.ts` and `telemetryMapper.ts`

---

## Checklist

- [x] Store shape matches the interface in `docs/architecture/05-state-management.md`
- [x] `persist` middleware configured; `processedIds` serialized/deserialized as `Set<string>`
- [x] `connect(slug, pat?)` calls `githubClient.fetchRepoData`, maps result, sets hero + monster queue
- [x] `connect` stores PAT in `sessionStorage` only, never in Zustand or `localStorage`
- [x] `launchSandbox()` calls `githubClient.getSandboxData`, maps result, sets `sandboxMode: true`
- [x] `simulateCommit()` awards XP from a random sandbox commit (sandbox mode only)
- [x] `simulatePrMerge()` awards XP from a fixed PR (sandbox mode only)
- [x] `simulateIssueClose()` defeats the active monster and advances the queue (sandbox mode only)
- [x] `advanceMonsterQueue()` pops the first monster from the queue into `activeMonster`
- [x] `addCombatLogEntry(entry)` prepends to `combatLog` and trims to 100 entries
- [x] `reset()` clears all state and `localStorage`
- [x] `pnpm biome check --write .` passes
- [x] Branch pushed and PR opened

---

## Acceptance Criteria

1. After `launchSandbox()`, `store.sandboxMode` is `true` and `store.hero.weaponClass` is `'strictBlade'`.
2. After `simulateIssueClose()`, the active monster changes (or becomes null if queue is empty).
3. `processedIds` persists across a simulated page reload (Zustand `persist` test with mocked storage).
4. PAT passed to `connect()` is not present in `localStorage` after the call.
5. `addCombatLogEntry` with 101 entries keeps only the latest 100.

---

## Recovery Note

PR #6 (`feature/0.1.0-game-store-C`) was merged with **zero files**: its only commit was a merge of
`main` into the branch, carrying the store message but no `src/store/` tree. The module never existed
in any commit or branch, including the author's fork.

The store was recovered in `fix`-scope work inside `feature/0.1.0-canvas-renderer-Y`, because R07
cannot read `useGameStore.getState()` without it. The implementation follows
`docs/architecture/05-state-management.md` and adds two integration fields required by the engine:
`pendingEvents: CombatEvent[]` and `drainCombatEvents()`.

---

## Verification

| Command | Result |
|---------|--------|
| `pnpm test` | 13 store tests pass (72 total) |
| `pnpm typecheck` | Pass |
| `pnpm biome check --write .` | Pass |
| `pnpm build` | Pass |

Covered acceptance criteria: sandbox launch yields `strictBlade`; issue close advances the queue;
`processedIds` rehydrates as a `Set`; the PAT never reaches `localStorage`; the log keeps 100 entries.

---

## References

- `docs/adr/v0.1.0/02-state-zustand-localstorage.md`
- `docs/architecture/05-state-management.md`
- `src/services/githubClient.ts`
- `src/services/telemetryMapper.ts`
