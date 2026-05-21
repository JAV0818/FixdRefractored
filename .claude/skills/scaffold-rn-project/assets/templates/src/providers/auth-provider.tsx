// AuthProvider — app-wide Context that exposes the currently-signed-in user.
//
// Subscribes to Firebase auth state once on mount. Components and views that
// need "who's signed in?" call useAuthContext() — they never read from
// Firebase directly.
//
// This is the canonical example of Context-first client state in this
// codebase. See guidelines/state.md for the priority order.

import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { auth } from "@/services/firebase";
import type { AuthUser } from "@/types/user.interface";

type AuthContextValue = {
  currentUser: AuthUser | undefined;
  isHydrated: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | undefined>(undefined);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(
        user
          ? {
              id: user.uid,
              email: user.email ?? undefined,
              displayName: user.displayName ?? undefined,
            }
          : undefined,
      );
      setIsHydrated(true);
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ currentUser, isHydrated }),
    [currentUser, isHydrated],
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
