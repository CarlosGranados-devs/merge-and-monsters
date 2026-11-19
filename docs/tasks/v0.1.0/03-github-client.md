# T03 — GitHub Client

**Branch**: `feature/0.1.0-github-client`
**Status**: Pending
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

- [ ] `fetchRepoData(slug, pat?)` returns typed `RepoData`
- [ ] ETag is stored in `localStorage` keyed by URL after every successful response
- [ ] `If-None-Match` header is sent on repeat requests; `304` returns cached data
- [ ] `403` / `429` responses throw a typed `RateLimitError`
- [ ] PAT is accepted as an optional parameter, never stored by this module
- [ ] `getSandboxData()` returns a static mock matching the `RepoData` shape
- [ ] `isSandbox` flag switches all fetch calls to `getSandboxData()`
- [ ] Unit tests cover: successful fetch, ETag cache hit (304), rate-limit error, Sandbox return
- [ ] `pnpm test` passes
- [ ] `pnpm biome check --write .` passes
- [ ] Branch pushed and PR opened

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

## References

- `docs/adr/v0.1.0/05-telemetry-octokit-etag.md`
- `docs/architecture/02-telemetry-mapping.md`
