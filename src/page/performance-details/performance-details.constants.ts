// Copy for the mechanic performance-details screen.

export const PERFORMANCE_COPY = {
  title: "Performance",
  loading: "Loading your stats…",
  error: "We couldn't load your performance data.",
  retry: "Try again",

  // Summary card
  summaryTitle: "All-time stats",
  totalJobs: "Jobs completed",
  avgRating: "Avg. rating",
  totalEarnings: "Total earnings",

  // Monthly table (stub until M10 Cloud Functions populate analytics)
  monthlyTitle: "Monthly earnings",
  monthlyComingSoon: "Monthly breakdowns will appear here once your first jobs are completed.",

  // Recent orders
  recentTitle: "Recent completed jobs",
  noCompletedJobs: "You haven't completed any jobs yet.",
  earned: (amount: string) => `Earned ${amount}`,
} as const;
