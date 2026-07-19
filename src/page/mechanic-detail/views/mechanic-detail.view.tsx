// Switch view for the mechanic detail screen. Reads the mechanicId from the
// route, fetches the mechanic, and delegates to loading / error / success.

import { useLocalSearchParams } from "expo-router";

import { useMechanic } from "../hooks/use-mechanic";
import { MechanicDetailErrorView } from "./mechanic-detail-error.view";
import { MechanicDetailLoadingView } from "./mechanic-detail-loading.view";
import { MechanicDetailSuccessView } from "./mechanic-detail-success.view";

export const MechanicDetailView = () => {
  const { mechanicId } = useLocalSearchParams<{ mechanicId: string }>();
  const { data, isLoading, isError, refetch } = useMechanic(mechanicId);

  if (isLoading) return <MechanicDetailLoadingView />;
  if (isError || !data) return <MechanicDetailErrorView onRetry={refetch} />;
  return <MechanicDetailSuccessView mechanic={data} />;
};
