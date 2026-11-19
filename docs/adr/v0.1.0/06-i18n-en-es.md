# 06 — i18next with English Source and Spanish Translation

**Date**: 2025-01-27
**Status**: Accepted

**Context**: The project requires i18n from day one. All UI text must go through `t()`. English is the development language; Spanish is maintained in parallel as a live translation throughout development.

## Decision

Use `i18next` and `react-i18next`. English (`en`) is the source locale and fallback. Spanish (`es`) is maintained as a co-equal translation updated in every commit that adds UI strings. Language detection uses `localStorage` first, then `navigator.language`, then falls back to `en`.

## Rationale

- i18next is widely used, well-typed, and integrates cleanly with React via the `useTranslation` hook.
- Maintaining `es.json` in parallel from the start avoids a large translation backlog later.
- A single default namespace keeps the key structure simple for a single-screen app.

## Alternatives Considered

- **react-intl**: similar capability but more verbose API. Rejected in favor of i18next simplicity.
- **Inline strings with a post-hoc extraction step**: defers translation work and risks missing strings. Rejected.
- **Dynamic locale loading**: unnecessary overhead for two small JSON files. Rejected.

## Consequences

- Both `en.json` and `es.json` must be updated in the same commit that introduces a new UI string.
- Missing keys in `es.json` fall back to `en.json` silently during development. This is acceptable; the Spanish file must be complete before any release branch.

## References

- `docs/architecture/07-i18n.md`
- `src/lib/i18n/index.ts`
- `src/lib/i18n/locales/en.json`
- `src/lib/i18n/locales/es.json`
