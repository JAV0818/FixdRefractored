// useApproveQuote — customer approves the proposed quote, booking the agreed
// time. The $20 deposit capture happens server-side (payment Cloud Function)
// once wired; this drives the order into Scheduled in the meantime.

import { useMutation } from "@tanstack/react-query";

import { orderService } from "@/services/order-service";

// No cache invalidation: the order detail and customer Requests list are live
// (onSnapshot), so the approval propagates to every listener on its own.
export const useApproveQuote = () => {
  return useMutation({
    mutationFn: (orderId: string) => orderService.approveQuote(orderId),
  });
};
