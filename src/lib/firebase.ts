import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA3uXqDXP-4naLReHWlohxn-3_DZClEmO8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "couch-commander-pwa.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "couch-commander-pwa",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "couch-commander-pwa.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "413465318504",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:413465318504:web:8d4ec90c2b2310129157dd",
};

export const app = !getApps().length ? initializeApp(FIREBASE_CONFIG) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

let dbInstance: ReturnType<typeof getFirestore>;

try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
