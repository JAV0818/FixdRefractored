// useApproveQuote — customer approves the proposed quote. Opens the Stripe
// PaymentSheet to place a $20 authorization hold, verifies it server-side,
// then transitions the order to Scheduled. The hold is captured later when the
// mechanic starts the job (startOrderAndCapture).

import { useMutation } from "@tanstack/react-query";

import { paymentService } from "@/services/payment-service";

// No cache invalidation: the order detail and customer Requests list are live
// (onSnapshot), so the approval propagates to every listener on its own.
export const useApproveQuote = () => {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { clientSecret } = await paymentService.createStripePaymentIntent(orderId);
      const { cancelled } = await paymentService.openPaymentSheet(clientSecret);
      if (cancelled) return;
      await paymentService.verifyDepositHold(orderId);
      await paymentService.captureDepositAndApproveQuote(orderId);
    },
  });
};
