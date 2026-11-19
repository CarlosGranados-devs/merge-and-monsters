import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  RateLimitError,
  SANDBOX_SLUG,
  fetchRepoData,
  isSandboxMode,
  setSandboxMode,
} from './githubClient';

const { requestMock, octokitConstructor } = vi.hoisted(() => {
  const requestMock = vi.fn();
  return {
    requestMock,
    octokitConstructor: vi.fn(() => ({ request: requestMock })),
  };
});

vi.mock('@octokit/rest', () => ({ Octokit: octokitConstructor }));

const DAY_MS = 86_400_000;
const REPO_URL = 'https://api.github.com/repos/octo/repo';

type RequestParams = Record<string, unknown>;

interface GithubError extends Error {
  status: number;
  response: { headers: Record<string, string> };
}

function githubError(status: number, headers: Record<string, string> = {}): GithubError {
  return Object.assign(new Error(`HTTP ${status}`), { status, response: { headers } });
}

function apiResponse(data: unknown, etag: string, headers: Record<string, string> = {}) {
  return { data, headers: { etag, ...headers } };
}

const REPO = { language: 'TypeScript' };

const COMMIT_LIST = [
  {
    sha: 'sha-1',
    commit: { message: 'feat: first commit', author: { date: '2026-01-01T00:00:00Z' } },
    author: { login: 'dev', avatar_url: 'https://example.com/avatar.png' },
  },
];

const COMMIT_DETAIL = { stats: { additions: 120, deletions: 30 } };

const PULLS = [
  {
    id: 1,
    number: 10,
    title: 'Merged change',
    merged_at: '2026-01-02T00:00:00Z',
    user: { login: 'dev' },
    labels: [{ name: 'feature' }],
  },
  {
    id: 2,
    number: 11,
    title: 'Closed without merge',
    merged_at: null,
    user: { login: 'dev' },
    labels: [],
  },
];

const ISSUES = [
  {
    id: 100,
    number: 5,
    title: 'Combat log flickers',
    body: 'Steps to reproduce',
    created_at: '2026-01-03T00:00:00Z',
    labels: [{ name: 'bug' }],
    user: { login: 'dev' },
  },
  {
    id: 101,
    number: 6,
    title: 'A pull request listed as issue',
    body: null,
    created_at: '2026-01-04T00:00:00Z',
    labels: [],
    user: { login: 'dev' },
    pull_request: { url: 'https://api.github.com/repos/octo/repo/pulls/6' },
  },
];

function mockGithub() {
  requestMock.mockImplementation(async (route: string, params: RequestParams = {}) => {
    switch (route) {
      case 'GET /repos/{owner}/{repo}':
        return apiResponse(REPO, 'etag-repo');
      case 'GET /repos/{owner}/{repo}/commits':
        return apiResponse(COMMIT_LIST, 'etag-commits');
      case 'GET /repos/{owner}/{repo}/commits/{ref}':
        return apiResponse(COMMIT_DETAIL, 'etag-commit-detail');
      case 'GET /repos/{owner}/{repo}/pulls':
        return apiResponse(PULLS, 'etag-pulls');
      case 'GET /repos/{owner}/{repo}/issues':
        return params.state === 'closed'
          ? apiResponse([ISSUES[0]], 'etag-issues-closed', {
              link: '<https://api.github.com/repositories/1/issues?state=closed&per_page=1&page=7>; rel="last"',
            })
          : apiResponse(ISSUES, 'etag-issues-open');
      case 'GET /repos/{owner}/{repo}/contents/{path}':
        return apiResponse({ name: 'README.md' }, 'etag-readme');
      case 'GET /repos/{owner}/{repo}/actions/workflows':
        return apiResponse({ total_count: 2 }, 'etag-workflows');
      default:
        throw new Error(`Unexpected route: ${route}`);
    }
  });
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  setSandboxMode(false);
});

