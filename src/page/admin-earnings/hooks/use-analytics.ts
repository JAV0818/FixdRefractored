// useDailyAnalytics — live read of the daily analytics document for a given
// YYYY-MM-DD date. Returns { data, isLoading, isError, refetch }.
//
// TODO(M10): the exact Firestore path for daily analytics is still being
// finalized. The current implementation uses `analytics/{date}`; update once
// Cloud Functions commit to a subcollection structure.

import { useCallback } from "react";

import { analyticsService } from "@/services/analytics-service";
import {
  useFirestoreSubscription,
  type FirestoreSubscribe,
} from "@/hooks/use-firestore-subscription";

import type { DailyAnalytics } from "../interfaces/analytics.interface";

export type { DailyAnalytics, MechanicAnalytics } from "../interfaces/analytics.interface";

export const useDailyAnalytics = (date: string) => {
  const subscribe = useCallback<FirestoreSubscribe<DailyAnalytics | undefined>>(
    (onData, onError) =>
      analyticsService.subscribeToDailyAnalytics(date, onData, onError),
    [date],
  );

  return useFirestoreSubscription(subscribe, "daily-analytics");
};
