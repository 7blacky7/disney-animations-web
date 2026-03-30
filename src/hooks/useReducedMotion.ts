"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Detects the user's `prefers-reduced-motion` media query.
 *
 * Uses `useSyncExternalStore` for tear-free reads of the browser
 * media query — the recommended React 19 pattern for external subscriptions.
 *
 * Returns `true` when the user prefers reduced motion.
 * Falls back to `false` during SSR (motion enabled by default).
 */
export function useReducedMotion(): boolean {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    mql.addEventListener("change", onStoreChange);
    return () => mql.removeEventListener("change", onStoreChange);
  }, []);

  const getSnapshot = useCallback(() => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
