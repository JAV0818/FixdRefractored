// User service — the only file that reads/writes the `users` Firestore collection.

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { UserProfile, UserRole } from "@/types/user.interface";

type Vehicle = {
  make: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
};

type ProviderProfile = {
  bio: string;
  specialties: string[];
  yearsExperience: number;
};

export const userService = {
  async getProfile(userId: string): Promise<UserProfile | undefined> {
    const ref = doc(db, "users", userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return undefined;
    return { id: snap.id, ...snap.data() } as UserProfile;
  },

  async upsertProfile(profile: Partial<UserProfile> & { id: string }): Promise<void> {
    const ref = doc(db, "users", profile.id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { ...profile, updatedAt: Date.now() });
    } else {
      await setDoc(ref, {
        ...profile,
        role: null,
        isActive: true,
        hasCompletedOnboarding: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },

  async saveVehicle(userId: string, vehicle: Vehicle): Promise<void> {
    const ref = doc(db, "users", userId);
    const snap = await getDoc(ref);
    const existing = snap.exists() ? (snap.data().vehicles ?? []) : [];
    await updateDoc(ref, {
      vehicles: [...existing, vehicle],
      updatedAt: Date.now(),
    });
  },

  async saveMechanicProfile(userId: string, providerProfile: ProviderProfile): Promise<void> {
    const ref = doc(db, "users", userId);
    await updateDoc(ref, {
      providerProfile: {
        ...providerProfile,
        isAvailable: true,
        averageRating: 0,
        totalJobsCompleted: 0,
        totalEarnings: 0,
      },
      updatedAt: Date.now(),
    });
  },

  async completeOnboarding(userId: string, role: UserRole, fcmToken?: string): Promise<void> {
    const ref = doc(db, "users", userId);
    await updateDoc(ref, {
      role,
      hasCompletedOnboarding: true,
      ...(fcmToken ? { fcmToken } : {}),
      updatedAt: Date.now(),
    });
  },
};
