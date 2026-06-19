import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(app);

/**
 * Firestore instance configured for standard caching.
 * Note: persistentLocalCache was removed because it causes uncatchable internal
 * assertion failures in the Firebase v10 SDK during Next.js Fast Refresh.
 */
export const db: Firestore = getFirestore(app);

/**
 * Initializes and returns the Firebase Analytics instance on the client.
 * @returns A promise resolving to the Analytics instance, or null if unsupported.
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  try {
    if (typeof window !== 'undefined' && await isSupported()) {
      return getAnalytics(app);
    }
  } catch (error: unknown) {
    console.error('Firebase analytics initialization error:', error);
  }
  return null;
}
