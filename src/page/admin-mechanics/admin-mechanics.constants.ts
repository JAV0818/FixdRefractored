export const ADMIN_MECHANICS_COPY = {
  title: "Mechanics",
  loading: "Loading mechanics…",
  error: "We couldn't load the mechanics list.",
  retry: "Try again",
  emptyTitle: "No mechanics yet",
  emptyBody: "Mechanic accounts will appear here once they complete onboarding.",
  available: "Available",
  unavailable: "Unavailable",
  jobsCompleted: (count: number) => `${count} jobs completed`,
} as const;
