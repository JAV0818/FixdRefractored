// User service — the only file that reads/writes the `users` Firestore collection.
// Hooks call these; views and components never import this directly.

import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { UserProfile, UserRole } from "@/types/user.interface";

type Vehicle = {
  make: string;
  model: string;
  year: string;
  color?: string;
  licensePlate?: string;
};

type MechanicProfileData = {
  bio: string;
  specialties: string[];
  yearsExperience: number;
};

export const userService = {
  async getProfile(userId: string): Promise<UserProfile | undefined> {
    const ref = doc(db, "users", userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return undefined;
    const data = snap.data();
    // Default the aggregates so docs created before these fields read safely.
    return {
      ...(data as UserProfile),
      id: snap.id,
      completedOrdersCount: data.completedOrdersCount ?? 0,
      averageRating: data.averageRating ?? null,
      totalRatingsCount: data.totalRatingsCount ?? 0,
    };
  },

  async upsertProfile(profile: UserProfile): Promise<void> {
    const ref = doc(db, "users", profile.id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { ...profile, updatedAt: Date.now() });
    } else {
      await setDoc(ref, { ...profile, updatedAt: Date.now() });
    }
  },

  async saveVehicle(userId: string, vehicle: Vehicle): Promise<void> {
    const ref = doc(db, "users", userId);
    // arrayUnion appends atomically server-side — no read-modify-write, so two
    // concurrent saves can't clobber each other (lost-update race).
    await updateDoc(ref, {
      vehicles: arrayUnion(vehicle),
      updatedAt: Date.now(),
    });
  },

  async saveMechanicProfile(userId: string, profile: MechanicProfileData): Promise<void> {
    const ref = doc(db, "users", userId);
    await updateDoc(ref, {
      providerProfile: {
        ...profile,
        isAvailable: true,
        averageRating: 0,
        totalJobsCompleted: 0,
        totalEarnings: 0,
      },
      updatedAt: Date.now(),
    });
  },

  async completeOnboarding(userId: string, role: UserRole): Promise<void> {
    const ref = doc(db, "users", userId);
    await updateDoc(ref, {
      role,
      hasCompletedOnboarding: true,
      updatedAt: Date.now(),
    });
  },
};
