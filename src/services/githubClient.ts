import { Octokit } from '@octokit/rest';
import { readEtagCache, writeEtagCache } from '../lib/etagCache';
import type { RawCommit, RawIssue, RawPr, RepoData } from '../types';

const API_BASE = 'https://api.github.com';
const COMMITS_WINDOW = 5;
const PULLS_WINDOW = 10;
const ISSUES_WINDOW = 100;
const DAY_MS = 86_400_000;

export const SANDBOX_SLUG = 'sandbox/merge-and-monsters';

let sandboxMode = false;

export function setSandboxMode(enabled: boolean): void {
  sandboxMode = enabled;
}

export function isSandboxMode(): boolean {
  return sandboxMode;
}

export class RateLimitError extends Error {
  readonly status: 403 | 429;
  readonly resetAt: number | null;

  constructor(status: 403 | 429, resetAt: number | null = null) {
    super(
      status === 429 ? 'GitHub API secondary rate limit reached' : 'GitHub API rate limit reached'
    );
    this.name = 'RateLimitError';
    this.status = status;
    this.resetAt = resetAt;
  }
}

type RequestHeaders = Record<string, string>;

interface EtagResponse<T> {
  etag: string | undefined;
  data: T;
}

function errorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('status' in error)) return undefined;
  const { status } = error as { status: unknown };
  return typeof status === 'number' ? status : undefined;
}

function rateLimitReset(error: unknown): number | null {
  if (typeof error !== 'object' || error === null || !('response' in error)) return null;
  const response = (
    error as { response?: { headers?: Record<string, string | number | undefined> } }
  ).response;
  const raw = response?.headers?.['x-ratelimit-reset'];
  const seconds = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : null;
}

async function requestWithEtag<T>(
  url: string,
  send: (headers: RequestHeaders) => Promise<EtagResponse<T>>
): Promise<T> {
  const cached = readEtagCache<T>(url);
  const headers: RequestHeaders = { accept: 'application/vnd.github+json' };
  if (cached) headers['if-none-match'] = cached.etag;

  try {
    const response = await send(headers);
    if (response.etag) writeEtagCache(url, response.etag, response.data);
    return response.data;
  } catch (error) {
    const status = errorStatus(error);
    if (status === 304 && cached) return cached.data;
    if (status === 403 || status === 429) throw new RateLimitError(status, rateLimitReset(error));
    throw error;
  }
}

function parseSlug(slug: string): { owner: string; repo: string } {
  const [owner, repo] = slug.split('/');
  if (!owner || !repo) {
    throw new TypeError(`Invalid repository slug "${slug}": expected "owner/repo"`);
  }
  return { owner, repo };
}

type ApiLabel = string | { name?: string };

function mapLabels(labels: ApiLabel[]): Array<{ name: string }> {
  return labels.map((label) => ({ name: typeof label === 'string' ? label : (label.name ?? '') }));
}

function lastPageNumber(link: string | undefined, fallback: number): number {
  if (!link) return fallback;
  const match = /[?&]page=(\d+)>;\s*rel="last"/.exec(link);
  return match?.[1] ? Number(match[1]) : fallback;
}

async function fetchCommits(
  octokit: Octokit,
  owner: string,
  repo: string,
  base: string
): Promise<RawCommit[]> {
  const list = await requestWithEtag<
    Array<{
      sha: string;
      message: string;
      login: string;
      avatarUrl: string;
      date: string;
    }>
  >(`${base}/commits?per_page=${COMMITS_WINDOW}`, async (headers) => {
    const response = await octokit.request('GET /repos/{owner}/{repo}/commits', {
      owner,
      repo,
      per_page: COMMITS_WINDOW,
      headers,
    });
    return {
      etag: response.headers.etag,
      data: response.data.map((item) => ({
        sha: item.sha,
        message: item.commit.message,
        login: item.author?.login ?? 'ghost',
        avatarUrl: item.author?.avatar_url ?? '',
        date: item.commit.author?.date ?? '',
      })),
    };
  });

  return Promise.all(
    list.map(async (item) => {
      const stats = await requestWithEtag<{ additions: number; deletions: number }>(
        `${base}/commits/${item.sha}`,
        async (headers) => {
          const response = await octokit.request('GET /repos/{owner}/{repo}/commits/{ref}', {
            owner,
            repo,
            ref: item.sha,
            headers,
          });
          return {
            etag: response.headers.etag,
            data: {
              additions: response.data.stats?.additions ?? 0,
              deletions: response.data.stats?.deletions ?? 0,
            },
          };
        }
      );

      return {
        sha: item.sha,
        message: item.message,
        author: { login: item.login, avatar_url: item.avatarUrl },
        stats,
        date: item.date,
      };
    })
  );
}

