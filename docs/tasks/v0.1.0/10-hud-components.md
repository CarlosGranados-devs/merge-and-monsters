# T10 — HUD Components

**Branch**: `feature/0.1.0-hud-components-Y`
**Owner**: Y
**Status**: Completed
**Version**: 0.1.0

---

## Objective

Build the four HUD React components: `RepoConnectModal`, `HeroHud`, `CombatLog`, and `SandboxControls`. Wire them to the Zustand store. All strings go through `t()`.

Corresponds to task 7 in `.kiro/specs/merge-and-monsters/tasks.md`.

---

## Scope

- `src/components/RepoConnectModal.tsx`
- `src/components/HeroHud.tsx`
- `src/components/CombatLog.tsx`
- `src/components/SandboxControls.tsx`
- `src/App.tsx` updated to compose all components
- `src/lib/i18n/locales/en.json` and `es.json` with all UI strings

---

## Checklist

- [x] `RepoConnectModal` shown on load; closes on successful connect or sandbox launch
- [x] Slug input normalizes `https://github.com/owner/repo` to `owner/repo`
- [x] PAT input is `type="password"` and stored only in `sessionStorage`
- [x] "Connect Repository" button is disabled while loading
- [x] Rate-limit error banner displayed inline, non-blocking
- [x] `HeroHud` displays name, HP bar, XP bar, level, weapon class, gold
- [x] HP bar fill color: gold (`#D4AF37`); XP bar fill color: blue (`#2980B9`)
- [x] Mute toggle button in `HeroHud` calls `store.setMuted` and shows correct label
- [x] `CombatLog` auto-scrolls to latest entry
- [x] `CombatLog` renders entries with timestamp and translated message
- [x] `SandboxControls` only renders when `store.sandboxMode === true`
- [x] All buttons in `SandboxControls` are disabled while an animation is playing (future-proof prop)
- [x] All text goes through `t()` with matching keys in both locale files
- [x] Focus trapped in modal while open
- [x] `pnpm biome check --write .` and `pnpm typecheck` pass
- [x] Branch pushed and PR opened

---

## Acceptance Criteria

1. Opening the app shows the `RepoConnectModal` fullscreen.
2. Clicking "Launch Dungeon Sandbox" closes the modal and shows the game layout with `SandboxControls`.
3. The `HeroHud` reflects the hero's current HP, XP, level, weapon class, and gold from the store.
4. The `CombatLog` updates in real time as combat events arrive.
5. The mute button toggles `store.muted` and the label changes (`t('hud.mute')` / `t('hud.unmute')`).
6. No string literals in JSX (verified by search for unquoted text nodes).
7. `es.json` has the same keys as `en.json`.

---

## Implementation Notes

- The modal uses a native `<dialog open>` inside a fixed overlay. `aria-modal`, `aria-labelledby`,
  and a manual Tab trap keep focus inside; the slug input receives focus on mount.
- `normalizeSlug` strips `https://`, `www.`, a trailing slash, and `.git`.
- Errors map to `connect.errorRateLimit` (typed `RateLimitError`) or `connect.errorNotFound`.
- `HeroHud` computes the XP bar against `xpThresholdForLevel(level)` and `(level + 1)`, a helper
  exported by the store, so the bar resets at each level.
- `CombatLog` renders newest first (the store prepends) and resets `scrollTop` to 0 on every change.
- `SandboxControls` accepts a `disabled` prop reserved for Checkpoint 3; it is not wired to the
  engine yet because animation state lives outside React.
- Eight new locale keys (`app.title`, `app.canvasLabel`, `connect.slugLabel`, `connect.patLabel`,
  `connect.connecting`, `connect.errorInvalidSlug`, `combat.title`, `combat.empty`), 50 keys total,
  enforced by `src/lib/i18n/locales.test.ts`.

Checkpoint 2 (`fix/0.1.0-checkpoint-2`) shipped only its history file and never wired
`SoundSynth.play()` into the loop, so the mute button would have been decorative. That wiring was
completed here (`eventTypeToSfxType` + `SoundSynth.play` in `GameLoop.renderFrame`).

---

## Verification

| Command | Result |
|---------|--------|
| `pnpm test` | 108 tests pass (13 files) |
| `pnpm typecheck` | Pass |
| `pnpm biome check --write .` | Pass |
| `pnpm build` | Pass |
| Desktop 1280x900 | Modal on load; sandbox shows HUD, canvas, controls, 7 log entries |
| Mobile 360x800 | HUD stacks above the canvas, controls wrap, no horizontal overflow |

---

## References

- `docs/adr/v0.1.0/06-i18n-en-es.md`
- `docs/architecture/06-hud-and-ui.md`
- `docs/architecture/07-i18n.md`
- `src/store/useGameStore.ts`
