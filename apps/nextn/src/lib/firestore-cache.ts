/**
 * Lightweight localStorage cache layer for Firestore collections.
 * - Instant first paint from cached data
 * - Used together with `onSnapshot` for real-time updates
 */

const PREFIX = 'pw_cache_v1::';

type Reviver = (key: string, value: unknown) => unknown;

const dateReviver: Reviver = (_key, value) => {
  if (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
  ) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  return value;
};

export function readCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw, dateReviver) as T;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch {
    /* quota / disabled — ignore */
  }
}

export function clearCache(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}
