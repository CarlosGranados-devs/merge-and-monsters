# HUD and UI

**Last updated**: 2025-01-27
**Version**: 0.1.0

---

## Layout

```text
+-------------------------------------------------------+
|  HeroHud (left)       Canvas Viewport     [Mute] [?]  |
|  - hero name          (60 FPS game scene)             |
|  - HP bar                                             |
|  - XP bar             +-------------------------+     |
|  - weapon class       |  dungeon floor          |     |
|  - gold counter       |  hero sprite            |     |
|                       |  monster sprite         |     |
|                       |  HP bars                |     |
|                       |  damage numbers         |     |
|                       +-------------------------+     |
|                                                       |
|  CombatLog (bottom) — terminal-style scrolling log    |
|                                                       |
|  SandboxControls (if sandbox mode)                    |
|  [Simulate Commit]  [Simulate PR Merge]               |
|  [Simulate Issue Close]                               |
+-------------------------------------------------------+
```

The `RepoConnectModal` is a full-screen overlay shown before connection. Once connected or in sandbox mode, it closes and the game layout appears.

---

## Component Responsibilities

### RepoConnectModal

- Input: `owner/repo` slug or full GitHub URL (normalized on submission)
- Input: optional PAT (password field, stored only in `sessionStorage`)
- Button: "Connect Repository" — calls `store.connect(slug, pat?)`
- Button: "Launch Dungeon Sandbox" — calls `store.launchSandbox()`
- Shows a non-blocking error banner if the connection fails

### HeroHud

- Reads `store.hero` via hook
- Displays name, HP bar (gold fill), XP bar (blue fill), level, weapon class, gold
- Contains the mute toggle button (calls `store.setMuted`)
- Does not write to the store except via the mute action

### CombatLog

- Reads `store.combatLog` via hook
- Renders entries as a fixed-height scrolling terminal with monospace font
- Auto-scrolls to the latest entry
- Each entry has a timestamp and a translated event description

### SandboxControls

- Only renders when `store.sandboxMode === true`
- Three buttons: Simulate Commit, Simulate PR Merge, Simulate Issue Close
- Each button calls the corresponding store action

---

## Color Palette

| Token | Value | Use |
|-------|-------|-----|
| Background | `#0D0D0F` | Page, HUD panels, modal |
| Gold | `#D4AF37` | Borders, HP fill, headings, gold counter |
| Text | `#E8E8E8` | Body copy |
| Danger | `#C0392B` | Monster HP, critical numbers |
| Muted | `#555566` | Disabled, placeholders |
| XP fill | `#2980B9` | XP bar fill |

---

## Typography

- UI text: system sans-serif via Tailwind default
- Combat Log: monospace (`font-mono`)
- Canvas damage numbers: Canvas 2D `font` property, bold monospace 16 px
- No custom fonts loaded. No external font requests.

---

## Accessibility

- All interactive controls have accessible names (via `aria-label` or visible text).
- Focus is trapped inside `RepoConnectModal` while it is open.
- Mute toggle has a visible label and `aria-pressed` state.
- Color is not the only indicator of state (HP bars also show numeric values).
- No motion-only indicators; floating numbers also appear in the combat log.

---

## i18n

All user-visible strings in components go through `t()`. The combat log entries are translated event descriptions assembled by `telemetryMapper.ts` using i18n keys. No string literals in JSX.

---

## References

- `docs/adr/v0.1.0/06-i18n-en-es.md`
- `src/components/`
- `src/lib/i18n/locales/`
