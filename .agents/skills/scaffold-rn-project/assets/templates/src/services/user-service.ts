// User service — reads/writes the user profile in Firestore.
// Hooks call these methods.

import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "./firebase";

import type { UserProfile } from "@/page/auth/interfaces/user-profile.interface";

const COLLECTION = "users";

export const userService = {
  async getProfile(userId: string): Promise<UserProfile | undefined> {
    const snap = await getDoc(doc(db, COLLECTION, userId));
    if (!snap.exists()) return undefined;
    const data = snap.data() as Omit<UserProfile, "id">;
    return { id: snap.id, ...data };
  },

  async upsertProfile(profile: UserProfile): Promise<void> {
    const { id, ...data } = profile;
    await setDoc(doc(db, COLLECTION, id), data, { merge: true });
  },
};
