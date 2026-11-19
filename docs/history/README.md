# Branch History — Convention

Each branch pushed and ready for PR gets its own file in the version subfolder.

## Naming

```
docs/history/<version>/NN-type-name.md
```

- `NN`: global sequence number (does not reset between versions)
- `type`: branch prefix (`feature`, `fix`, `chore`, `refactor`, `docs`, `test`)
- `name`: branch slug without the type prefix and version prefix

Example: branch `feature/0.1.0-canvas-renderer` -> `docs/history/v0.1.0/06-feature-canvas-renderer.md`

## Statuses

- `Ready for PR` — branch pushed, PR not yet opened
- `PR Open` — PR opened, awaiting review or merge
- `Merged` — PR merged to main

## Template

See `docs/history/_template.md`.

## Versions

| Version | Folder |
|---------|--------|
| 0.1.0 | `v0.1.0/` |
