import { useQuery } from "@tanstack/react-query";

import { userService } from "@/services/user-service";

export const useSearchCustomers = (term: string) =>
  useQuery({
    queryKey: ["customer-search", term],
    queryFn: () => userService.searchCustomers(term),
    enabled: term.trim().length >= 2,
    staleTime: 30_000,
  });
