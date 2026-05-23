// Auth service — the only file that calls Firebase Auth SDK methods.
// Hooks call these; views and components never import this directly.

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";
import { userService } from "./user-service";
import type { SignInCredentials, SignUpCredentials } from "@/page/auth/interfaces/auth-credentials.interface";

export const authService = {
  async signIn({ email, password }: SignInCredentials): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password);
  },

  async signUp({ email, password, displayName }: SignUpCredentials): Promise<void> {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Create the user's Firestore document on sign up
    await userService.upsertProfile({
      id: user.uid,
      email,
      firstName: displayName ?? null,
      lastName: null,
      phone: null,
      photoUrl: null,
      role: null,
      isActive: true,
      hasCompletedOnboarding: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },

  async signOut(): Promise<void> {
    await signOut(auth);
  },
};
