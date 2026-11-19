export interface EtagCacheEntry<T> {
  etag: string;
  data: T;
  timestamp: number;
}

const CACHE_PREFIX = 'etag:';

function getStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function etagCacheKey(url: string): string {
  return `${CACHE_PREFIX}${encodeURIComponent(url)}`;
}

export function readEtagCache<T>(url: string): EtagCacheEntry<T> | null {
  const raw = getStorage()?.getItem(etagCacheKey(url));
  if (!raw) return null;

  try {
    const entry = JSON.parse(raw) as Partial<EtagCacheEntry<T>>;
    if (typeof entry.etag !== 'string' || entry.data === undefined) return null;
    return { etag: entry.etag, data: entry.data, timestamp: entry.timestamp ?? 0 };
  } catch {
    return null;
  }
}

export function writeEtagCache<T>(url: string, etag: string, data: T): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    const entry: EtagCacheEntry<T> = { etag, data, timestamp: Date.now() };
    storage.setItem(etagCacheKey(url), JSON.stringify(entry));
  } catch {
    // Quota exceeded or storage disabled: the cache is best-effort, never fatal.
  }
}

export function clearEtagCache(): void {
  const storage = getStorage();
  if (!storage) return;

  for (const key of Object.keys(storage)) {
    if (key.startsWith(CACHE_PREFIX)) storage.removeItem(key);
  }
}
