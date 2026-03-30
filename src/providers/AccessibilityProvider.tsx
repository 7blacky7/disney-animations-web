"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AccessibilityContextValue {
  /** User prefers reduced motion */
  prefersReducedMotion: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextValue>({
  prefersReducedMotion: false,
});

/**
 * Provides accessibility state (reduced motion preference) to the entire
 * component tree. Components can use `useAccessibility()` to adapt their
 * animations based on the user's system preference.
 */
export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AccessibilityContext.Provider value={{ prefersReducedMotion }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

/**
 * Access the current accessibility context.
 *
 * @example
 * ```tsx
 * const { prefersReducedMotion } = useAccessibility();
 * const transition = prefersReducedMotion ? REDUCED_MOTION.transition : SPRING.default;
 * ```
 */
export function useAccessibility(): AccessibilityContextValue {
  return useContext(AccessibilityContext);
}
