'use client';

import { firebaseConfig } from '@/firebase/config';
import {
  initializeApp,
  getApps,
  FirebaseApp,
} from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const APP_NAME = 'personal-web';

export function initializeFirebase() {
  // Validate required config first — throw early with a clear message.
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;
  for (const key of required) {
    if (!firebaseConfig[key]) {
      throw new Error(
        `Missing Firebase config value: NEXT_PUBLIC_FIREBASE_${key
          .replace(/([A-Z])/g, '_$1')
          .toUpperCase()}`
      );
    }
  }

  const existing = getApps().find(a => a.name === APP_NAME);
  const app = existing ?? initializeApp(firebaseConfig, APP_NAME);
  return getSdks(app);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp),
  };
}

export * from './provider';
export * from './client-provider';
export * from './errors';
export * from './error-emitter';

