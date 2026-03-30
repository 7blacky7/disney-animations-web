"use client";

import { useEffect, useState } from "react";

/**
 * Detects the user's `prefers-reduced-motion` media query.
 *
 * Returns `true` when the user prefers reduced motion.
 * Falls back to `false` during SSR (motion enabled by default).
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mql.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}
