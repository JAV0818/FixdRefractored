// Copy and labels for the owner Earnings dashboard.

export const ADMIN_EARNINGS_COPY = {
  title: "Earnings",
  loading: "Loading earnings…",
  error: "We couldn't load today's earnings.",
  retry: "Try again",

  emptyTitle: "No earnings data yet",
  emptyBody:
    "Analytics will appear here once automated reporting is enabled. Check back after the nightly Cloud Function run.",

  platformFeesLabel: "Platform fees",
  completedOrdersLabel: "Completed orders",
  totalRevenueLabel: "Total revenue",
  mechanicsTitle: "Per-mechanic earnings",
  mechanicPlaceholder: "No mechanic earnings to report yet.",
} as const;
