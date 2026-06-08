export const PROVIDER_MARKETPLACE_COPY = {
  title: "Marketplace",
  customQuote: "Custom quote",
  loading: "Loading available jobs…",
  error: "We couldn't load the marketplace.",
  retry: "Try again",
  emptyTitle: "No jobs available",
  emptyBody: "New customer requests show up here. Check back soon.",
  loadMore: "Load more",
} as const;

// Marketplace lists reveal this many at a time; the "load more" control only
// appears once there are more than this in the pool (invisible below it).
export const MARKETPLACE_PAGE_SIZE = 10;
