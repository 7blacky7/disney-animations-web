/**
 * Disney Animation Utilities
 *
 * Timing constants, easing presets, spring configs, and utility functions
 * based on Disney's 12 Principles of Animation.
 *
 * Rules:
 * - Only transform and opacity (GPU-accelerated, 60fps)
 * - prefers-reduced-motion fallback for every animation
 * - Spring physics for natural movement
 */

import type { Transition, Variant } from "framer-motion";

// ---------------------------------------------------------------------------
// Timing Constants (seconds for Framer Motion / GSAP)
// ---------------------------------------------------------------------------

export const TIMING = {
  /** Micro-interactions, button press feedback */
  instant: 0.1,
  /** Hover responses, small state changes */
  quick: 0.2,
  /** Standard transitions, most UI elements */
  normal: 0.4,
  /** Page transitions, larger reveals */
  moderate: 0.6,
  /** Dramatic entrances, hero animations */
  slow: 0.8,
  /** Cinematic sequences, storytelling beats */
  dramatic: 1.2,
} as const;

export type TimingKey = keyof typeof TIMING;

// ---------------------------------------------------------------------------
// Easing Presets (Cubic Bezier)
// ---------------------------------------------------------------------------

export const EASING = {
  /** Standard ease-out for most exits */
  easeOut: [0.0, 0.0, 0.2, 1.0] as const,
  /** Standard ease-in for entrances from user action */
  easeIn: [0.4, 0.0, 1.0, 1.0] as const,
  /** Standard ease-in-out */
  easeInOut: [0.4, 0.0, 0.2, 1.0] as const,
  /** Disney: Slow In Slow Out — gradual acceleration and deceleration */
  slowInSlowOut: [0.45, 0.0, 0.55, 1.0] as const,
  /** Disney: Anticipation — slight pull-back before action */
  anticipation: [0.36, 0.0, 0.66, -0.56] as const,
  /** Disney: Overshoot — goes past target then settles */
  overshoot: [0.34, 1.56, 0.64, 1.0] as const,
  /** Bounce effect for playful interactions */
  bounce: [0.34, 1.4, 0.64, 1.0] as const,
  /** Elastic snap for quick, spring-like returns */
  elastic: [0.68, -0.55, 0.27, 1.55] as const,
  /** Cinematic entrance — slow start, smooth finish */
  cinematic: [0.25, 0.1, 0.25, 1.0] as const,
  /** Sharp deceleration for impactful landings */
  decelerate: [0.0, 0.0, 0.0, 1.0] as const,
} as const;

export type EasingKey = keyof typeof EASING;

// ---------------------------------------------------------------------------
// Spring Configurations (Framer Motion)
// ---------------------------------------------------------------------------

export const SPRING = {
  /** Gentle, soft movement — tooltips, subtle feedback */
  gentle: {
    type: "spring" as const,
    stiffness: 120,
    damping: 20,
    mass: 1,
  },
  /** Default snappy feel — buttons, cards, interactive elements */
  snappy: {
    type: "spring" as const,
    stiffness: 300,
    damping: 24,
    mass: 0.8,
  },
  /** Bouncy, playful — Disney-style follow-through and overlapping action */
  bouncy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 15,
    mass: 0.6,
  },
  /** Slow, dramatic — hero entrances, page transitions */
  slow: {
    type: "spring" as const,
    stiffness: 80,
    damping: 20,
    mass: 1.2,
  },
  /** Wobbly, elastic — exaggerated effects */
  wobbly: {
    type: "spring" as const,
    stiffness: 200,
    damping: 10,
    mass: 0.5,
  },
  /** Stiff, precise — UI state changes that need to feel instant */
  stiff: {
    type: "spring" as const,
    stiffness: 500,
    damping: 30,
    mass: 0.6,
  },
} as const;

export type SpringKey = keyof typeof SPRING;

// ---------------------------------------------------------------------------
// Stagger Configuration
// ---------------------------------------------------------------------------

export const STAGGER = {
  /** Fast stagger for lists */
  fast: 0.05,
  /** Standard stagger for card grids */
  normal: 0.08,
  /** Slow stagger for dramatic reveals */
  slow: 0.12,
  /** Very slow for cinematic sequences */
  dramatic: 0.2,
} as const;

// ---------------------------------------------------------------------------
// Disney Transition Factory
// ---------------------------------------------------------------------------

interface DisneyTransitionOptions {
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

/**
 * Creates a Framer Motion transition with Disney-quality defaults.
 * Combines timing, easing, and spring physics into a single config.
 *
 * Disney Principles applied:
 * - Slow In Slow Out (default easing)
 * - Timing (appropriate durations)
 * - Straight Ahead / Pose to Pose (spring physics)
 */
export function createDisneyTransition(
  options: DisneyTransitionOptions = {},
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

// ---------------------------------------------------------------------------
// Reduced Motion Variant
// ---------------------------------------------------------------------------

/**
 * Creates a reduced-motion-safe variant by stripping transform animations
 * and using instant opacity-only transitions.
 *
 * Keeps opacity changes (important for visibility) but removes all
 * transform-based motion that could cause vestibular discomfort.
 */
export function getReducedMotionVariant(variant: Variant): Variant {
  const reduced: Record<string, unknown> = {};

  // Preserve opacity (accessibility: content must still appear)
  if (typeof variant === "object" && variant !== null && "opacity" in variant) {
    reduced.opacity = (variant as Record<string, unknown>).opacity;
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

// ---------------------------------------------------------------------------
// Reduced Motion Media Query Hook Helper
// ---------------------------------------------------------------------------

/**
 * Returns true if the user prefers reduced motion.
 * Safe for SSR (returns false on server).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ---------------------------------------------------------------------------
// GSAP Easing Strings
// ---------------------------------------------------------------------------

export const GSAP_EASE = {
  easeOut: "power2.out",
  easeIn: "power2.in",
  easeInOut: "power2.inOut",
  slowInSlowOut: "power1.inOut",
  anticipation: "back.in(1.7)",
  overshoot: "back.out(1.7)",
  bounce: "bounce.out",
  elastic: "elastic.out(1, 0.3)",
  cinematic: "power3.out",
  decelerate: "power4.out",
} as const;

export type GsapEaseKey = keyof typeof GSAP_EASE;
