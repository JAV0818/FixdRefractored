import { useMechanics } from "../hooks/use-mechanics";
import { AdminMechanicsErrorView } from "./admin-mechanics-error.view";
import { AdminMechanicsLoadingView } from "./admin-mechanics-loading.view";
import { AdminMechanicsSuccessView } from "./admin-mechanics-success.view";

export const AdminMechanicsView = () => {
  const { data, isLoading, isError, refetch } = useMechanics();

  if (isLoading) return <AdminMechanicsLoadingView />;
  if (isError) return <AdminMechanicsErrorView onRetry={refetch} />;
  return <AdminMechanicsSuccessView mechanics={data ?? []} />;
};
