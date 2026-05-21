// Auth service (DEMO MODE) - calls into the in-memory mock in firebase.ts.
// Hooks call these methods; views and components never import this directly.

import { auth } from "./firebase";

import type { SignInCredentials, SignUpCredentials } from "@/page/auth/interfaces/auth-credentials.interface";

type FirebaseLikeUser = { uid: string; email: string | null; displayName: string | null };

type AuthApi = {
  signInWithEmailAndPassword: (email: string, password: string) => Promise<{ user: FirebaseLikeUser }>;
  createUserWithEmailAndPassword: (email: string, password: string) => Promise<{ user: FirebaseLikeUser }>;
  updateProfile: (user: unknown, profile: { displayName?: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const authApi = auth as unknown as AuthApi;

export const authService = {
  async signIn({ email, password }: SignInCredentials): Promise<void> {
    await authApi.signInWithEmailAndPassword(email, password);
  },

  async signUp({ email, password, displayName }: SignUpCredentials): Promise<void> {
    const credential = await authApi.createUserWithEmailAndPassword(email, password);
    if (displayName && credential.user) {
      await authApi.updateProfile(credential.user, { displayName });
    }
  },

  async signOut(): Promise<void> {
    await authApi.signOut();
  },
};
