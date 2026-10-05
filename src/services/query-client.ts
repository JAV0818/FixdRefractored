// Single React Query QueryClient for the app. Tune defaults here.

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Conservative defaults — re-fetch on focus is annoying on mobile.
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
      // GC inactive queries after 30s (default is 5min). On mobile, stale cache
      // from visited screens (order details, conversations, mechanic profiles)
      // accumulates and contributes to OS memory-pressure kills.
      gcTime: 30_000,
    },
    mutations: {
      retry: 0,
    },
  },
});
