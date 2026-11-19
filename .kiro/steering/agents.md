---
inclusion: always
---

# AGENTS — Work Guide for Kiro

**Project**: Merge & Monsters
**Language**: English
**Current version**: `0.1.0` (in progress)

This file is the **entry point** for any agent working on Merge & Monsters. Before touching code, read in this order:

1. `tech-stack.md` — stack rules, architecture constraints, visual and audio palette.
2. `conventions.md` — commits, branches, versioning, i18n, and Definition of Done.
3. `docs/architecture/00-overview.md` — technical and functional context.
4. The relevant `docs/roadmap/<version>/` or `docs/tasks/<version>/` file for the current branch.
5. The `docs/adr/<version>/` ADRs related to the area being modified.

---

## 1. Project Context

Merge & Monsters is a **browser-based retro pixel-art dungeon crawler RPG** powered by live GitHub repository telemetry. Built for the Kiroween Frankenstein category, it stitches software engineering workflows together with classic 16-bit RPG progression.

- **Stack**: Vite, React 19, TypeScript (strict), Tailwind CSS, Zustand, Octokit, Web Audio API, HTML5 Canvas.
- **No backend**: all data lives in the browser (localStorage + sessionStorage).
- **Locales**: English (source, fallback) and Spanish.
- **Modules**: Repository connection, Hero progression, Monster combat, Canvas renderer, Audio synthesizer, HUD.
- **Versioning**: SemVer. Each change grouped into a version; documentation archived by version.

---

## 2. Non-Negotiable Rules

| # | Rule |
|---|------|
| 1 | Small, verifiable steps. Do not advance without compiling, passing typecheck, and minimal documentation. |
| 2 | Confirm before coding: objective, affected files, and success criteria. |
| 3 | All code, commits, PRs, comments, and UI text in **English**. |
| 4 | No emojis in UI, commits, or comments. |
| 5 | Branches from `main`, one per purpose. Format: `<type>/<version>-<slug>`. No `develop`. |
| 6 | The agent pushes and opens the PR directly. Merge and tag are done by the user. |
| 7 | Biome only. No ESLint, no Prettier. |
| 8 | The Canvas game loop (`src/engine/`) must remain completely decoupled from React re-renders. |
| 9 | All user-visible text goes through `t()`. No literal strings in JSX. |
| 10 | All SFX synthesized via Web Audio API. Zero external audio files. |
| 11 | Every completed branch is registered in `docs/history/<version>/`. |
| 12 | Atomic commits: one per verified logical block. Larger branches require more commits. |
| 13 | Version bumped **once** in `chore/release-X.Y.Z`. Feature branches do not touch `package.json`. |
| 14 | No feature outside the approved scope without an ADR and user approval. |

### Co-authorship

Exactly **one commit per branch** carries a `Co-authored-by` trailer (the heaviest commit). The co-author is always the **other** party — cross-credit, not self-credit.

| Branch owner | Co-author to use |
|---|---|
| Y (`-Y` branches) | `CarlosGranados-devs <Josuegrana2s@gmail.com>` |
| C (`-C` branches) | `YonaZakkart <musicyonathan@gmail.com>` |

Developer identities:
- **Dev Y**: YonaZakkart `<musicyonathan@gmail.com>`
- **Dev C**: CarlosGranados-devs `<Josuegrana2s@gmail.com>`

AI agents are **not** listed as co-authors: a `noreply` placeholder is not tied to a GitHub user
account, so GitHub never renders it as a co-author. Agent attribution lives in
`docs/history/<version>/`.

---

## 3. Agent Workflow

1. **Read**: tech-stack.md, conventions.md, the roadmap and task for the current branch, relevant ADRs.
2. **Verify state**: `git status`, current branch, that `main` is up to date.
3. **Propose plan**: objective, affected files, success criteria, and risks. Wait for confirmation if the change is non-trivial.
4. **Implement in small blocks**: one logical block, one verification, one commit.
5. **Verify**: `pnpm biome check --write .`, `pnpm typecheck`, `pnpm build` as applicable.
6. **Document**: update task status, record gotchas, create ADR if a decision was made.
7. **Close**: commits in English (one with co-author), branch updated with `main`, entry in `docs/history/<version>/`, branch pushed and PR opened. Do not merge.

If a step fails, **reduce scope** before retrying. An unresolved bug is recorded as a gotcha and blocks the phase if it is a blocker.

---

## 4. Where to Document Each Thing

| Need | Location |
|------|----------|
| Work rules, commits, branches, DoD | `.kiro/steering/conventions.md` |
| Technical decision with alternatives | `docs/adr/<version>/` (one ADR per decision) |
| How the system works today | `docs/architecture/` |
| Branch plan and stop points | `docs/roadmap/<version>/` |
| Concrete work in progress | `docs/tasks/<version>/` |
| Branch pushed and ready for PR | `docs/history/<version>/` |
| Bug, trap, or unexpected behavior | `docs/gotchas/<version>/` |
| General map | `docs/INDEX.md` |

