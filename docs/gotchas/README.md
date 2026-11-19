# Gotchas — Convention

One file per finding. Do not group distinct problems.

## Naming

```
docs/gotchas/<version>/NNN-type-title.md
```

- `NNN`: global 3-digit sequence (does not reset between versions)
- `type`: `gotcha`, `error`, or `trap`
- `title`: short kebab-case description

Pending triage: `00-type-title.md` (must be resolved quickly).
Resolved: prefix changes from `NNN` to `99NN` (e.g. `001` -> `991`, `010` -> `9910`).

## Template

See `docs/gotchas/_template.md`.

## Versions

| Version | Folder |
|---------|--------|
| 0.1.0 | `v0.1.0/` |
