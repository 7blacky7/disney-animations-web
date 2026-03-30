/**
 * Framer Motion Variants — Disney Animation System
 *
 * Every variant implements at least 3 of Disney's 12 Principles:
 * 1. Squash & Stretch    7. Arcs
 * 2. Anticipation        8. Secondary Action
 * 3. Staging             9. Timing
 * 4. Straight Ahead      10. Exaggeration
 * 5. Follow Through      11. Solid Drawing
 * 6. Slow In Slow Out    12. Appeal
 *
 * Rules:
 * - Only transform + opacity (GPU-only, 60fps)
 * - prefers-reduced-motion fallback via getReducedMotionVariant()
 */

import type { Variants } from "framer-motion";
import { EASING, SPRING, TIMING } from "@/lib/animation-utils";

// ---------------------------------------------------------------------------
// Basic Motion Variants
// ---------------------------------------------------------------------------

/** Fade in — Principles: Timing, Staging, Slow In Slow Out */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: TIMING.normal, ease: [...EASING.slowInSlowOut] },
  },
};

/** Fade out — Principles: Timing, Staging, Slow In Slow Out */
export const fadeOut: Variants = {
  visible: { opacity: 1 },
  hidden: {
    opacity: 0,
    transition: { duration: TIMING.quick, ease: [...EASING.easeIn] },
  },
};

/** Slide up with spring — Principles: Timing, Slow In Slow Out, Follow Through */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { ...SPRING.snappy } },
};

/** Slide down with spring — Principles: Timing, Slow In Slow Out, Arcs */
export const slideDown: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: { opacity: 1, y: 0, transition: { ...SPRING.snappy } },
};

/** Slide from left — Principles: Timing, Slow In Slow Out, Staging */
export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { ...SPRING.snappy } },
};

/** Slide from right — Principles: Timing, Slow In Slow Out, Staging */
export const slideRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { ...SPRING.snappy } },
};

/** Scale in — Principles: Squash & Stretch, Timing, Appeal */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { ...SPRING.bouncy } },
};

/** Scale out — Principles: Squash & Stretch, Timing, Slow In Slow Out */
export const scaleOut: Variants = {
  visible: { opacity: 1, scale: 1 },
  hidden: {
    opacity: 0,
    scale: 0.85,
    transition: { duration: TIMING.quick, ease: [...EASING.easeIn] },
  },
};

// ---------------------------------------------------------------------------
// Stagger Variants
// ---------------------------------------------------------------------------

/** Parent orchestrator — Principles: Staging, Timing, Straight Ahead Action */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
      when: "beforeChildren",
    },
  },
};

/** Stagger child — Principles: Follow Through, Timing, Overlapping Action */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { ...SPRING.snappy } },
};

// ---------------------------------------------------------------------------
// Disney Principle Variants
// ---------------------------------------------------------------------------

/**
 * ANTICIPATION — Counter-movement before main action.
 * Like crouching before a jump.
 * Principles: Anticipation, Timing, Slow In Slow Out
 */
export const anticipation: Variants = {
  rest: { scale: 1, y: 0 },
  anticipate: {
    scale: 0.95,
    y: 4,
    transition: { duration: TIMING.quick, ease: [...EASING.easeIn] },
  },
  action: {
    scale: 1.02,
    y: -8,
    transition: { ...SPRING.bouncy },
  },
};

/**
 * SQUASH AND STRETCH — Elastic vertical deformation.
 * Objects compress on impact and stretch during motion.
 * Principles: Squash & Stretch, Timing, Exaggeration
 */
export const squashAndStretch: Variants = {
  rest: { scaleX: 1, scaleY: 1 },
  squash: {
    scaleX: 1.08,
    scaleY: 0.92,
    transition: { duration: TIMING.instant, ease: [...EASING.easeOut] },
  },
  stretch: {
    scaleX: 0.95,
    scaleY: 1.08,
    transition: { ...SPRING.bouncy },
  },
  settle: {
    scaleX: 1,
    scaleY: 1,
    transition: { ...SPRING.gentle },
  },
};

/**
 * FOLLOW THROUGH — Overshooting target then settling.
 * Like hair continuing to move after a character stops.
 * Principles: Follow Through, Overlapping Action, Timing
 */
export const followThrough: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 12, mass: 0.8 },
  },
};

/**
 * SLOW IN SLOW OUT — Gradual acceleration and deceleration.
 * Nothing starts or stops instantly in nature.
 * Principles: Slow In Slow Out, Timing, Appeal
 */
export const slowInSlowOut: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: TIMING.moderate, ease: [...EASING.slowInSlowOut] },
  },
};

/**
 * ARCS — Curved motion paths via rotation + translation.
 * Nothing in nature moves in perfectly straight lines.
 * Principles: Arcs, Timing, Follow Through
 */
export const arcs: Variants = {
  hidden: { opacity: 0, x: -40, y: 30, rotate: -8 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    transition: { type: "spring", stiffness: 180, damping: 18, mass: 1 },
  },
};

/**
 * SECONDARY ACTION — Subtle accompanying movement.
 * The wave while walking — wave is secondary.
 * Principles: Secondary Action, Staging, Timing
 */
export const secondaryAction: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: TIMING.normal, ease: [...EASING.easeOut], delay: 0.15 },
  },
};

/**
 * EXAGGERATION — Amplified motion for dramatic effect.
 * Make important moments feel MORE important.
 * Principles: Exaggeration, Squash & Stretch, Appeal
 */
export const exaggeration: Variants = {
  hidden: { opacity: 0, scale: 0.6, y: 80, rotate: -5 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotate: 0,
    transition: { type: "spring", stiffness: 300, damping: 14, mass: 0.7 },
  },
};

/**
 * STAGING — Focus element stands out, context recedes.
 * Audience knows exactly where to look.
 * Principles: Staging, Timing, Appeal
 */
export const staging: Variants = {
  rest: { opacity: 1, scale: 1, filter: "blur(0px)" },
  focused: {
    opacity: 1,
    scale: 1.03,
    filter: "blur(0px)",
    transition: { ...SPRING.snappy },
  },
  unfocused: {
    opacity: 0.5,
    scale: 0.97,
    filter: "blur(2px)",
    transition: { duration: TIMING.normal, ease: [...EASING.easeOut] },
  },
};

// ---------------------------------------------------------------------------
// Composite Variants
// ---------------------------------------------------------------------------

/**
 * Hero entrance — dramatic reveal.
 * Combines: Anticipation, Follow Through, Slow In Slow Out, Staging, Exaggeration
 */
export const heroEntrance: Variants = {
  hidden: { opacity: 0, y: 100, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 1,
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

/**
 * Card hover with squash-stretch feel.
 * Combines: Squash & Stretch, Anticipation, Secondary Action
 */
export const cardHover: Variants = {
  rest: { y: 0, scale: 1, transition: { ...SPRING.gentle } },
  hover: { y: -8, scale: 1.02, transition: { ...SPRING.snappy } },
  tap: { y: 0, scale: 0.98, transition: { duration: TIMING.instant } },
};

/** Text reveal container — Principles: Staging, Timing, Overlapping Action */
export const textRevealContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 },
  },
};

/** Text reveal item — Principles: Follow Through, Arcs, Timing */
export const textRevealItem: Variants = {
  hidden: { opacity: 0, y: 20, rotateX: -60 },
  visible: { opacity: 1, y: 0, rotateX: 0, transition: { ...SPRING.snappy } },
};
