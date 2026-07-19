// useMechanics — live stream of every mechanic account for the admin/owner
// screen. Uses onSnapshot so availability/status changes made by mechanics or
// other admins appear without a manual refresh. Returns { data, isLoading, isError, refetch }.

import { useCallback } from "react";

import {
  useFirestoreSubscription,
  type FirestoreSubscribe,
} from "@/hooks/use-firestore-subscription";
import { userService } from "@/services/user-service";
import type { MechanicProfile } from "@/types/user.interface";

export const useMechanics = () => {
  const subscribe = useCallback<FirestoreSubscribe<MechanicProfile[]>>(
    (onData, onError) => userService.subscribeToMechanics(onData, onError),
    [],
  );

  return useFirestoreSubscription(subscribe, "mechanics");
};
