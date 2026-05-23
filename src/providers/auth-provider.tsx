// AuthProvider — exposes current user, role, onboarding status,
// and completeOnboarding() / resetOnboarding() for the onboarding flow.

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
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
  completeOnboarding: (role: UserRole) => void;
  resetOnboarding: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | undefined>(undefined);
  const [role, setRole] = useState<UserRole | undefined>(undefined);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser({
          id: user.uid,
          email: user.email ?? "",
          displayName: user.displayName ?? undefined,
        });

        // Read Firestore profile to get role + onboarding status
        try {
          const profile = await userService.getProfile(user.uid);
          if (profile) {
            setRole(profile.role ?? undefined);
            setHasCompletedOnboarding(profile.hasCompletedOnboarding ?? false);
          }
        } catch (e) {
          // Profile not yet created (e.g. right after sign up) — onboarding not complete
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

  // Updates local state immediately + writes to Firestore in the background
  const completeOnboarding = useCallback((selectedRole: UserRole) => {
    setRole(selectedRole);
    setHasCompletedOnboarding(true);
    if (currentUser) {
      userService.completeOnboarding(currentUser.id, selectedRole).catch(console.error);
    }
  }, [currentUser]);

  const resetOnboarding = useCallback(() => {
    setRole(undefined);
    setHasCompletedOnboarding(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ currentUser, role, hasCompletedOnboarding, isHydrated, completeOnboarding, resetOnboarding }),
    [currentUser, role, hasCompletedOnboarding, isHydrated, completeOnboarding, resetOnboarding],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
};
