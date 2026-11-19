# T02 — Project Scaffold

**Branch**: `feature/0.1.0-scaffold-Y`
**Owner**: Y
**Status**: Pending
**Version**: 0.1.0

---

## Objective

Initialize the Vite + React 19 + TypeScript project with Tailwind CSS, Biome, i18next, and Zustand. The result is a runnable dev server with the correct folder structure, an empty canvas placeholder, and both locale files.

Corresponds to task 1 in `.kiro/specs/merge-and-monsters/tasks.md`.

---

## Scope

- `package.json` with all dependencies (react 19, vite, tailwind, biome, zustand, i18next, react-i18next, @octokit/rest, vitest)
- `vite.config.ts` with path alias `@/` -> `src/`
- `tsconfig.json` with `strict: true`
- `biome.json` configured (lint recommended, format 2 spaces, single quotes, ES5 trailing commas)
- `tailwind.config.ts` with custom colors (`--color-bg: #0D0D0F`, `--color-gold: #D4AF37`)
- `src/main.tsx` — React root + i18n init
- `src/App.tsx` — placeholder layout with canvas element
- `src/lib/i18n/index.ts` — i18next config
- `src/lib/i18n/locales/en.json` — initial English strings
- `src/lib/i18n/locales/es.json` — initial Spanish strings
- `src/types/index.ts` — all shared TypeScript types
- `index.html` — Vite entry

---

## Checklist

- [ ] `pnpm install` completes without errors
- [ ] `pnpm dev` starts without errors
- [ ] `pnpm build` completes without errors
- [ ] `pnpm typecheck` passes
- [ ] `pnpm biome check --write .` passes clean
- [ ] Dev server shows dark background (`#0D0D0F`) and a canvas placeholder
- [ ] `src/lib/i18n/locales/en.json` and `es.json` have matching keys
- [ ] All types in `src/types/index.ts` are defined and exported
- [ ] Branch pushed and PR opened

---

## Acceptance Criteria

1. `pnpm dev` starts at `localhost:5173` with no console errors.
2. The page background is `#0D0D0F`.
3. `pnpm build` produces a `dist/` folder.
4. `pnpm typecheck` and `pnpm biome check --write .` both pass with zero errors.
5. No `any` in `src/types/index.ts`.

---

## Key Types to Define

```typescript
type WeaponClass =
  | 'strictBlade' | 'scriptDagger' | 'scriptStaff' | 'ironFang'
  | 'goHammer' | 'castMace' | 'rawEdge' | 'containerShield'
  | 'gemRod' | 'adventurerFist';

type MonsterArchetype =
  | 'regressionGolem' | 'backlogWraith' | 'debtSlime'
  | 'mysteryCrawler' | 'trainingDummy';

interface HeroState {
  name: string;
  xp: number;
  level: number;
  hp: number;
  maxHp: number;
  gold: number;
  weaponClass: WeaponClass;
}

interface MonsterEntity {
  id: number;
  archetype: MonsterArchetype;
  name: string;
  hp: number;
  maxHp: number;
  goldReward: number;
  issueNumber: number;
}

interface CombatEvent {
  type: 'heroAttack' | 'monsterAttack' | 'monsterDefeated' | 'levelUp' | 'xpGain';
  damage?: number;
  xp?: number;
  gold?: number;
  level?: number;
  timestamp: number;
}

interface CombatLogEntry {
  id: string;
  timestamp: number;
  messageKey: string;
  params: Record<string, string | number>;
}
```

---

## References

- `docs/adr/v0.1.0/01-architecture-client-spa.md`
- `docs/adr/v0.1.0/06-i18n-en-es.md`
- `docs/architecture/01-project-structure.md`
