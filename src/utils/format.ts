// Small shared formatting helpers. Pure functions — no React.

// Prices are plain dollar numbers (not cents) across the order model.
export const formatCurrency = (amount: number): string => `$${amount.toFixed(2)}`;

export const formatDate = (ms: number): string =>
  new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatDateTime = (ms: number): string =>
  new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
