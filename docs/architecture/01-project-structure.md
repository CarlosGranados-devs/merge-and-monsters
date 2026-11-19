# Project Structure

**Last updated**: 2025-01-27
**Version**: 0.1.0

---

## Folder Layout

```text
merge-and-monsters/
├── public/                        # static assets served as-is (favicon, manifest)
├── src/
│   ├── services/
│   │   ├── githubClient.ts        # GitHub REST API wrapper with ETag caching
│   │   └── telemetryMapper.ts     # Pure RPG mapping functions (no side effects)
│   ├── store/
│   │   └── useGameStore.ts        # Zustand store with localStorage persistence
│   ├── engine/
│   │   ├── GameLoop.ts            # 60 FPS requestAnimationFrame loop
│   │   ├── Renderer.ts            # All Canvas draw calls
│   │   └── SoundSynth.ts          # Web Audio API synthesizer
│   ├── components/
│   │   ├── RepoConnectModal.tsx   # Repository connect + PAT + Sandbox entry
│   │   ├── HeroHud.tsx            # Hero stats overlay
│   │   ├── CombatLog.tsx          # Scrolling event terminal
│   │   └── SandboxControls.tsx    # Simulation trigger buttons
│   ├── lib/
│   │   └── i18n/
│   │       ├── index.ts           # i18next setup
│   │       └── locales/
│   │           ├── en.json        # English strings (source of truth)
│   │           └── es.json        # Spanish translations
│   ├── types/
│   │   └── index.ts               # Shared TypeScript types and interfaces
│   ├── App.tsx                    # Root component: modal gate + game layout
│   └── main.tsx                   # Vite entry point, React root, i18n init
├── docs/                          # Project documentation (versioned)
├── .kiro/
│   ├── steering/                  # Persistent agent rules (always injected)
│   │   ├── tech-stack.md
│   │   ├── conventions.md
│   │   └── agents.md
│   ├── specs/merge-and-monsters/  # Spec documents (requirements, design, tasks)
│   └── hooks/                     # Automated hook definitions
├── biome.json
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── vite.config.ts
```

---

## Dependency Rules

```
components/  -->  store/  -->  services/  -->  types/
engine/      -->  store/  (read-only via getState, no subscriptions)
services/    -->  types/  (pure; no store imports)
lib/         -->  (no project imports; only third-party)
```

- Components read from the store via hooks (`useGameStore`).
- The engine reads from the store via `useGameStore.getState()` — never via hooks.
- Services are pure: they receive inputs and return typed outputs. They do not import the store.
- No component imports from `engine/` directly; the engine is started and stopped by `App.tsx`.
- No circular imports at any level.

---

## File Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| React components | PascalCase | `HeroHud.tsx` |
| Hooks | camelCase with `use` prefix | `useGameStore.ts` |
| Services | camelCase | `githubClient.ts`, `telemetryMapper.ts` |
| Engine modules | PascalCase | `GameLoop.ts`, `Renderer.ts`, `SoundSynth.ts` |
| Type files | camelCase | `index.ts` |
| Locale files | lowercase | `en.json`, `es.json` |
| Test files | alongside source with `.test.ts(x)` | `telemetryMapper.test.ts` |
| Documentation | kebab-case | `00-overview.md` |

---

## Code Conventions

- Named exports by default. Avoid `export default` except for entry points (`App`, `main`).
- Functions and variables: `camelCase`. Constants: `UPPER_SNAKE_CASE`. Types and interfaces: `PascalCase` without `I` prefix.
- One responsibility per file; no business logic inside JSX.
- Zero explicit `any`. Use `unknown` and narrow types.
- No inline `TODO` comments left unresolved at the end of a branch.
