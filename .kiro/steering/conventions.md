---
inclusion: always
---

# Work Conventions — Merge & Monsters

## 1. General Principles

1. Small, verifiable steps. No large unvalidated blocks.
2. Confirm objective, affected files, and success criteria before coding.
3. Reduce scope if errors appear. Fast progress only when changes are routine and stable.
4. Do not advance until the project compiles, passes typecheck, and is minimally documented.
5. All code, commits, PRs, comments, and UI text must be in **English**.
6. Internal documentation (`docs/`) may contain English only; this project has no private Spanish-only folder.
7. No emojis in UI, commits, or comments.
8. Branches by purpose and version. Format: `<type>/<version>-<slug>` (e.g. `feature/0.1.0-canvas-renderer`, `fix/0.1.1-xp-overflow`).
9. Branches branch off `main` and return to `main` via PR. No `develop` or long-lived integration branch.
10. Biome only. No ESLint, no Prettier.
11. Frequent atomic commits. One commit per verified logical block. Larger branches require more commits.

## 2. i18n

- All user-visible text goes through the `t()` helper. No string literals rendered directly in JSX.
- Supported locales: `en` (source, fallback) and `es` (Spanish translation).
- Both locales must be updated in the same commit that introduces a UI string.
- Locale files live in `src/lib/i18n/locales/en.json` and `src/lib/i18n/locales/es.json`.

## 3. Commit Convention

Format: `type(scope): short description`

| Type | Use |
|------|-----|
| `feat` | New functionality |
| `fix` | Bug fix |
| `refactor` | Behavior-neutral restructure |
| `docs` | Documentation only |
| `test` | Add or modify tests |
| `chore` | Config, deps, scripts, tooling |
| `build` | Build system or dependency changes |
| `ci` | Pipeline changes |

Examples:
```
feat(engine): add sprite animation loop for hero idle state
fix(telemetry): clamp delta lines to prevent XP overflow
docs(readme): add architecture diagram
chore(deps): add octokit and zustand
```

## 4. Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable code only. Never commit directly. |
| `feature/<version>-<slug>` | One feature or component per branch. |
| `fix/<version>-<slug>` | Bug fix on top of main. |
| `chore/<version>-<slug>` | Config, review, tooling, documentation. |
| `chore/release-<version>` | Version close: bump, final docs, regression. |
| `refactor/<version>-<slug>` | Behavior-neutral restructure. |
| `docs/<version>-<slug>` | Documentation only. |
| `test/<version>-<slug>` | Tests only. |

Rules:
- Each branch has a single, bounded purpose.
- Before PR, branch must be up to date with `main`.
- The agent pushes and opens the PR directly. Merge and tag are done by the user.
- Do not merge to `main` without user approval.

## 5. Co-authorship

Exactly **one commit per branch** carries a `Co-authored-by` trailer (the heaviest commit of that branch).

The rule is **cross-credit**: the co-author is the other party, not the branch owner.

| Branch owner | Co-author on that branch |
|---|---|
| Y (`-Y` branches) | `CarlosGranados-devs <Josuegrana2s@gmail.com>` |
| C (`-C` branches) | `YonaZakkart <musicyonathan@gmail.com>` |
| Kiro (agent-driven branches) | `Kiro <kiro@kiro.dev>` |

```text
Co-authored-by: CarlosGranados-devs <Josuegrana2s@gmail.com>
Co-authored-by: YonaZakkart <musicyonathan@gmail.com>
Co-authored-by: Kiro <kiro@kiro.dev>
```

Developer identities:
- **Dev Y**: YonaZakkart `<musicyonathan@gmail.com>`
- **Dev C**: CarlosGranados-devs `<Josuegrana2s@gmail.com>`

## 6. Versioning (SemVer)

| Change | Increment | Example |
|--------|-----------|---------|
| Minor fix, accessibility, tech debt | PATCH (`0.1.1`) | Fix XP overflow |
| New feature or module, backward-compatible | MINOR (`0.2.0`) | Add Sandbox mode |
| Incompatible change or stability milestone | MAJOR (`1.0.0`) | Full public release |

- Version lives in `package.json` and is exposed to the build via Vite `define`.
- Version is bumped **once** per release in `chore/release-X.Y.Z`.
- Feature branches name their target version but do not touch `package.json`.
- Tag `vX.Y.Z` is created **after** the release PR is merged, with user approval.

## 7. Documentation updates

After every branch:
- Update `docs/history/<version>/` with a file for the completed branch.
- Update `docs/roadmap/<version>/` task status.
- Create or update an ADR in `docs/adr/<version>/` if a new technical decision was made.
- Record any gotcha in `docs/gotchas/<version>/`.

## 8. Definition of Done

A branch is done when:

1. `pnpm build` completes without errors.
2. `pnpm typecheck` passes with zero errors and zero `any`.
3. `pnpm biome check --write .` passes clean.
4. All acceptance criteria for the task are met and manually tested.
5. New user-visible strings exist in both `en` and `es` locales.
6. Documentation updated: task status, roadmap, ADR or gotcha if applicable.
7. Branch registered in `docs/history/<version>/`.
8. Commits in English, with exactly one `Co-authored-by` per branch (on the heaviest commit).
9. Branch pushed and PR opened. Do not merge.

## 9. Stop Points

Each phase ends with a review branch (`chore/<version>-review-phase-N`) that adds no functionality: it reviews code, fixes bugs, validates the manual regression, and updates documentation. The next phase does not start until the user validates this stop point.

Each MINOR/MAJOR version ends with `chore/release-X.Y.Z`, which bumps the version, updates the public README and documentation, runs the final regression, and leaves the tag ready for after the merge.
