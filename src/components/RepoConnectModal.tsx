import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RateLimitError } from '../services/githubClient';
import { useGameStore } from '../store/useGameStore';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Accepts `owner/repo`, `github.com/owner/repo`, or a full URL and returns `owner/repo`. */
export function normalizeSlug(input: string): string {
  const trimmed = input
    .trim()
    .replace(/\.git$/i, '')
    .replace(/\/+$/, '');
  const match = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s]+)\/([^/\s]+)$/i.exec(trimmed);
  if (match?.[1] && match[2]) return `${match[1]}/${match[2]}`;
  return trimmed;
}

function isRepoSlug(value: string): boolean {
  return /^[^/\s]+\/[^/\s]+$/.test(value);
}

export function RepoConnectModal() {
  const { t } = useTranslation();
  const connect = useGameStore((state) => state.connect);
  const launchSandbox = useGameStore((state) => state.launchSandbox);
  const [slug, setSlug] = useState('');
  const [pat, setPat] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    slugRef.current?.focus();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener('keydown', trapFocus);
    return () => dialog.removeEventListener('keydown', trapFocus);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeSlug(slug);
    if (!isRepoSlug(normalized)) {
      setErrorKey('connect.errorInvalidSlug');
      return;
    }

    setErrorKey(null);
    setIsConnecting(true);
    try {
      const token = pat.trim();
      await connect(normalized, token.length > 0 ? token : undefined);
    } catch (error) {
      setErrorKey(
        error instanceof RateLimitError ? 'connect.errorRateLimit' : 'connect.errorNotFound'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg p-4">
      <dialog
        ref={dialogRef}
        open
        aria-modal="true"
        aria-labelledby="repo-connect-title"
        className="relative m-auto w-full max-w-md rounded-lg border-2 border-gold bg-bg p-6 text-text"
      >
        <h2 id="repo-connect-title" className="mb-4 text-2xl font-bold text-gold">
          {t('connect.title')}
        </h2>

        {errorKey ? (
          <p
            role="alert"
            className="mb-4 rounded border border-danger px-3 py-2 text-sm text-danger"
          >
            {t(errorKey)}
          </p>
        ) : null}

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm text-muted" htmlFor="repo-slug">
            {t('connect.slugLabel')}
            <input
              id="repo-slug"
              ref={slugRef}
              className="rounded border border-muted bg-bg px-3 py-2 font-mono text-sm text-text focus:border-gold"
              placeholder={t('connect.slugPlaceholder')}
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-muted" htmlFor="repo-pat">
            {t('connect.patLabel')}
            <input
              id="repo-pat"
              type="password"
              className="rounded border border-muted bg-bg px-3 py-2 font-mono text-sm text-text focus:border-gold"
              placeholder={t('connect.patPlaceholder')}
              value={pat}
              onChange={(event) => setPat(event.target.value)}
              autoComplete="off"
            />
          </label>

          <button
            type="submit"
            disabled={isConnecting}
            className="rounded border border-gold bg-gold/10 px-4 py-2 font-semibold text-gold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isConnecting ? t('connect.connecting') : t('connect.connectButton')}
          </button>

          <button
            type="button"
            onClick={() => launchSandbox()}
            className="rounded border border-muted px-4 py-2 text-text hover:border-gold"
          >
            {t('connect.sandboxButton')}
          </button>
        </form>
      </dialog>
    </div>
  );
}
