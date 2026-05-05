/**
 * Motion Transition Factory
 *
 * Creates a Framer Motion transition with sensible animation defaults.
 * Combines timing, easing, and spring physics into a single config.
 *
 * Principles applied:
 * - Slow In Slow Out (default easing)
 * - Timing (appropriate durations)
 * - Spring physics (when set)
 */

import type { Transition } from "framer-motion";

import { TIMING, type TimingKey } from "./timing";
import { EASING, type EasingKey } from "./easing";
import { SPRING, type SpringKey } from "./spring";

interface MotionTransitionOptions {
  /** Base timing key */
  timing?: TimingKey;
  /** Override duration in seconds */
  duration?: number;
  /** Easing preset key */
  easing?: EasingKey;
  /** Spring preset key (overrides easing if set) */
  spring?: SpringKey;
  /** Delay in seconds */
  delay?: number;
}

export function createMotionTransition(
  options: MotionTransitionOptions = {},
): Transition {
  const {
    timing = "normal",
    duration,
    easing,
    spring,
    delay,
  } = options;

  const baseDuration = duration ?? TIMING[timing];

  if (spring) {
    return {
      ...SPRING[spring],
      ...(delay !== undefined && { delay }),
    };
  }

  return {
    duration: baseDuration,
    ease: easing ? [...EASING[easing]] : [...EASING.slowInSlowOut],
    ...(delay !== undefined && { delay }),
  };
}
