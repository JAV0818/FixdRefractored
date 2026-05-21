// Cross-cutting user type used by the AuthProvider.

export type AuthUser = {
  id: string;
  email?: string;
  displayName?: string;
};
