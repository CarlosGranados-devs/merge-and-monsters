# T03 — GitHub Client

**Branch**: `feature/0.1.0-github-client-Y`
**Owner**: Y
**Status**: Completed
**Version**: 0.1.0

---

## Objective

Implement `src/services/githubClient.ts`: a typed wrapper around `@octokit/rest` with ETag caching and a Sandbox mock dataset fallback.

Corresponds to task 2 in `.kiro/specs/merge-and-monsters/tasks.md`.

---

## Scope

- `src/services/githubClient.ts` — main client module
- Unit tests in `src/services/githubClient.test.ts`
- ETag cache utilities (can be inlined or in `src/lib/etagCache.ts`)

---

## Checklist

- [x] `fetchRepoData(slug, pat?)` returns typed `RepoData`
- [x] ETag is stored in `localStorage` keyed by URL after every successful response
- [x] `If-None-Match` header is sent on repeat requests; `304` returns cached data
- [x] `403` / `429` responses throw a typed `RateLimitError`
- [x] PAT is accepted as an optional parameter, never stored by this module
- [x] `getSandboxData()` returns a static mock matching the `RepoData` shape
- [x] `isSandbox` flag switches all fetch calls to `getSandboxData()`
- [x] Unit tests cover: successful fetch, ETag cache hit (304), rate-limit error, Sandbox return
- [x] `pnpm test` passes
- [x] `pnpm biome check --write .` passes
- [x] Branch pushed and PR opened

---

## Acceptance Criteria

1. `fetchRepoData('torvalds/linux')` returns a `RepoData` object without throwing (may hit real API in integration test, skip in unit test with mock).
2. A second call to `fetchRepoData` for the same URL sends `If-None-Match` if an ETag is cached.
3. A simulated `304` response returns the cached payload.
4. A simulated `403` response throws `RateLimitError`.
5. `getSandboxData()` returns data matching the `RepoData` type with no network call.

---

## RepoData Shape

```typescript
interface RepoData {
  slug: string;
  primaryLanguage: string | null;
  openIssueCount: number;
  closedIssueCount: number;
  hasReadme: boolean;
  hasCiWorkflows: boolean;
  commits: RawCommit[];
  mergedPrs: RawPr[];
  openIssues: RawIssue[];
}
```

---

## Sandbox Mock Data

The sandbox mock must include:
- `primaryLanguage`: `'TypeScript'`
- 5 commits with `additions + deletions` between 10 and 500
- 2 merged PRs
- 4 open issues: one `bug`, one `enhancement`, one `documentation`, one unlabeled
- Issue ages: 2, 15, 30, 60 days
- `hasReadme`: true, `hasCiWorkflows`: true

---

## Implementation Notes

- `fetchRepoData` issues seven parallel requests: repo metadata, commits window, merged PRs,
  open issues, closed issue count, README check, and CI workflow check. Each commit in the window
  then fetches its own detail once to obtain `additions` / `deletions` (5 extra requests on first
  connect). Every request has its own ETag, so repeat polls resolve as `304` at zero quota cost.
- `closedIssueCount` is derived from the `Link` header of `GET /issues?state=closed&per_page=1`
  (last page number). Without a `Link` header the count is the returned page length (0 or 1).
  This endpoint counts pull requests as issues, so the ratio is approximate.
- `openIssueCount` is `openIssues.length` after filtering entries that carry `pull_request`, so the
  counter and the monster queue always agree.
- `RateLimitError` exposes `status` (`403` or `429`) and `resetAt` (epoch milliseconds from
  `x-ratelimit-reset`, or `null` when the header is absent).
- Sandbox mode is module state (`setSandboxMode` / `isSandboxMode`). The store will flip it at
  connect time; `fetchRepoData` returns `getSandboxData()` and makes no network call.
- `vitest.config.ts` was added (jsdom environment, `@/` alias) because the repo had no test runner
  configuration and `pnpm test` exited with "No test files found".

---

## Verification

| Command | Result |
|---------|--------|
| `pnpm test` | 9 tests passed (1 file) |
| `pnpm typecheck` | Pass, zero errors |
| `pnpm biome check --write .` | Pass, no fixes applied |
| `pnpm build` | Pass (`tsc && vite build`) |

Build note: `vite build` reports an empty `octokit` chunk because `githubClient.ts` is not imported
by the app yet. It will be consumed from the store at Checkpoint 1.

---

## References

- `docs/adr/v0.1.0/05-telemetry-octokit-etag.md`
- `docs/architecture/02-telemetry-mapping.md`
- `docs/history/v0.1.0/03-feature-github-client-Y.md`
