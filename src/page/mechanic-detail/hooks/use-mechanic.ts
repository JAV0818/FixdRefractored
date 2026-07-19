// useMechanic — live stream of a single mechanic profile for the admin/owner
// detail screen. Returns undefined while the providerId is unavailable.
// Returns { data, isLoading, isError, refetch }.

import { useCallback } from "react";

import {
  useFirestoreSubscription,
  type FirestoreSubscribe,
} from "@/hooks/use-firestore-subscription";
import { userService } from "@/services/user-service";
import type { MechanicProfile } from "@/types/user.interface";

export const useMechanic = (providerId: string | undefined) => {
  const subscribe = useCallback<FirestoreSubscribe<MechanicProfile | undefined>>(
    (onData, onError) => {
      if (!providerId) return;
      return userService.subscribeToMechanic(providerId, onData, onError);
    },
    [providerId],
  );

  return useFirestoreSubscription(subscribe, "mechanic");
};
