// Inspection service — the only file that reads/writes a repair order's
// inspection report (subcollection repair-orders/{orderId}/inspectionReport).

import { doc, getDoc, writeBatch } from "firebase/firestore";

import { db } from "./firebase";
import type { InspectionReport } from "@/types/inspection.interface";

const ORDERS = "repair-orders";

// One report per order for now ("initial"); a "final" report is a later add.
const reportRef = (orderId: string) => doc(db, ORDERS, orderId, "inspectionReport", "initial");

export const inspectionService = {
  async getInspection(orderId: string): Promise<InspectionReport | undefined> {
    const snap = await getDoc(reportRef(orderId));
    return snap.exists() ? (snap.data() as InspectionReport) : undefined;
  },

  // Save the report and stamp `inspectionCompletedAt` on the order in one batch
  // so they can't drift. That field gates the "Complete job" action.
  async saveInspection(
    orderId: string,
    report: Omit<InspectionReport, "updatedAt">,
  ): Promise<void> {
    const now = Date.now();
    const batch = writeBatch(db);
    batch.set(reportRef(orderId), { ...report, updatedAt: now });
    batch.update(doc(db, ORDERS, orderId), { inspectionCompletedAt: now, updatedAt: now });
    await batch.commit();
  },
};
