// Pure formatting helpers for the profile screen. No React.

import type { UserProfile } from "@/types/user.interface";

import { NEW_CUSTOMER_LABEL, NEW_MECHANIC_LABEL } from "../profile.constants";

// Full name, falling back to the email's local part, then a generic label.
export const displayNameOf = (profile: UserProfile): string => {
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
  if (name) return name;
  return profile.email?.split("@")[0] ?? "You";
};

export const formatRating = (rating: number | null): string =>
  rating && rating > 0 ? rating.toFixed(1) : "—";

export const formatMoney = (amount: number): string => `$${Math.round(amount).toLocaleString()}`;

// Header subtitle: a "★ 4.8 · 23 jobs" style line once there's activity, else a
// role label. Mechanics count jobs; customers count completed orders.
export const profileSubtitle = (profile: UserProfile): string => {
  if (profile.role === "provider") {
    const p = profile.providerProfile;
    const jobs = p?.totalJobsCompleted ?? 0;
    if (p && p.averageRating > 0) return `★ ${p.averageRating.toFixed(1)} · ${jobs} jobs`;
    return NEW_MECHANIC_LABEL;
  }
  const orders = profile.completedOrdersCount;
  if (profile.averageRating && profile.averageRating > 0) {
    return `★ ${profile.averageRating.toFixed(1)} · ${orders} orders`;
  }
  return NEW_CUSTOMER_LABEL;
};
