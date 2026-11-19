# 992 — trap: a `Co-authored-by` trailer needs a GitHub user account

**Version**: 0.1.0
**Status**: Resolved
**Type**: trap
**Found in branch**: `feature/0.1.0-github-client-Y`
**Resolved in branch**: `fix/0.1.0-checkpoint-1`

---

## Symptoms

Commits carried `Co-authored-by: DeepSeek <noreply@deepseek.com>`, but GitHub showed no co-author
chip on the commit or in the pull request. The trailer was visible as plain text only.

---

## Reproduction

Push a commit with any `Co-authored-by` email that is not associated with a GitHub account.

---

## Root Cause

GitHub resolves co-authors by matching the trailer email to a **user or bot account**. `DeepSeek`
is an organization (`deepseek`, `deepseek-ai`), and organizations cannot be co-authors. No
`deepseek` user or `[bot]` account exists, so the placeholder email never resolves.

---

## Solution

The convention changed: **agents are not listed as co-authors**. Each branch keeps exactly one
`Co-authored-by` trailer on its heaviest commit, cross-credited to the other developer (Carlos on
`-Y` branches, Yonathan on `-C` branches). Agent attribution lives in `docs/history/<version>/`.

The R03 commit was already merged when this was found, so `main` was not rewritten; the rule applies
from R05 onward.

---

## Verification

- `.kiro/steering/conventions.md` and `.kiro/steering/agents.md` describe the single-trailer rule.
- `git log --format=%B` on later branches contains no agent trailer.

---

## References

- Conventions: `.kiro/steering/conventions.md` (section 5)
- History: `docs/history/v0.1.0/03-feature-github-client-Y.md`
