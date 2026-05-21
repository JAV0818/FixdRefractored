// Cross-cutting user types used by AuthProvider and throughout the app.

export type UserRole = "customer" | "provider" | "owner";

export type AuthUser = {
  id: string;
  email?: string;
  displayName?: string;
};

export type UserProfile = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  photoUrl: string | null;
  role: UserRole | null;
  isActive: boolean;
  hasCompletedOnboarding: boolean;
  createdAt: number;
  updatedAt: number;
};
