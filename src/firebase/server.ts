
import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

function getFirebaseAdmin() {
  if (getApps().length > 0) {
    const adminApp = getApp();
    return {
        firebaseApp: adminApp,
        auth: getAuth(adminApp),
        firestore: getFirestore(adminApp),
    };
  }

  const adminApp = initializeApp({
    credential: cert(serviceAccount!),
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    storageBucket: firebaseConfig.storageBucket,
  });

  return {
    firebaseApp: adminApp,
    auth: getAuth(adminApp),
    firestore: getFirestore(adminApp),
  };
}

export { getFirebaseAdmin };
