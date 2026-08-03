"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Small hook for admin pages: gates rendering until mounted (so localStorage
 * reads don't cause hydration mismatch) and exposes a `refresh` to re-read the
 * store after a mutation. Read `adminStore.xxx()` inside a useMemo keyed on `tick`.
 */
export function useAdmin() {
  const [hydrated, setHydrated] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);
  const refresh = useCallback(() => setTick((t) => t + 1), []);
  return { hydrated, tick, refresh };
}
