"use client";

import { useAccessibility } from "@/providers/AccessibilityProvider";

/**
 * Shared utilities for quiz type icons.
 *
 * KEY RULE: Always visible AND animated.
 * - Never use pathLength: 0 as start → use 0.3 minimum
 * - Every icon has at least one looping animation
 * - Static fallback elements ensure visibility without JS
 * - prefers-reduced-motion: stop all looping animations, show static state
 *
 * Disney Principles: Follow-through, Slow In Slow Out, Secondary Action, Appeal
 */

export const LOOP = { repeat: Infinity, ease: "easeInOut" as const };
export const STATIC = {};

export interface IconProps {
  className?: string;
}

/** Shared hook for all icons — returns LOOP or STATIC transition override */
export function useIconMotion() {
  const { prefersReducedMotion } = useAccessibility();
  return prefersReducedMotion ? STATIC : undefined;
}
