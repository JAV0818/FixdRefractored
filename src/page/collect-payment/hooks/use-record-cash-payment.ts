import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";

import { paymentService } from "@/services/payment-service";

type RecordCashPaymentInput = { orderId: string; amount: number };

export const useRecordCashPayment = (): UseMutationResult<
  void,
  Error,
  RecordCashPaymentInput
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, amount }: RecordCashPaymentInput) =>
      paymentService.recordCashPayment(orderId, amount),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["provider-orders"] });
    },
  });
};
