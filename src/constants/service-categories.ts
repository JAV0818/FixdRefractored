// App-wide service categories. Shared by the customer Services home (cards),
// the quote-request flow (Step 1 category select), and the M5 marketplace
// filter. Lives in src/constants/ rather than a feature folder because it's
// cross-feature. `label` is the canonical string stored on an order's
// `categories[]` (see order.interface.ts) and a mechanic's `specialties[]`.

import { Ionicons } from "@expo/vector-icons";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export type ServiceCategoryGroup = "maintenance" | "emergency";

export type ServiceCategory = {
  id: string;
  label: string;
  icon: IoniconName;
  group: ServiceCategoryGroup;
};

export const SERVICE_CATEGORIES: readonly ServiceCategory[] = [
  { id: "oil-change", label: "Oil Change", icon: "water-outline", group: "maintenance" },
  { id: "brakes", label: "Brake Service", icon: "disc-outline", group: "maintenance" },
  { id: "tires", label: "Tire Service", icon: "ellipse-outline", group: "maintenance" },
  { id: "battery", label: "Battery", icon: "battery-charging-outline", group: "maintenance" },
  { id: "ac-heating", label: "AC & Heating", icon: "snow-outline", group: "maintenance" },
  { id: "inspection", label: "Inspection", icon: "clipboard-outline", group: "maintenance" },
  { id: "diagnostics", label: "Diagnostics", icon: "pulse-outline", group: "emergency" },
  { id: "engine", label: "Engine", icon: "cog-outline", group: "emergency" },
  { id: "electrical", label: "Electrical", icon: "flash-outline", group: "emergency" },
  { id: "other", label: "Other", icon: "construct-outline", group: "emergency" },
] as const;

export const categoriesByGroup = (group: ServiceCategoryGroup): ServiceCategory[] =>
  SERVICE_CATEGORIES.filter((category) => category.group === group);

// The canonical label set, handy as preset options for selecting a mechanic's
// specialties (which share this taxonomy with order categories).
export const SERVICE_CATEGORY_LABELS: readonly string[] = SERVICE_CATEGORIES.map(
  (category) => category.label,
);
