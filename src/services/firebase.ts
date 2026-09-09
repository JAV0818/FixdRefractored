// Firebase SDK initialization.
// Uses initializeAuth + getReactNativePersistence so auth works in Expo Go.
// Credentials loaded from EXPO_PUBLIC_* env vars — never hardcoded.

import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
// getReactNativePersistence ships only in firebase/auth's React Native build
// (dist/rn). Metro resolves it at runtime, but the package's web typings don't
// declare it — so we import it through the RN entry and the type stays correct.
// @ts-expect-error — RN-only export, absent from the default web type defs.
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Prevent re-initialization on hot reload
const isFirstLoad = getApps().length === 0;
export const firebaseApp = isFirstLoad ? initializeApp(firebaseConfig) : getApp();

// getReactNativePersistence — sessions survive app restarts via AsyncStorage
export const auth = isFirstLoad
  ? initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    })
  : getAuth(firebaseApp);

export const db = getFirestore(firebaseApp);