async function fetchMergedPrs(
  octokit: Octokit,
  owner: string,
  repo: string,
  base: string
): Promise<RawPr[]> {
  return requestWithEtag<RawPr[]>(
    `${base}/pulls?state=closed&per_page=${PULLS_WINDOW}&sort=updated&direction=desc`,
    async (headers) => {
      const response = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
        owner,
        repo,
        state: 'closed',
        per_page: PULLS_WINDOW,
        sort: 'updated',
        direction: 'desc',
        headers,
      });
      return {
        etag: response.headers.etag,
        data: response.data
          .filter((pr) => pr.merged_at !== null)
          .map((pr) => ({
            id: pr.id,
            number: pr.number,
            title: pr.title,
            merged_at: pr.merged_at,
            user: { login: pr.user?.login ?? 'ghost' },
            labels: mapLabels(pr.labels),
          })),
      };
    }
  );
}

async function fetchOpenIssues(
  octokit: Octokit,
  owner: string,
  repo: string,
  base: string
): Promise<RawIssue[]> {
  return requestWithEtag<RawIssue[]>(
    `${base}/issues?state=open&per_page=${ISSUES_WINDOW}&sort=created&direction=desc`,
    async (headers) => {
      const response = await octokit.request('GET /repos/{owner}/{repo}/issues', {
        owner,
        repo,
        state: 'open',
        per_page: ISSUES_WINDOW,
        sort: 'created',
        direction: 'desc',
        headers,
      });
      return {
        etag: response.headers.etag,
        data: response.data
          .filter((issue) => !issue.pull_request)
          .map((issue) => ({
            id: issue.id,
            number: issue.number,
            title: issue.title,
            body: issue.body ?? null,
            created_at: issue.created_at,
            labels: mapLabels(issue.labels),
            user: { login: issue.user?.login ?? 'ghost' },
          })),
      };
    }
  );
}

async function fetchClosedIssueCount(
  octokit: Octokit,
  owner: string,
  repo: string,
  base: string
): Promise<number> {
  return requestWithEtag<number>(`${base}/issues?state=closed&per_page=1`, async (headers) => {
    const response = await octokit.request('GET /repos/{owner}/{repo}/issues', {
      owner,
      repo,
      state: 'closed',
      per_page: 1,
      headers,
    });
    return {
      etag: response.headers.etag,
      data: lastPageNumber(response.headers.link, response.data.length),
    };
  });
}

async function fetchHasReadme(
  octokit: Octokit,
  owner: string,
  repo: string,
  base: string
): Promise<boolean> {
  return requestWithEtag<boolean>(`${base}/contents/README.md`, async (headers) => {
    try {
      const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path: 'README.md',
        headers,
      });
      return { etag: response.headers.etag, data: true };
    } catch (error) {
      if (errorStatus(error) === 404) return { etag: undefined, data: false };
      throw error;
    }
  });
}

async function fetchHasCiWorkflows(
  octokit: Octokit,
  owner: string,
  repo: string,
  base: string
): Promise<boolean> {
  return requestWithEtag<boolean>(`${base}/actions/workflows`, async (headers) => {
    try {
      const response = await octokit.request('GET /repos/{owner}/{repo}/actions/workflows', {
        owner,
        repo,
        headers,
      });
      return { etag: response.headers.etag, data: response.data.total_count > 0 };
    } catch (error) {
      if (errorStatus(error) === 404) return { etag: undefined, data: false };
      throw error;
    }
  });
}

