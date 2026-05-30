// useProposeQuote — mechanic submits the priced line-item quote, moving the
// order to QuoteProposed and opening the customer's approval window.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orderService } from "@/services/order-service";
import type { OrderItem } from "@/types/order.interface";

type ProposeQuoteInput = {
  orderId: string;
  items: OrderItem[];
  laborCost: number;
  partsCost: number;
  totalPrice: number;
};

export const useProposeQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, items, laborCost, partsCost, totalPrice }: ProposeQuoteInput) =>
      orderService.proposeQuote(orderId, { items, laborCost, partsCost, totalPrice }),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["provider-orders"] });
    },
  });
};