describe('fetchRepoData', () => {
  it('maps the GitHub payload to RepoData', async () => {
    mockGithub();

    const data = await fetchRepoData('octo/repo');

    expect(data.slug).toBe('octo/repo');
    expect(data.primaryLanguage).toBe('TypeScript');
    expect(data.commits).toHaveLength(1);
    expect(data.commits[0]?.sha).toBe('sha-1');
    expect(data.commits[0]?.stats).toEqual({ additions: 120, deletions: 30 });
    expect(data.commits[0]?.author.login).toBe('dev');
    expect(data.mergedPrs).toHaveLength(1);
    expect(data.mergedPrs[0]?.number).toBe(10);
    expect(data.openIssues).toHaveLength(1);
    expect(data.openIssues[0]?.labels).toEqual([{ name: 'bug' }]);
    expect(data.openIssueCount).toBe(1);
    expect(data.closedIssueCount).toBe(7);
    expect(data.hasReadme).toBe(true);
    expect(data.hasCiWorkflows).toBe(true);
  });

  it('stores the ETag in localStorage keyed by URL', async () => {
    mockGithub();

    await fetchRepoData('octo/repo');

    const stored = JSON.parse(
      localStorage.getItem(`etag:${encodeURIComponent(REPO_URL)}`) ?? 'null'
    ) as { etag: string; timestamp: number } | null;

    expect(stored?.etag).toBe('etag-repo');
    expect(stored?.timestamp).toEqual(expect.any(Number));
  });

  it('sends If-None-Match and returns the cached payload on 304', async () => {
    mockGithub();
    const first = await fetchRepoData('octo/repo');

    const sentHeaders: RequestParams[] = [];
    requestMock.mockImplementation(async (_route: string, params: RequestParams = {}) => {
      sentHeaders.push(params.headers as RequestParams);
      throw githubError(304);
    });

    const second = await fetchRepoData('octo/repo');

    expect(second).toEqual(first);
    expect(sentHeaders.some((headers) => headers['if-none-match'] === 'etag-repo')).toBe(true);
  });

  it('throws RateLimitError on 403 with the reset timestamp', async () => {
    requestMock.mockImplementation(async () => {
      throw githubError(403, { 'x-ratelimit-reset': '1800000000' });
    });

    const error = await fetchRepoData('octo/repo').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(RateLimitError);
    expect((error as RateLimitError).status).toBe(403);
    expect((error as RateLimitError).resetAt).toBe(1_800_000_000_000);
  });

  it('throws RateLimitError on 429', async () => {
    requestMock.mockImplementation(async () => {
      throw githubError(429);
    });

    const error = await fetchRepoData('octo/repo').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(RateLimitError);
    expect((error as RateLimitError).status).toBe(429);
    expect((error as RateLimitError).resetAt).toBeNull();
  });

  it('passes the PAT to Octokit without persisting it', async () => {
    mockGithub();

    await fetchRepoData('octo/repo', 'ghp_sandbox_secret');

    expect(octokitConstructor).toHaveBeenCalledWith({ auth: 'ghp_sandbox_secret' });
    const persisted = Object.keys(localStorage).some((key) =>
      (localStorage.getItem(key) ?? '').includes('ghp_sandbox_secret')
    );
    expect(persisted).toBe(false);
  });

  it('rejects malformed slugs', async () => {
    await expect(fetchRepoData('octo')).rejects.toThrow(TypeError);
  });
});

describe('sandbox mode', () => {
  it('returns the static mock without network calls', async () => {
    mockGithub();
    setSandboxMode(true);

    expect(isSandboxMode()).toBe(true);

    const data = await fetchRepoData('octo/repo');

    expect(requestMock).not.toHaveBeenCalled();
    expect(data.slug).toBe(SANDBOX_SLUG);
    expect(data.primaryLanguage).toBe('TypeScript');
    expect(data.hasReadme).toBe(true);
    expect(data.hasCiWorkflows).toBe(true);
    expect(data.commits).toHaveLength(5);
    expect(data.mergedPrs).toHaveLength(2);
    expect(data.openIssues).toHaveLength(4);
    expect(data.openIssues.map((issue) => issue.labels[0]?.name ?? '')).toEqual([
      'bug',
      'enhancement',
      'documentation',
      '',
    ]);

    for (const commit of data.commits) {
      const delta = commit.stats.additions + commit.stats.deletions;
      expect(delta).toBeGreaterThanOrEqual(10);
      expect(delta).toBeLessThanOrEqual(500);
    }

    const ages = data.openIssues.map((issue) =>
      Math.round((Date.now() - new Date(issue.created_at).getTime()) / DAY_MS)
    );
    expect(ages).toEqual([2, 15, 30, 60]);
  });

  it('returns to live mode when disabled', async () => {
    setSandboxMode(true);
    setSandboxMode(false);
    mockGithub();

    await fetchRepoData('octo/repo');

    expect(requestMock).toHaveBeenCalled();
  });
});
