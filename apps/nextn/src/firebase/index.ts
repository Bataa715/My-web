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

