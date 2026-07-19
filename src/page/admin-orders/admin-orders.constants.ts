import type { OrderStatus } from "@/types/order.interface";

export const ADMIN_ORDERS_COPY = {
  title: "All Orders",
  loading: "Loading orders…",
  error: "We couldn't load orders.",
  retry: "Try again",
  emptyTitle: "No orders found",
  emptyBody: "There are no orders matching the selected filter.",
  filterAll: "All",
} as const;

export const STATUS_FILTER_LABELS: Record<OrderStatus, string> = {
  Pending: "Pending",
  Accepted: "Accepted",
  QuoteProposed: "Quote ready",
  Scheduled: "Scheduled",
  InProgress: "In progress",
  Completed: "Completed",
  Expired: "Expired",
  Cancelled: "Cancelled",
};

const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Accepted",
  "QuoteProposed",
  "Scheduled",
  "InProgress",
  "Completed",
  "Expired",
  "Cancelled",
];

export const FILTER_OPTIONS: { value: "all" | OrderStatus; label: string }[] = [
  { value: "all", label: ADMIN_ORDERS_COPY.filterAll },
  ...ORDER_STATUSES.map((status) => ({
    value: status,
    label: STATUS_FILTER_LABELS[status],
  })),
];
