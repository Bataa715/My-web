'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    try {
      return initializeFirebase();
    } catch (e) {
      // Silently degrade — Firebase is optional at runtime.
      // Logged as a warning so the Next.js dev overlay does not surface it as an error.
      if (typeof window !== 'undefined') {
        console.warn('[firebase] initialization skipped:', (e as Error)?.message ?? e);
      }
      return null;
    }
  }, []);

  if (!firebaseServices) {
    return (
      <FirebaseProvider
        firebaseApp={null as any}
        auth={null as any}
        firestore={null as any}
        storage={null as any}
      >
        {children}
      </FirebaseProvider>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
      storage={firebaseServices.storage}
    >
      {children}
    </FirebaseProvider>
  );
}
