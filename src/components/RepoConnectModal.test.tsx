import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../lib/i18n';

const { fetchRepoDataMock } = vi.hoisted(() => ({ fetchRepoDataMock: vi.fn() }));

vi.mock('../services/githubClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/githubClient')>();
  return { ...actual, fetchRepoData: fetchRepoDataMock };
});

import { RateLimitError, getSandboxData } from '../services/githubClient';
import { useGameStore } from '../store/useGameStore';
import { RepoConnectModal, normalizeSlug } from './RepoConnectModal';

const store = () => useGameStore.getState();

beforeEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  fetchRepoDataMock.mockReset();
  store().reset();
});

describe('normalizeSlug', () => {
  it('accepts slugs and GitHub URLs', () => {
    expect(normalizeSlug('owner/repo')).toBe('owner/repo');
    expect(normalizeSlug('  owner/repo  ')).toBe('owner/repo');
    expect(normalizeSlug('https://github.com/owner/repo')).toBe('owner/repo');
    expect(normalizeSlug('http://www.github.com/owner/repo/')).toBe('owner/repo');
    expect(normalizeSlug('https://github.com/owner/repo.git')).toBe('owner/repo');
  });

  it('leaves invalid input for the validator to reject', () => {
    expect(normalizeSlug('not-a-repo')).toBe('not-a-repo');
    expect(normalizeSlug('')).toBe('');
  });
});

describe('RepoConnectModal', () => {
  it('renders a modal dialog and focuses the slug input', () => {
    render(<RepoConnectModal />);

    expect(screen.getByRole('dialog')).toBeDefined();
    const slug = screen.getByLabelText('Repository') as HTMLInputElement;
    expect(document.activeElement).toBe(slug);
  });

  it('uses a password input for the PAT', () => {
    render(<RepoConnectModal />);

    const pat = screen.getByLabelText('Personal access token') as HTMLInputElement;
    expect(pat.type).toBe('password');
  });

  it('connects with a normalized slug and no PAT', async () => {
    fetchRepoDataMock.mockResolvedValue({ ...getSandboxData(), slug: 'octo/repo' });
    render(<RepoConnectModal />);

    fireEvent.change(screen.getByLabelText('Repository'), {
      target: { value: 'https://github.com/octo/repo' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Connect Repository' }));

    await waitFor(() => expect(store().connected).toBe(true));
    expect(fetchRepoDataMock).toHaveBeenCalledWith('octo/repo', undefined);
  });

  it('rejects a malformed slug without calling the API', async () => {
    render(<RepoConnectModal />);

    fireEvent.change(screen.getByLabelText('Repository'), { target: { value: 'octo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Connect Repository' }));

    expect(await screen.findByRole('alert')).toBeDefined();
    expect(screen.getByRole('alert').textContent).toBe('Enter a repository as owner/repo.');
    expect(fetchRepoDataMock).not.toHaveBeenCalled();
  });

  it('shows the rate-limit banner when the API is throttled', async () => {
    fetchRepoDataMock.mockRejectedValue(new RateLimitError(403));
    render(<RepoConnectModal />);

    fireEvent.change(screen.getByLabelText('Repository'), { target: { value: 'octo/repo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Connect Repository' }));

    expect(await screen.findByRole('alert')).toBeDefined();
    expect(screen.getByRole('alert').textContent).toBe(
      'GitHub rate limit reached. Add a PAT or use Sandbox mode.'
    );
    expect(store().connected).toBe(false);
  });

  it('disables the submit button while connecting', async () => {
    let resolveConnect: (value: unknown) => void = () => {};
    fetchRepoDataMock.mockReturnValue(
      new Promise((resolve) => {
        resolveConnect = resolve;
      })
    );
    render(<RepoConnectModal />);

    fireEvent.change(screen.getByLabelText('Repository'), { target: { value: 'octo/repo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Connect Repository' }));

    const button = await screen.findByRole('button', { name: 'Connecting...' });
    expect((button as HTMLButtonElement).disabled).toBe(true);

    resolveConnect({ ...getSandboxData(), slug: 'octo/repo' });
    await waitFor(() => expect(store().connected).toBe(true));
  });

  it('launches the sandbox and marks the store as connected', () => {
    render(<RepoConnectModal />);

    fireEvent.click(screen.getByRole('button', { name: 'Launch Dungeon Sandbox' }));

    expect(store().sandboxMode).toBe(true);
    expect(store().connected).toBe(true);
  });
});
