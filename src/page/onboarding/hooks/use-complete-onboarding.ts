import { useAuthContext } from "@/providers/auth-provider";

// Thin wrapper so onboarding screens import from their own hooks/ folder
// rather than reaching directly into providers/.
export const useCompleteOnboarding = () => {
  const { completeOnboarding } = useAuthContext();
  return { completeOnboarding };
};
