// useProposeQuote — mechanic submits the priced line-item quote, moving the
// order to QuoteProposed and opening the customer's approval window.

import { useMutation } from "@tanstack/react-query";

import { orderService } from "@/services/order-service";
import type { OrderItem } from "@/types/order.interface";

type ProposeQuoteInput = {
  orderId: string;
  items: OrderItem[];
  laborCost: number;
  partsCost: number;
  totalPrice: number;
  scheduledAt: number;
};

// No cache invalidation: the order detail and provider Queue are live
// (onSnapshot), so the proposed quote propagates to every listener on its own.
export const useProposeQuote = () => {
  return useMutation({
    mutationFn: ({ orderId, items, laborCost, partsCost, totalPrice, scheduledAt }: ProposeQuoteInput) =>
      orderService.proposeQuote(orderId, { items, laborCost, partsCost, totalPrice, scheduledAt }),
  });
};
