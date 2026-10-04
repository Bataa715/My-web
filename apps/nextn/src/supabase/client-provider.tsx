'use client';

import React, { useMemo, type ReactNode } from 'react';
import { SupabaseProvider } from './provider';
import { getSupabaseClient } from './client';
import WriteErrorNotifier from './write-error-notifier';

export function SupabaseClientProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    try {
      return getSupabaseClient();
    } catch (e) {
      // Degrade gracefully (logged as a warning so the Next.js overlay stays quiet).
      if (typeof window !== 'undefined') {
        console.warn('[supabase] initialization skipped:', (e as Error)?.message ?? e);
      }
      return null;
    }
  }, []);

  return (
    <SupabaseProvider client={client}>
      <WriteErrorNotifier />
      {children}
    </SupabaseProvider>
  );
}
