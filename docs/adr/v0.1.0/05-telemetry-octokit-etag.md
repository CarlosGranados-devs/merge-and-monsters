# 05 — Octokit with ETag Caching and Sandbox Fallback

**Date**: 2025-01-27
**Status**: Accepted

**Context**: The app calls the GitHub REST API from a browser with no server-side caching. Unauthenticated requests are limited to 60 per hour per IP. Without care, a single page load could exhaust this quota.

## Decision

Use `@octokit/rest` as the GitHub client. Store `ETag` response headers in `localStorage` keyed by URL. Send `If-None-Match` on subsequent requests. A `304 Not Modified` response returns the cached payload at zero API cost.

When the API returns 403 (rate limit), show a non-blocking banner and offer the user a PAT input or Sandbox mode. Sandbox mode returns a static mock dataset with no API calls.

## Rationale

- ETag conditional requests are the GitHub-recommended approach for poll-based clients.
- Sandbox mode provides a fully functional demo path that works without a GitHub account or internet connection.
- `@octokit/rest` handles authentication, pagination, and error codes cleanly.

## Alternatives Considered

- **Fetch directly without Octokit**: possible but Octokit handles auth headers, retries, and typed responses. Rejected in favor of Octokit.
- **GraphQL API**: more efficient per request but more complex to cache and to implement in a short hackathon window. Rejected for this version.
- **Service Worker caching**: useful but adds complexity; ETag at the client level is sufficient for the polling frequency here. Deferred.

## Consequences

- `localStorage` stores ETag keys of the form `etag:<url>`. The user can clear them by clearing site data.
- PAT is stored only in `sessionStorage`. It is never written to `localStorage` and never logged.
- Processed event IDs (`m_and_m:processed_ids`) prevent duplicate XP if the user refreshes while ETag cache is stale.

## References

- `docs/architecture/02-telemetry-mapping.md`
- `src/services/githubClient.ts`
