# T05 — Game Store

**Branch**: `feature/0.1.0-game-store`
**Status**: Pending
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

- [ ] Store shape matches the interface in `docs/architecture/05-state-management.md`
- [ ] `persist` middleware configured; `processedIds` serialized/deserialized as `Set<string>`
- [ ] `connect(slug, pat?)` calls `githubClient.fetchRepoData`, maps result, sets hero + monster queue
- [ ] `connect` stores PAT in `sessionStorage` only, never in Zustand or `localStorage`
- [ ] `launchSandbox()` calls `githubClient.getSandboxData`, maps result, sets `sandboxMode: true`
- [ ] `simulateCommit()` awards XP from a random sandbox commit (sandbox mode only)
- [ ] `simulatePrMerge()` awards XP from a fixed PR (sandbox mode only)
- [ ] `simulateIssueClose()` defeats the active monster and advances the queue (sandbox mode only)
- [ ] `advanceMonsterQueue()` pops the first monster from the queue into `activeMonster`
- [ ] `addCombatLogEntry(entry)` prepends to `combatLog` and trims to 100 entries
- [ ] `reset()` clears all state and `localStorage`
- [ ] `pnpm biome check --write .` passes
- [ ] Branch pushed and PR opened

---

## Acceptance Criteria

1. After `launchSandbox()`, `store.sandboxMode` is `true` and `store.hero.weaponClass` is `'strictBlade'`.
2. After `simulateIssueClose()`, the active monster changes (or becomes null if queue is empty).
3. `processedIds` persists across a simulated page reload (Zustand `persist` test with mocked storage).
4. PAT passed to `connect()` is not present in `localStorage` after the call.
5. `addCombatLogEntry` with 101 entries keeps only the latest 100.

---

## References

- `docs/adr/v0.1.0/02-state-zustand-localstorage.md`
- `docs/architecture/05-state-management.md`
- `src/services/githubClient.ts`
- `src/services/telemetryMapper.ts`
