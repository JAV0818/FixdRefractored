// useStartOrder — mechanic starts a Scheduled job. Captures the authorized $20
// Stripe hold and moves the order to InProgress atomically via Cloud Function.

import { useMutation } from "@tanstack/react-query";

import { paymentService } from "@/services/payment-service";

// No cache invalidation: the order detail and provider Queue are live
// (onSnapshot), so the status change propagates to every listener on its own.
export const useStartOrder = () => {
  return useMutation({
    mutationFn: (orderId: string) => paymentService.startOrderAndCapture(orderId),
  });
};
