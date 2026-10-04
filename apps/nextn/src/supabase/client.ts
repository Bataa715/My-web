'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** localStorage key holding this browser's login token. */
export const SESSION_KEY = 'app-session-token';

export function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setSessionToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (token) window.localStorage.setItem(SESSION_KEY, token);
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* private mode: session lasts until reload */
  }
}

let browserClient: SupabaseClient | null = null;

/**
 * Singleton browser client. Supabase Auth is NOT used: login is verified by
 * the database itself (see supabase/migrations/0002_custom_auth.sql) and the
 * resulting token is attached to every request as `x-session-token`, which
 * the row level security policies resolve to a user.
 */
export function getSupabaseClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
    );
  }

  browserClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        const token = getSessionToken();
        if (token) headers.set('x-session-token', token);
        return fetch(input, { ...init, headers });
      },
    },
  });
  return browserClient;
}
