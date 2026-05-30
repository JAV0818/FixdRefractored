export const QUOTE_BUILDER_COPY = {
  title: "Build quote",
  loading: "Loading order…",
  notFound: "This order no longer exists.",
  hint: "Add the work and pricing. The customer reviews this before any work begins.",
  addItem: "Add line item",
  itemNamePlaceholder: "Item or service",
  pricePlaceholder: "Price",
  qtyPlaceholder: "Qty",
  laborLabel: "Labor cost (optional)",
  partsLabel: "Parts cost (optional)",
  total: "Total",
  payoutNote: (earnings: string, fee: string) =>
    `You'll receive ${earnings} after the ${fee} platform fee.`,
  submit: "Send quote to customer",
  submitting: "Sending…",
  submitError: "We couldn't send the quote. Please try again.",
} as const;
