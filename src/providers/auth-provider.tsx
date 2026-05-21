// AuthProvider — app-wide context that exposes the current user, their role,
// and whether they've completed onboarding.
//
// isHydrated only becomes true after BOTH:
//   1. Firebase onAuthStateChanged fires
//   2. The Firestore user doc is read (to get role + hasCompletedOnboarding)
// This prevents the auth gate from redirecting before we know the user's role.

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/services/firebase";
import { userService } from "@/services/user-service";
import type { AuthUser, UserRole } from "@/types/user.interface";

type AuthContextValue = {
  currentUser: AuthUser | undefined;
  role: UserRole | undefined;
  hasCompletedOnboarding: boolean;
  isHydrated: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | undefined>(undefined);
  const [role, setRole] = useState<UserRole | undefined>(undefined);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser({
          id: firebaseUser.uid,
          email: firebaseUser.email ?? "",
          displayName: firebaseUser.displayName ?? undefined,
        });

        // Read Firestore doc to get role + onboarding status
        try {
          const profile = await userService.getProfile(firebaseUser.uid);
          setRole((profile?.role as UserRole) ?? undefined);
          setHasCompletedOnboarding(profile?.hasCompletedOnboarding ?? false);
        } catch (err) {
          console.warn("[AuthProvider] Could not read user profile:", err);
          setRole(undefined);
          setHasCompletedOnboarding(false);
        }
      } else {
        setCurrentUser(undefined);
        setRole(undefined);
        setHasCompletedOnboarding(false);
      }

      setIsHydrated(true);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ currentUser, role, hasCompletedOnboarding, isHydrated }),
    [currentUser, role, hasCompletedOnboarding, isHydrated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  }
  return ctx;
};
