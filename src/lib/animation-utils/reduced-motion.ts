/**
 * Reduced Motion Utilities
 *
 * Accessibility helpers for prefers-reduced-motion support.
 */

import type { Variant } from "framer-motion";

/**
 * Creates a reduced-motion-safe variant by stripping transform animations
 * and using instant opacity-only transitions.
 *
 * Keeps opacity changes (important for visibility) but removes all
 * transform-based motion that could cause vestibular discomfort.
 */
export function getReducedMotionVariant(
  variant: Variant | Record<string, unknown>,
): Variant {
  const source = variant as Record<string, unknown>;
  const reduced: Record<string, unknown> = {};

  // Preserve opacity (accessibility: content must still appear)
  if (source && typeof source === "object" && "opacity" in source) {
    reduced.opacity = source.opacity;
  } else {
    reduced.opacity = 1;
  }

  // Instant transition for reduced motion
  reduced.transition = {
    duration: 0.01,
    ease: "linear",
  };

  return reduced as Variant;
}

/**
 * Returns true if the user prefers reduced motion.
 * Safe for SSR (returns false on server).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
