# 01 — 100% Client SPA, No Backend

**Date**: 2025-01-27
**Status**: Accepted

**Context**: Merge & Monsters needs to run as a Kiroween hackathon entry that judges can open immediately in a browser. Any backend would add deployment friction, cost, and latency. All data it needs (GitHub telemetry) is available via public REST API calls that can be made directly from the browser.

## Decision

The application is a fully static SPA. There is no custom server, no database, and no serverless function. All state lives in `localStorage` and `sessionStorage`. The GitHub REST API is called directly from the browser.

## Rationale

- Zero deployment friction: the build output is a folder of static files deployable to any CDN or GitHub Pages.
- No secrets to protect server-side: the GitHub PAT is optional, user-supplied, and stored only in `sessionStorage`.
- Matches the tech-stack constraint in `.kiro/steering/tech-stack.md`.

## Alternatives Considered

- **Node.js proxy server**: would hide the PAT but add deployment complexity and cost. Rejected.
- **Serverless function (Vercel/Netlify)**: still adds complexity; the PAT lives in the browser anyway once per session. Rejected.

## Consequences

- API rate limit is 60 req/hr without a PAT. The app must handle this gracefully with ETag caching and a Sandbox fallback.
- The PAT is visible in browser devtools. This is documented and expected; users supply it knowingly.

## References

- `.kiro/steering/tech-stack.md`
- `docs/architecture/00-overview.md`
