// Switch for the owner Earnings dashboard. Consumes today's daily analytics.

import { useDailyAnalytics } from "../hooks/use-analytics";
import { AdminEarningsErrorView } from "./admin-earnings-error.view";
import { AdminEarningsLoadingView } from "./admin-earnings-loading.view";
import { AdminEarningsSuccessView } from "./admin-earnings-success.view";

const todayDate = () => new Date().toISOString().split("T")[0];

export const AdminEarningsView = () => {
  const { data, isLoading, isError, refetch } = useDailyAnalytics(todayDate());

  if (isLoading) return <AdminEarningsLoadingView />;
  if (isError) return <AdminEarningsErrorView onRetry={refetch} />;
  return <AdminEarningsSuccessView analytics={data} />;
};
