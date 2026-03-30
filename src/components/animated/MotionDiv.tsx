"use client";

import { type ReactNode, forwardRef } from "react";
import { motion, type Variants, type Transition } from "framer-motion";
import { useAccessibility } from "@/providers/AccessibilityProvider";
import {
  SPRING,
  TIMING,
  type SpringKey,
  type TimingKey,
  getReducedMotionVariant,
} from "@/lib/animation-utils";
import { cn } from "@/lib/utils";

/**
 * MotionDiv — Generic animated wrapper with variant props
 *
 * Supports both custom Framer Motion variants and built-in presets.
 * Automatically respects reduced motion preferences.
 *
 * Disney Principles: Timing, Slow In Slow Out, Appeal
 */

type PresetVariant =
  | "fadeIn"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "scaleIn"
  | "none";

interface MotionDivProps {
  children: ReactNode;
  /** Built-in preset animation */
  preset?: PresetVariant;
  /** Custom variants (overrides preset) */
  variants?: Variants;
  /** Spring config preset */
  spring?: SpringKey;
  /** Timing preset for delay */
  delay?: number;
  /** Timing duration override */
  duration?: TimingKey;
  /** Framer Motion initial state */
  initial?: string | boolean;
  /** Framer Motion animate state */
  animate?: string;
  /** Trigger animation when in view */
  whileInView?: string;
  /** Viewport options for whileInView */
  viewport?: { once?: boolean; amount?: number; margin?: string };
  /** Additional transition overrides */
  transition?: Transition;
  className?: string;
  style?: React.CSSProperties;
}

const PRESET_VARIANTS: Record<PresetVariant, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  slideDown: {
    hidden: { opacity: 0, y: -24 },
    visible: { opacity: 1, y: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
  },
  none: {
    hidden: {},
    visible: {},
  },
};

export const MotionDiv = forwardRef<HTMLDivElement, MotionDivProps>(
  function MotionDiv(
    {
      children,
      preset = "fadeIn",
      variants: customVariants,
      spring = "snappy",
      delay,
      duration,
      initial = "hidden",
      animate,
      whileInView = "visible",
      viewport = { once: true, amount: 0.15 },
      transition: transitionOverride,
      className,
      style,
    },
    ref,
  ) {
    const { prefersReducedMotion } = useAccessibility();

    const baseVariants = customVariants ?? PRESET_VARIANTS[preset];

    const resolvedVariants = prefersReducedMotion
      ? Object.fromEntries(
          Object.entries(baseVariants).map(([key, value]) => [
            key,
            typeof value === "object" && value !== null
              ? getReducedMotionVariant(value)
              : value,
          ]),
        )
      : baseVariants;

    const baseTransition: Transition = {
      ...SPRING[spring],
      ...(delay !== undefined && { delay }),
      ...(duration !== undefined && { duration: TIMING[duration] }),
    };

    const mergedTransition = transitionOverride
      ? { ...baseTransition, ...transitionOverride }
      : baseTransition;

    return (
      <motion.div
        ref={ref}
        variants={resolvedVariants}
        initial={initial}
        animate={animate}
        whileInView={whileInView}
        viewport={viewport}
        transition={mergedTransition}
        className={cn("will-animate", className)}
        style={style}
      >
        {children}
      </motion.div>
    );
  },
);
