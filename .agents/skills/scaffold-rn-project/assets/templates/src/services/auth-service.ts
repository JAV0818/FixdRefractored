// Auth service — thin wrapper around Firebase Auth. Hooks call these
// methods; views and components never import this file directly.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth } from "./firebase";

import type { SignInCredentials, SignUpCredentials } from "@/page/auth/interfaces/auth-credentials.interface";

export const authService = {
  async signIn({ email, password }: SignInCredentials): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password);
  },

  async signUp({ email, password, displayName }: SignUpCredentials): Promise<void> {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && credential.user) {
      await updateProfile(credential.user, { displayName });
    }
  },

  async signOut(): Promise<void> {
    await signOut(auth);
  },
};