---

## 5. ADR Rules

- Name: `NN-area-case.md` with two digits (`01-architecture-client-spa.md`).
- `NN` is **global** and not reused across versions.
- Suggested areas: `architecture`, `data`, `state`, `ui`, `engine`, `audio`, `i18n`, `telemetry`, `tooling`.
- States: `Proposed`, `Accepted`, `Rejected`, `Superseded by NNN`.
- An accepted ADR is not edited to change the decision: a new ADR supersedes it.
- `Proposed` ADRs that block a branch are resolved **before** starting that branch.
- ADRs are archived in the folder for the version in which they were decided.

Template:

```md
# Title

**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Rejected
**Context**: ...

## Decision

## Rationale

## Alternatives Considered

## Consequences

## References
```

---

## 6. Roadmap and Tasks — Rules

- `docs/roadmap/<version>/`: one file per branch, numbered `NN-name.md`. The version `README.md` contains the index, dependencies, and stop points.
- Branch statuses: `Planned`, `In Progress`, `In Review`, `Completed`.
- `docs/tasks/<version>/`: executable work, numbered `NN-name.md`.
- Task statuses: `Pending`, `In Progress`, `Blocked`, `Completed`.
- On completing a task: check off checklist, record verification, update roadmap.
- Stop points (`chore/<version>-review-phase-N`, `chore/release-X.Y.Z`) add no functionality: they review, fix, and document.

### Branch History (`docs/history/<version>/`)

- Each branch **pushed and ready for PR** gets its own file.
- Name: `NN-type-name.md`, with `NN` as the global sequence number, `type` matching the branch prefix, and `name` without the type or version prefix.
- Example: branch `feature/0.1.0-canvas-renderer` → `docs/history/v0.1.0/02-feature-canvas-renderer.md`.
- Content: what was done, main changes, verification, PR status, and references.
- Update status (`Ready for PR`, `PR Open`, `Merged`) as it changes.

---

## 7. Gotchas — Rules

One file per finding. Do not group distinct problems.

- `00-...`: pending triage. Must not stay there permanently.
- `NNN-type-title.md`: open, in order of discovery. Number not reused.
- `99NN...`: resolved. On resolving `001`, rename to `991`.
- `type`: `gotcha`, `error`, or `trap`.
- Include: symptoms, reproduction, root cause, solution, verification, and references.
- On resolving: rename, document, and link from the task or ADR.
- Gotcha is archived in the version folder where it was found.

---

## 8. Domain Invariants

### GitHub Telemetry

1. The GitHub client caches ETag headers and stores processed event IDs in `localStorage` to prevent duplicate XP awards.
2. PAT is stored strictly in `sessionStorage` and never logged or persisted to `localStorage`.
3. All API calls fail gracefully: a non-blocking banner appears and Sandbox mode is offered on rate-limit (403).

### Hero Progression

4. XP is calculated with the logarithmic formula: `floor(25 * ln(1 + delta_lines)) + 50 * n_pr`. Delta lines are clamped to `[1, 2000]`.
5. Hero weapon class is derived from the repository's primary language. The mapping is deterministic and defined in `telemetryMapper.ts`.
6. Max hero HP is derived from repository health (issue close ratio, README presence, CI workflows).

### Monster Scaling

7. Monster HP uses the formula: `base_severity * (1 + 0.15 * age_days)`. Age is capped at 60 days.
8. Each open issue maps to exactly one monster archetype by label.
9. Closing an issue (real or Sandbox) defeats the active monster, awards gold, and advances the queue.

### Canvas and Audio

10. `GameLoop.ts` reads from `useGameStore.getState()` inside each animation frame. It never triggers React re-renders.
11. All SFX are synthesized via the Web Audio API (oscillators). Zero external audio files.
12. Screen shake triggers only on critical hits. Floating damage numbers appear on every combat event.

---

## 9. Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
pnpm biome check --write .
pnpm typecheck
pnpm test
pnpm test:watch
```

Do not invent scripts or tools outside the approved stack.

---

## 10. Pre-Done Checklist

- [ ] `pnpm build`, `pnpm typecheck`, and `pnpm biome check --write .` pass.
- [ ] All acceptance criteria for the task are met.
- [ ] Tested at 360 px mobile and desktop viewports.
- [ ] New user-visible strings exist in both `en` and `es` locales.
- [ ] Canvas loop does not trigger React re-renders.
- [ ] No external audio files introduced.
- [ ] Documentation updated (task, roadmap, ADR or gotcha if applicable).
- [ ] Branch registered in `docs/history/<version>/`.
- [ ] Commits in English, with exactly one `Co-authored-by` per branch.
- [ ] Branch updated with `main`, pushed, and PR opened. Do not merge.
- [ ] If version close: `package.json` updated, public README current, tag ready for after merge.
