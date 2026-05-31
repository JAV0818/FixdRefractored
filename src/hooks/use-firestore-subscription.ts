// useFirestoreSubscription — the shared engine behind every live (onSnapshot)
// list/document hook. Owns the loading/error/retry state machine and the
// listener lifecycle so the feature hooks stay a one-liner.
//
// The caller passes a `subscribe` function (memoize it with useCallback so the
// listener isn't torn down and re-attached every render). It receives the
// onData/onError callbacks and returns the Firestore Unsubscribe — or returns
// nothing to opt out of subscribing (e.g. a required id isn't available yet),
// in which case the hook simply reports "not loading" with no data.

import { useCallback, useEffect, useState } from "react";
import type { Unsubscribe } from "firebase/firestore";

export type FirestoreSubscribe<T> = (
  onData: (value: T) => void,
  onError: (error: Error) => void,
) => Unsubscribe | void;

export const useFirestoreSubscription = <T>(
  subscribe: FirestoreSubscribe<T>,
  label: string,
) => {
  const [data, setData] = useState<T>();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Re-attach the listener (used by the error views' retry).
  const refetch = useCallback(() => setAttempt((a) => a + 1), []);

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    const unsubscribe = subscribe(
      (value) => {
        setData(value);
        setIsLoading(false);
        setIsError(false);
      },
      (error) => {
        console.error(`[${label}] subscription failed:`, error);
        setIsError(true);
        setIsLoading(false);
      },
    );
    // No unsubscribe means the caller opted out (e.g. missing id): nothing to
    // listen to, so we're not loading and there's nothing to tear down.
    if (!unsubscribe) {
      setIsLoading(false);
      return;
    }
    return unsubscribe;
  }, [subscribe, attempt]);

  return { data, isLoading, isError, refetch };
};
