'use client';

/**
 * Email + password auth verified directly by the database
 * (functions app_signup / app_login / app_me / app_logout).
 * Errors are mapped to the `auth/*` codes the login / signup screens expect.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { getSessionToken, setSessionToken } from './client';

export interface User {
  /** User id (UUID). Kept as `uid` for existing call sites. */
  uid: string;
  email: string | null;
  displayName: string | null;
}

export class Auth {
  currentUser: User | null = null;
  constructor(public readonly client: SupabaseClient) {}
}

export class AuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

interface DbUser {
  id: string;
  email: string | null;
  name: string | null;
}

function toUser(row: DbUser | null | undefined): User | null {
  if (!row?.id) return null;
  return { uid: row.id, email: row.email ?? null, displayName: row.name ?? null };
}

// --- change notifications (login / logout in this tab) ----------------------
type Listener = (user: User | null) => void;
const listeners = new Set<Listener>();
function emit(auth: Auth, user: User | null) {
  auth.currentUser = user;
  listeners.forEach(l => l(user));
}

// --- error mapping -----------------------------------------------------------
const CODE_MAP: Record<string, string> = {
  invalid_credentials: 'auth/invalid-credential',
  too_many_attempts: 'auth/too-many-requests',
  email_in_use: 'auth/email-already-in-use',
  weak_password: 'auth/weak-password',
  invalid_email: 'auth/invalid-email',
};

function mapRpcError(error: { code?: string; message?: string }): AuthError {
  const message = error.message ?? '';
  for (const key of Object.keys(CODE_MAP)) {
    if (message.includes(key)) return new AuthError(CODE_MAP[key], message);
  }
  // PostgREST: function / table does not exist yet -> migration not run
  if (error.code === 'PGRST202' || error.code === '42883' || error.code === 'PGRST205') {
    return new AuthError(
      'auth/setup-required',
      'Өгөгдлийн сан бэлэн биш байна: supabase/migrations/0002_custom_auth.sql-ийг ажиллуулна уу.'
    );
  }
  if (/failed to fetch|network|load failed/i.test(message)) {
    return new AuthError('auth/network-request-failed', message);
  }
  return new AuthError(error.code ? `auth/${error.code}` : 'auth/unknown', message);
}

async function startSession(
  auth: Auth,
  fn: 'app_login' | 'app_signup',
  args: Record<string, unknown>
): Promise<{ user: User }> {
  const { data, error } = await auth.client.rpc(fn, args);
  if (error) throw mapRpcError(error);

  if (data?.error) {
    throw new AuthError(CODE_MAP[data.error] ?? `auth/${data.error}`, String(data.error));
  }
  const user = toUser(data?.user);
  if (!data?.token || !user) {
    throw new AuthError('auth/unknown', 'Unexpected response from the database.');
  }
  setSessionToken(data.token);
  emit(auth, user);
  return { user };
}

export function signInWithEmailAndPassword(
  auth: Auth,
  email: string,
  password: string
): Promise<{ user: User }> {
  return startSession(auth, 'app_login', { p_email: email, p_password: password });
}

export function createUserWithEmailAndPassword(
  auth: Auth,
  email: string,
  password: string,
  profile?: { name?: string }
): Promise<{ user: User }> {
  return startSession(auth, 'app_signup', {
    p_email: email,
    p_password: password,
    p_name: profile?.name ?? null,
  });
}

export async function signOut(auth: Auth): Promise<void> {
  try {
    await auth.client.rpc('app_logout'); // best effort: invalidate server side
  } finally {
    setSessionToken(null);
    emit(auth, null);
  }
}

/**
 * Resolves the stored token to a user. Returns null (and forgets the token)
 * when it is missing / expired; throws on network problems so a temporary
 * outage does not log you out.
 */
export async function restoreSession(auth: Auth): Promise<User | null> {
  if (!getSessionToken()) {
    auth.currentUser = null;
    return null;
  }
  const { data, error } = await auth.client.rpc('app_me');
  if (error) throw mapRpcError(error);
  const user = toUser(data as DbUser | null);
  if (!user) setSessionToken(null);
  auth.currentUser = user;
  return user;
}

export function onAuthStateChanged(
  _auth: Auth,
  next: (user: User | null) => void
): () => void {
  listeners.add(next);
  return () => {
    listeners.delete(next);
  };
}
