import { useMutation, type UseMutationResult } from "@tanstack/react-query";

import { paymentService, type CreateStripePaymentIntentResult } from "@/services/payment-service";

export const useCreatePaymentIntent = (): UseMutationResult<
  CreateStripePaymentIntentResult,
  Error,
  string // orderId
> =>
  useMutation({
    mutationFn: (orderId: string) => paymentService.createStripePaymentIntent(orderId),
  });
