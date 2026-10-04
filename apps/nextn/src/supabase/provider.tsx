'use client';

import React, {
  DependencyList,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Firestore } from './db';
import { Auth, onAuthStateChanged, restoreSession, type User } from './auth';
import { SESSION_KEY } from './client';
import { Storage } from './storage';

interface SupabaseProviderProps {
  children: ReactNode;
  /** Null when the Supabase env vars are missing. */
  client: SupabaseClient | null;
}

export interface SupabaseContextState {
  areServicesAvailable: boolean;
  client: SupabaseClient | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: Storage | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface SupabaseServicesAndUser {
  client: SupabaseClient | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: Storage | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const SupabaseContext = createContext<SupabaseContextState | undefined>(
  undefined
);

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({
  children,
  client,
}) => {
  const services = useMemo(
    () =>
      client
        ? {
            firestore: new Firestore(client),
            auth: new Auth(client),
            storage: new Storage(client),
          }
        : { firestore: null, auth: null, storage: null },
    [client]
  );

  const [userState, setUserState] = useState<UserHookResult>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    if (!client || !services.auth) {
      setUserState({
        user: null,
        isUserLoading: false,
        userError: new Error('Supabase client not available.'),
      });
      return;
    }
    const auth = services.auth;
    let cancelled = false;

    // Resolve the stored login token to a user.
    const restore = async () => {
      try {
        const user = await restoreSession(auth);
        if (!cancelled) setUserState({ user, isUserLoading: false, userError: null });
      } catch (e) {
        if (!cancelled)
          setUserState({ user: null, isUserLoading: false, userError: e as Error });
      }
    };
    void restore();

    // Login / logout in this tab.
    const unsubscribe = onAuthStateChanged(auth, user =>
      setUserState({ user, isUserLoading: false, userError: null })
    );
    // Login / logout in another tab.
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) void restore();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener('storage', onStorage);
    };
  }, [client, services.auth]);

  const contextValue = useMemo(
    (): SupabaseContextState => ({
      areServicesAvailable: !!client,
      client,
      firestore: services.firestore,
      auth: services.auth,
      storage: services.storage,
      user: userState.user,
      isUserLoading: userState.isUserLoading,
      userError: userState.userError,
    }),
    [client, services, userState]
  );

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
};

function useSupabaseContext(hook: string): SupabaseContextState {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error(`${hook} must be used within a SupabaseProvider.`);
  }
  return context;
}

/** Access the Supabase services plus the current user. */
export const useSupabase = (): SupabaseServicesAndUser => {
  const c = useSupabaseContext('useSupabase');
  return {
    client: c.client,
    firestore: c.firestore,
    auth: c.auth,
    storage: c.storage,
    user: c.user,
    isUserLoading: c.isUserLoading,
    userError: c.userError,
  };
};

export const useAuth = (): Auth | null => useSupabaseContext('useAuth').auth;

export const useFirestore = (): Firestore | null =>
  useSupabaseContext('useFirestore').firestore;

export const useStorage = (): Storage | null =>
  useSupabaseContext('useStorage').storage;

export const useUser = (): UserHookResult => {
  const c = useSupabaseContext('useUser');
  return {
    user: c.user,
    isUserLoading: c.isUserLoading,
    userError: c.userError,
  };
};

type MemoSupabase<T> = T & { __memo?: boolean };

export function useMemoSupabase<T>(
  factory: () => T,
  deps: DependencyList
): T | MemoSupabase<T> {
  const memoized = useMemo(factory, deps);
  if (typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoSupabase<T>).__memo = true;
  return memoized;
}
