// useOrderInspection — the order's saved inspection report, for showing the
// mechanic's photos on the order detail. Same query key as the inspection
// screen's own hook, so saving an inspection refreshes this too.

import { useQuery } from "@tanstack/react-query";

import { inspectionService } from "@/services/inspection-service";
import type { InspectionReport } from "@/types/inspection.interface";

export const useOrderInspection = (orderId: string | undefined) =>
  useQuery({
    queryKey: ["inspection", orderId],
    queryFn: async (): Promise<InspectionReport | null> => {
      const report = await inspectionService.getInspection(orderId!);
      return report ?? null;
    },
    enabled: !!orderId,
  });
