// Cross-cutting user types used by AuthProvider and throughout the app.

export type UserRole = "customer" | "provider" | "owner";

export type AuthUser = {
  displayName?: string;
  email?: string;
  id: string;
};

// A customer's saved vehicle (collected during onboarding / vehicle management).
export type Vehicle = {
  color?: string;
  licensePlate?: string;
  make: string;
  model: string;
  year: string;
};

// Mechanic-only profile data, set during the provider onboarding path.
// averageRating / totalJobsCompleted / totalEarnings are maintained by Cloud
// Functions (M10); they default to 0 when the profile is first created.
export type ProviderDetails = {
  averageRating: number; // rating the mechanic has received from customers (1–5)
  bio: string;
  certifications?: string[];
  isAvailable: boolean;
  serviceRadius?: number;
  specialties: string[];
  totalEarnings: number;
  totalJobsCompleted: number;
  yearsExperience: number;
};

// Admin-facing mechanic summary. Derived from the `users` collection where
// `role === "provider"`.
export type MechanicProfile = {
  email: string;
  isActive: boolean;
  name: string;
  providerProfile: ProviderDetails;
  uid: string;
};

export type UserProfile = {
  // Identity & contact
  email: string;
  firstName: string | null;
  id: string;
  lastName: string | null;
  phone: string | null;
  photoUrl: string | null;

  // Role & status
  hasCompletedOnboarding: boolean;
  isActive: boolean;
  role: UserRole | null;

  // Customer aggregates — maintained by Cloud Functions (M10); default 0 / null at signup.
  averageRating: number | null; // rating the customer has received from mechanics (1–5)
  completedOrdersCount: number; // orders the customer has completed
  totalRatingsCount: number;

  // Role-specific data. Exactly one is populated once onboarding sets `role`:
  //   • customer → `vehicles`
  //   • provider → `providerProfile`
  providerProfile?: ProviderDetails;
  vehicles?: Vehicle[];

  // Timestamps
  createdAt: number;
  updatedAt: number;
};
