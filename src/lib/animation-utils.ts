/**
 * Disney-inspired Animation Constants
 *
 * Based on the 12 Principles of Animation by Frank Thomas and Ollie Johnston.
 * All timing and easing values are tuned for natural, organic movement.
 */

// ---------------------------------------------------------------------------
// Timing Constants (in seconds)
// ---------------------------------------------------------------------------

export const TIMING = {
  /** Micro-interactions: button hover, focus ring, icon state */
  instant: 0.1,
  /** Quick feedback: tooltips, dropdowns, small reveals */
  fast: 0.2,
  /** Standard transitions: card reveals, panel slides */
  normal: 0.35,
  /** Emphasized movement: page transitions, hero reveals */
  slow: 0.5,
  /** Dramatic reveals: full-screen overlays, splash sequences */
  dramatic: 0.8,
  /** Stagger delay between sequential child items */
  staggerChild: 0.06,
  /** Stagger delay between groups of elements */
  staggerGroup: 0.12,
} as const;

// ---------------------------------------------------------------------------
// Easing — CSS cubic-bezier curves (Disney-inspired)
// ---------------------------------------------------------------------------

export const EASING = {
  /** Soft ease-out for exits and settling (follow-through) */
  out: [0.22, 1, 0.36, 1] as const,
  /** Snappy ease-in for entries with anticipation */
  in: [0.55, 0, 1, 0.45] as const,
  /** Balanced ease for repositioning */
  inOut: [0.65, 0, 0.35, 1] as const,
  /** Overshoot ease for playful bounce (squash & stretch) */
  overshoot: [0.34, 1.56, 0.64, 1] as const,
  /** Anticipation curve — slight pull-back before action */
  anticipation: [0.68, -0.55, 0.27, 1.55] as const,
  /** Decelerate — fast start, gentle stop */
  decelerate: [0, 0, 0.2, 1] as const,
  /** Accelerate — slow start, fast finish */
  accelerate: [0.4, 0, 1, 1] as const,
} as const;

// ---------------------------------------------------------------------------
// Spring Physics (Framer Motion spring configs)
// ---------------------------------------------------------------------------

export const SPRING = {
  /** Gentle — slow, no overshoot. Settling movements. */
  gentle: { type: "spring" as const, stiffness: 120, damping: 20, mass: 1 },
  /** Default — balanced, slight overshoot. Most interactions. */
  default: { type: "spring" as const, stiffness: 200, damping: 24, mass: 1 },
  /** Snappy — quick response, minimal overshoot. Buttons, toggles. */
  snappy: { type: "spring" as const, stiffness: 400, damping: 30, mass: 0.8 },
  /** Bouncy — visible overshoot. Playful, Disney-like. */
  bouncy: { type: "spring" as const, stiffness: 300, damping: 15, mass: 1 },
  /** Heavy — high mass, slow and deliberate. Page-level transitions. */
  heavy: { type: "spring" as const, stiffness: 200, damping: 28, mass: 1.5 },
  /** Wobbly — low damping, multiple oscillations. Jelly effects. */
  wobbly: { type: "spring" as const, stiffness: 180, damping: 10, mass: 1 },
} as const;

// ---------------------------------------------------------------------------
// Reduced Motion — safe fallback durations
// ---------------------------------------------------------------------------

export const REDUCED_MOTION = {
  /** Use instant transitions when reduced motion is preferred */
  duration: 0.01,
  /** No spring physics — use simple tween */
  transition: { type: "tween" as const, duration: 0.01 },
} as const;

// ---------------------------------------------------------------------------
// Transform Presets (GPU-only properties for 60fps)
// ---------------------------------------------------------------------------

export const TRANSFORM = {
  /** Subtle scale for hover/press (squash & stretch principle) */
  scaleHover: 1.03,
  scalePress: 0.97,
  /** Card lift on hover */
  liftY: -4,
  /** Slide-in offsets */
  slideUp: 24,
  slideDown: -24,
  slideLeft: 24,
  slideRight: -24,
} as const;
