// Firebase config — values are inlined at build time by Next.js.
// IMPORTANT: must use static `process.env.NAME` access (not bracket notation)
// for Next.js to inline NEXT_PUBLIC_* variables into the client bundle.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Static check using direct property access — these get inlined as literal
// strings at build time, so the missing-vars detection works in the browser.
const missing: string[] = [];
if (!firebaseConfig.apiKey) missing.push('NEXT_PUBLIC_FIREBASE_API_KEY');
if (!firebaseConfig.authDomain) missing.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
if (!firebaseConfig.projectId) missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
if (!firebaseConfig.storageBucket) missing.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
if (!firebaseConfig.messagingSenderId) missing.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
if (!firebaseConfig.appId) missing.push('NEXT_PUBLIC_FIREBASE_APP_ID');

if (missing.length > 0 && typeof window !== 'undefined') {
  console.warn('⚠️ Some Firebase environment variables are missing:', missing);
  console.warn('The app may not work correctly without these variables.');
}

export const db = firebaseConfig;

