# T08 — HUD Components

**Branch**: `feature/0.1.0-hud-components`
**Status**: Pending
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

- [ ] `RepoConnectModal` shown on load; closes on successful connect or sandbox launch
- [ ] Slug input normalizes `https://github.com/owner/repo` to `owner/repo`
- [ ] PAT input is `type="password"` and stored only in `sessionStorage`
- [ ] "Connect Repository" button is disabled while loading
- [ ] Rate-limit error banner displayed inline, non-blocking
- [ ] `HeroHud` displays name, HP bar, XP bar, level, weapon class, gold
- [ ] HP bar fill color: gold (`#D4AF37`); XP bar fill color: blue (`#2980B9`)
- [ ] Mute toggle button in `HeroHud` calls `store.setMuted` and shows correct label
- [ ] `CombatLog` auto-scrolls to latest entry
- [ ] `CombatLog` renders entries with timestamp and translated message
- [ ] `SandboxControls` only renders when `store.sandboxMode === true`
- [ ] All buttons in `SandboxControls` are disabled while an animation is playing (future-proof prop)
- [ ] All text goes through `t()` with matching keys in both locale files
- [ ] Focus trapped in modal while open
- [ ] `pnpm biome check --write .` and `pnpm typecheck` pass
- [ ] Branch pushed and PR opened

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

## References

- `docs/adr/v0.1.0/06-i18n-en-es.md`
- `docs/architecture/06-hud-and-ui.md`
- `docs/architecture/07-i18n.md`
- `src/store/useGameStore.ts`
