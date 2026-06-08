// User service — the only file that reads/writes the `users` Firestore collection.
// Hooks call these; views and components never import this directly.

import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { ProviderDetails, UserProfile, UserRole } from "@/types/user.interface";

// Coerce a possibly-partial provider profile (older / hand-edited docs) into a
// fully-formed ProviderDetails so the UI never reads an undefined field.
const normalizeProviderProfile = (raw: unknown): ProviderDetails | undefined => {
  if (!raw || typeof raw !== "object") return undefined;
  const p = raw as Partial<ProviderDetails>;
  return {
    bio: p.bio ?? "",
    isAvailable: p.isAvailable ?? true,
    specialties: Array.isArray(p.specialties) ? p.specialties : [],
    averageRating: p.averageRating ?? 0,
    totalEarnings: p.totalEarnings ?? 0,
    totalJobsCompleted: p.totalJobsCompleted ?? 0,
    yearsExperience: p.yearsExperience ?? 0,
  };
};

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
      // A provider doc with a partial providerProfile would otherwise crash the
      // profile screen (e.g. specialties missing → .map on undefined).
      providerProfile: normalizeProviderProfile(data.providerProfile),
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

  // Profile edits — identity/contact fields the user can change from their
  // profile screen.
  async updateContactInfo(
    userId: string,
    info: { firstName: string | null; lastName: string | null; phone: string | null },
  ): Promise<void> {
    await updateDoc(doc(db, "users", userId), { ...info, updatedAt: Date.now() });
  },

  async updatePhotoUrl(userId: string, photoUrl: string): Promise<void> {
    await updateDoc(doc(db, "users", userId), { photoUrl, updatedAt: Date.now() });
  },

  // Mechanic availability toggle. Dot-notation patches just the nested flag
  // without clobbering the rest of providerProfile.
  async setAvailability(userId: string, isAvailable: boolean): Promise<void> {
    await updateDoc(doc(db, "users", userId), {
      "providerProfile.isAvailable": isAvailable,
      updatedAt: Date.now(),
    });
  },

  // Customer search — used by the mechanic's custom-quote flow to find a
  // customer by name or phone. Firestore doesn't support full-text search so
  // this fetches the first 100 customers and filters client-side.
  // TODO(M10): swap for a proper search index (Algolia / Typesense) once the
  // user base grows beyond a few hundred customers.
  async searchCustomers(term: string): Promise<UserProfile[]> {
    const q = query(
      collection(db, "users"),
      where("role", "==", "customer"),
      where("hasCompletedOnboarding", "==", true),
      limit(100),
    );
    const snap = await getDocs(q);
    const lower = term.toLowerCase().trim();
    return snap.docs
      .map((d) => ({ ...(d.data() as UserProfile), id: d.id }))
      .filter((u) => {
        const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.toLowerCase();
        const phone = u.phone ?? "";
        return name.includes(lower) || phone.includes(lower);
      });
  },

  // Mechanic edits their About section (bio + specialties). Dot-notation patches
  // just these nested fields, leaving the rest of providerProfile intact.
  async updateMechanicAbout(
    userId: string,
    about: { bio: string; specialties: string[] },
  ): Promise<void> {
    await updateDoc(doc(db, "users", userId), {
      "providerProfile.bio": about.bio,
      "providerProfile.specialties": about.specialties,
      updatedAt: Date.now(),
    });
  },
};
