export type MechanicAnalytics = {
  completed: number;
  earnings: number;
};

export type DailyAnalytics = {
  cancelledOrders: number;
  completedOrders: number;
  ordersByCategory: Record<string, number>;
  ordersByMechanic: Record<string, MechanicAnalytics>;
  platformFees: number;
  totalOrders: number;
  totalRevenue: number;
};
