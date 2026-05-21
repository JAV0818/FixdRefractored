// Firebase initialization. The single file in the app that imports from
// `firebase/*`. Services in this folder use these exports; the rest of
// the codebase talks to services, not to Firebase directly.
//
// On React Native, plain getAuth() throws "Component auth has not been
// registered yet" because there's no localStorage to persist sessions.
// initializeAuth + getReactNativePersistence(AsyncStorage) is the RN
// equivalent. The try/catch handles hot reload (initializeAuth throws if
// called twice).
//
// Add your Firebase config to a `.env` file (see `.env.example`).

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
// @ts-ignore — getReactNativePersistence is exposed but missing from typings in firebase@10
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = (() => {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(firebaseApp);
  }
})();

export const db = getFirestore(firebaseApp);
