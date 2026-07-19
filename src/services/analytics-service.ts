// Analytics service — the only file that reads the `analytics` Firestore
// collection. Hooks call these; views and components never import this directly.

import { doc, onSnapshot, type Unsubscribe } from "firebase/firestore";

import { db } from "./firebase";
import type { DailyAnalytics } from "@/page/admin-earnings/interfaces/analytics.interface";

const ANALYTICS_COLLECTION = "analytics";

export const analyticsService = {
  /**
   * Subscribe to the daily analytics document for a given YYYY-MM-DD date.
   * Returns an Unsubscribe function to tear down the listener.
   */
  subscribeToDailyAnalytics(
    date: string,
    onData: (data: DailyAnalytics | undefined) => void,
    onError: (error: Error) => void,
  ): Unsubscribe {
    return onSnapshot(
      doc(db, ANALYTICS_COLLECTION, date),
      (snap) => onData(snap.exists() ? (snap.data() as DailyAnalytics) : undefined),
      onError,
    );
  },
};
