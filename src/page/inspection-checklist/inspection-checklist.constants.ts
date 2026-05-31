// Curated Digital Vehicle Inspection (DVI). Config-driven so expanding toward
// the full ~50-item checklist later is just adding entries here (see DEFERRED.md).

export const INSPECTION_SECTIONS = [
  {
    key: "brakes_tires",
    title: "Brakes & Tires",
    items: [
      { key: "brake_pads", label: "Brake pads" },
      { key: "tire_tread", label: "Tire tread depth" },
      { key: "tire_pressure", label: "Tire pressure" },
      { key: "tire_wear", label: "Tire wear pattern" },
    ],
  },
  {
    key: "fluids",
    title: "Fluids",
    items: [
      { key: "engine_oil", label: "Engine oil" },
      { key: "brake_fluid", label: "Brake fluid" },
      { key: "coolant", label: "Coolant" },
      { key: "transmission_fluid", label: "Transmission fluid" },
      { key: "power_steering", label: "Power steering" },
    ],
  },
  {
    key: "under_hood",
    title: "Under hood",
    items: [
      { key: "battery", label: "Battery" },
      { key: "drive_belts", label: "Drive belts" },
      { key: "air_filter", label: "Air filter" },
    ],
  },
  {
    key: "lights_functional",
    title: "Lights & functional",
    items: [
      { key: "exterior_lights", label: "Exterior lights" },
      { key: "turn_signals", label: "Turn signals" },
      { key: "wipers_washers", label: "Wipers & washers" },
      { key: "horn", label: "Horn" },
    ],
  },
] as const;

export const MAX_INSPECTION_PHOTOS = 8;

export const INSPECTION_COPY = {
  title: "Vehicle inspection",
  loading: "Loading…",
  notFound: "This order no longer exists.",
  hint: "Rate each item green / yellow / red, add notes where needed, then save.",
  notePlaceholder: "Note (optional)",
  summaryLabel: "Overall summary notes",
  photos: "Photos",
  save: "Save inspection",
  saving: "Saving…",
  saveError: "We couldn't save the inspection. Please try again.",
} as const;
