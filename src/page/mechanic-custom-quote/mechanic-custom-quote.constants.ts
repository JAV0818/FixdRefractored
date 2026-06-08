import { SERVICE_CATEGORY_LABELS } from "@/constants/service-categories";

export const MECHANIC_CUSTOM_QUOTE_COPY = {
  title: "Custom quote",
  // Step 0 — customer search
  searchTitle: "Find a customer",
  searchSubtitle: "Search by name or phone number.",
  searchPlaceholder: "Name or phone…",
  searching: "Searching…",
  noResults: "No customers found. Double-check the name or phone number.",
  searchPrompt: "Type at least 2 characters to search.",
  // Step 1 — quote details
  quoteTitle: "Build the quote",
  quoteSubtitle: "Add the work details and pricing for the customer to review.",
  changeCustomer: "Change customer",
  vehicleLabel: "Vehicle",
  vehiclePlaceholder: "e.g. 2019 Toyota Camry",
  descriptionLabel: "Work description",
  descriptionPlaceholder: "Describe the service or repair…",
  categoriesLabel: "Categories",
  lineItemsLabel: "Pricing",
  addItem: "Add line item",
  itemNamePlaceholder: "Item or service",
  pricePlaceholder: "Price",
  qtyPlaceholder: "Qty",
  scheduledLabel: "Proposed appointment time",
  earnings: "Your earnings",
  platformFee: "Platform fee",
  customerTotal: "Customer pays",
  submit: "Send quote",
  submitting: "Sending…",
  submitError: "We couldn't send the quote. Please try again.",
  // Navigation
  back: "Back",
  next: "Next",
} as const;

export const CUSTOM_QUOTE_CATEGORIES = SERVICE_CATEGORY_LABELS as unknown as string[];
