'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length === 0) {
    if (process.env.NODE_ENV === 'development') {
      // In development, always use the config object
      return getSdks(initializeApp(firebaseConfig));
    } else {
      // In production, try automatic initialization first
      try {
        const app = initializeApp();
        return getSdks(app);
      } catch (e) {
        console.warn('Automatic initialization failed in production. Falling back to firebase config object.', e);
        // Fallback to config object if automatic fails even in production
        return getSdks(initializeApp(firebaseConfig));
      }
    }
  }
  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}


export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';
