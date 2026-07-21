import { useMutation, type UseMutationResult } from "@tanstack/react-query";

import { paymentService, type ConfirmStripePaymentResult } from "@/services/payment-service";

export const useConfirmPayment = (): UseMutationResult<
  ConfirmStripePaymentResult,
  Error,
  string // clientSecret
> =>
  useMutation({
    mutationFn: (clientSecret: string) => paymentService.confirmStripePayment(clientSecret),
  });
