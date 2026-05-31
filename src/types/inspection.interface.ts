// The mechanic's vehicle inspection (DVI) report, stored at
// repair-orders/{orderId}/inspectionReport/initial. The checklist structure
// (sections + item labels) lives in the inspection-checklist feature's
// constants; this is just the saved result.

export type InspectionRating = "green" | "yellow" | "red";

export type InspectionItemResult = {
  rating: InspectionRating | null;
  note: string;
};

export type InspectionReport = {
  // Keyed by checklist item key (see INSPECTION_SECTIONS).
  ratings: Record<string, InspectionItemResult>;
  summaryNotes: string;
  photoUrls: string[];
  updatedAt: number;
};
