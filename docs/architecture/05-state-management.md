# State Management

**Last updated**: 2025-01-27
**Version**: 0.1.0

---

## Responsibility

`src/store/useGameStore.ts` is the single Zustand store. It holds all game state that must survive a React render cycle or a page refresh. The canvas engine reads it via `getState()`; React components subscribe to it via hooks.

---

## Store Shape

```typescript
interface GameStore {
  // Connection
  repoSlug: string | null;
  connected: boolean;
  sandboxMode: boolean;

  // Hero
  hero: HeroState;

  // Combat
  monsterQueue: MonsterEntity[];
  activeMonster: MonsterEntity | null;
  combatLog: CombatLogEntry[];

  // Audio
  muted: boolean;

  // Processed IDs (dedup)
  processedIds: Set<string>;

  // Actions
  connect: (slug: string, pat?: string) => Promise<void>;
  launchSandbox: () => void;
  simulateCommit: () => void;
  simulatePrMerge: () => void;
  simulateIssueClose: () => void;
  setMuted: (muted: boolean) => void;
  addCombatLogEntry: (entry: CombatLogEntry) => void;
  advanceMonsterQueue: () => void;
  reset: () => void;
}
```

---

## HeroState Shape

```typescript
interface HeroState {
  name: string;
  xp: number;
  level: number;
  hp: number;
  maxHp: number;
  gold: number;
  weaponClass: WeaponClass;
}
```

---

## Persistence

The store uses Zustand's `persist` middleware with `localStorage` as the storage backend.

Persisted fields:
- `repoSlug`
- `connected`
- `sandboxMode`
- `hero`
- `processedIds` (serialized as an array, deserialized back to `Set`)
- `muted`

Not persisted (rebuilt on reconnect or refresh):
- `monsterQueue`
- `activeMonster`
- `combatLog`

---

## Canvas Sync Strategy

`GameLoop.ts` calls `useGameStore.getState()` on every animation frame. It reads:
- `hero.hp`, `hero.maxHp` for the hero HP bar
- `activeMonster` for the monster sprite, HP bar, and name
- Pending `CombatEvent` items from a local event queue

Combat events are pushed into an internal queue inside `GameLoop.ts` (not Zustand) to control animation sequencing. The store dispatches events; the loop consumes them one at a time so animations never overlap.

---

## Processed IDs

`processedIds` is a `Set<string>` containing:
- Commit SHAs that have already awarded XP
- Merged PR IDs that have already awarded XP
- Closed issue IDs that have already defeated a monster

On reconnect, the client fetches fresh data, then filters out any IDs already in this set before mapping to RPG events. This prevents duplicate awards after a page refresh.

---

## References

- `docs/adr/v0.1.0/02-state-zustand-localstorage.md`
- `src/store/useGameStore.ts`
- `src/engine/GameLoop.ts`
