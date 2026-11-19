# 03 — feature/0.1.0-github-client-Y

**Branch**: `feature/0.1.0-github-client-Y`
**Status**: Ready for PR
**PR**: (pending push)
**Owner**: Y
**Version**: 0.1.0
**Date**: 2026-11-19

---

## What Was Done

Implemented the GitHub telemetry client: a typed wrapper around `@octokit/rest` that fetches the
repository data needed by the RPG mapper, caches every response with `ETag` in `localStorage`, and
falls back to a static Sandbox dataset with no network calls.

The module is pure at its boundary: it receives a slug and an optional PAT and returns a `RepoData`
object. It does not import the store, the engine, or any React code. The store will consume it at
Checkpoint 1.

---

## Main Changes

- `src/services/githubClient.ts`: `fetchRepoData(slug, pat?)`, `getSandboxData()`,
  `setSandboxMode()` / `isSandboxMode()`, and the typed `RateLimitError` (`403` / `429` with
  `resetAt`). Repo metadata, commits (with per-commit stats), merged PRs, open issues, closed issue
  count, README presence, and CI workflows are fetched in parallel.
- `src/lib/etagCache.ts`: `readEtagCache` / `writeEtagCache` / `clearEtagCache` over
  `localStorage`, keyed as `etag:<encoded-url>`. Storage failures and quota errors degrade to a
  cache miss instead of throwing.
- `src/services/githubClient.test.ts`: 9 unit tests covering payload mapping, ETag persistence,
  `If-None-Match` + `304` cache hits, `403` / `429` rate limits, PAT non-persistence, invalid
  slugs, and Sandbox mode.
- `vitest.config.ts`: jsdom environment and `@/` alias so `pnpm test` runs.

---

## Verification

- [x] `pnpm test` passed (9 tests, 1 file)
- [x] `pnpm typecheck` passed
- [x] `pnpm biome check --write .` passed
- [x] `pnpm build` passed
- [x] Acceptance criteria verified with mocked API responses (no network dependency)

---

## Gotchas

- `vite build` warns `Generated an empty chunk: "octokit"` because nothing imports
  `githubClient.ts` yet. Expected until the store wires it at Checkpoint 1.
- `closedIssueCount` comes from the `Link` header of `GET /issues?state=closed&per_page=1`, which
  counts pull requests as issues. The close ratio used for hero HP is therefore approximate.
- Octokit throws a `RequestError` with `status: 304` for conditional requests; the client catches
  it and returns the cached payload.

---

## References

- Task: `docs/tasks/v0.1.0/03-github-client.md`
- Roadmap: `docs/roadmap/v0.1.0/README.md` (Phase 2 — Core modules)
- ADR: `docs/adr/v0.1.0/05-telemetry-octokit-etag.md`
