import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orderService } from "@/services/order-service";
import type { CreateCustomQuoteInput } from "@/types/order.interface";

export const useCreateCustomQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCustomQuoteInput) => orderService.createCustomQuote(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-orders"] });
    },
  });
};
