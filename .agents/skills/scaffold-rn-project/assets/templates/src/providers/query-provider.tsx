// QueryProvider — wraps the app in a React Query QueryClientProvider.
//
// One client per app instance. The defaults (staleTime, retries, etc.) live
// in src/services/query-client.ts so you can tune them in one place.

import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { queryClient } from "@/services/query-client";

type QueryProviderProps = {
  children: ReactNode;
};

export const QueryProvider = ({ children }: QueryProviderProps) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
