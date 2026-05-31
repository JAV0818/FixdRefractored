// useInspection — load the order's saved inspection report (if any) so the form
// reopens with what was already entered.

import { useQuery } from "@tanstack/react-query";

import { inspectionService } from "@/services/inspection-service";
import type { InspectionReport } from "@/types/inspection.interface";

export const useInspection = (orderId: string | undefined) =>
  useQuery({
    queryKey: ["inspection", orderId],
    queryFn: async (): Promise<InspectionReport | null> => {
      const report = await inspectionService.getInspection(orderId!);
      return report ?? null;
    },
    enabled: !!orderId,
  });
