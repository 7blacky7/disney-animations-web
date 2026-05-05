"use client";

import { type ReactNode } from "react";
import { motion, type Variants, type Transition } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import { getReducedMotionVariant } from "@/lib/animation-utils";

/**
 * AccessibleMotion — Reduced Motion Fallback Wrapper
 *
 * Wraps any Framer Motion animation and automatically replaces it
 * with opacity-only instant transitions when the user prefers reduced motion.
 *
 * Animation Principles:
 * - Appeal: respectful of user preferences
 * - Staging: content appears without motion sickness risk
 */

interface AccessibleMotionProps {
  children: ReactNode;
  /** Full-motion variants */
  variants: Variants;
  /** Reduced-motion variant overrides (auto-generated if omitted) */
  reducedVariants?: Variants;
  /** Initial animation state key */
  initial?: string;
  /** Animate-to state key */
  animate?: string;
  /** Exit state key */
  exit?: string;
  /** Override transition */
  transition?: Transition;
  /** Additional className */
  className?: string;
  /** Rendered HTML tag */
  as?: keyof typeof motion;
}

export function AccessibleMotion({
  children,
  variants,
  reducedVariants,
  initial = "hidden",
  animate = "visible",
  exit,
  transition,
  className,
  as = "div",
}: AccessibleMotionProps) {
  const { prefersReducedMotion } = useAccessibility();

  const safeVariants = prefersReducedMotion
    ? reducedVariants ?? buildReducedVariants(variants)
    : variants;

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      variants={safeVariants}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

function buildReducedVariants(variants: Variants): Variants {
  const reduced: Variants = {};
  for (const key of Object.keys(variants)) {
    const value = variants[key];
    if (typeof value === "object" && value !== null) {
      reduced[key] = getReducedMotionVariant(value);
    } else {
      reduced[key] = value;
    }
  }
  return reduced;
}