export async function fetchRepoData(slug: string, pat?: string): Promise<RepoData> {
  if (sandboxMode) return getSandboxData();

  const { owner, repo } = parseSlug(slug);
  const octokit = new Octokit(pat ? { auth: pat } : {});
  const base = `${API_BASE}/repos/${owner}/${repo}`;

  const [primaryLanguage, commits, mergedPrs, openIssues, closedIssueCount, hasReadme, hasCi] =
    await Promise.all([
      requestWithEtag<string | null>(base, async (headers) => {
        const response = await octokit.request('GET /repos/{owner}/{repo}', {
          owner,
          repo,
          headers,
        });
        return { etag: response.headers.etag, data: response.data.language };
      }),
      fetchCommits(octokit, owner, repo, base),
      fetchMergedPrs(octokit, owner, repo, base),
      fetchOpenIssues(octokit, owner, repo, base),
      fetchClosedIssueCount(octokit, owner, repo, base),
      fetchHasReadme(octokit, owner, repo, base),
      fetchHasCiWorkflows(octokit, owner, repo, base),
    ]);

  return {
    slug: `${owner}/${repo}`,
    primaryLanguage,
    openIssueCount: openIssues.length,
    closedIssueCount,
    hasReadme,
    hasCiWorkflows: hasCi,
    commits,
    mergedPrs,
    openIssues,
  };
}

const SANDBOX_AVATAR = 'https://avatars.githubusercontent.com/u/583231?v=4';

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

function sandboxCommit(
  sha: string,
  message: string,
  login: string,
  daysAgo: number,
  additions: number,
  deletions: number
): RawCommit {
  return {
    sha,
    message,
    author: { login, avatar_url: SANDBOX_AVATAR },
    stats: { additions, deletions },
    date: isoDaysAgo(daysAgo),
  };
}

export function getSandboxData(): RepoData {
  return {
    slug: SANDBOX_SLUG,
    primaryLanguage: 'TypeScript',
    openIssueCount: 4,
    closedIssueCount: 12,
    hasReadme: true,
    hasCiWorkflows: true,
    commits: [
      sandboxCommit(
        'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
        'feat(engine): add pixel sprite atlas loader',
        'sandbox-dev',
        1,
        320,
        80
      ),
      sandboxCommit(
        'b2c3d4e5f60718293a4b5c6d7e8f901234567890',
        'fix(telemetry): clamp delta lines before XP formula',
        'sandbox-dev',
        2,
        12,
        4
      ),
      sandboxCommit(
        'c3d4e5f60718293a4b5c6d7e8f90123456789012',
        'feat(hud): render gold counter with satin gold accent',
        'sandbox-ops',
        3,
        150,
        30
      ),
      sandboxCommit(
        'd4e5f60718293a4b5c6d7e8f9012345678901234',
        'docs(readme): document sandbox mode and PAT handling',
        'sandbox-dev',
        5,
        60,
        9
      ),
      sandboxCommit(
        'e5f60718293a4b5c6d7e8f901234567890123456',
        'refactor(store): split processed ids persistence helper',
        'sandbox-ops',
        8,
        220,
        45
      ),
    ],
    mergedPrs: [
      {
        id: 4801,
        number: 42,
        title: 'Add canvas renderer skeleton',
        merged_at: isoDaysAgo(4),
        user: { login: 'sandbox-dev' },
        labels: [{ name: 'feature' }],
      },
      {
        id: 4802,
        number: 43,
        title: 'Wire i18n fallback for missing keys',
        merged_at: isoDaysAgo(6),
        user: { login: 'sandbox-ops' },
        labels: [{ name: 'enhancement' }],
      },
    ],
    openIssues: [
      {
        id: 9101,
        number: 101,
        title: 'Combat log flickers when a level up fires',
        body: 'Open the sandbox, trigger three commits in a row, then watch the log panel.',
        created_at: isoDaysAgo(2),
        labels: [{ name: 'bug' }],
        user: { login: 'sandbox-dev' },
      },
      {
        id: 9102,
        number: 102,
        title: 'Add critical hit screen shake intensity setting',
        body: 'Players should be able to soften screen shake for accessibility.',
        created_at: isoDaysAgo(15),
        labels: [{ name: 'enhancement' }],
        user: { login: 'sandbox-ops' },
      },
      {
        id: 9103,
        number: 103,
        title: 'Document monster scaling formula',
        body: 'Explain how issue age and labels affect monster HP.',
        created_at: isoDaysAgo(30),
        labels: [{ name: 'documentation' }],
        user: { login: 'sandbox-dev' },
      },
      {
        id: 9104,
        number: 104,
        title: 'Investigate rare duplicate XP on refresh',
        body: 'Reported twice, not reproducible yet.',
        created_at: isoDaysAgo(60),
        labels: [],
        user: { login: 'sandbox-ops' },
      },
    ],
  };
}
