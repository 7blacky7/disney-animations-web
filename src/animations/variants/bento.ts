/**
 * Bento Grid Animation Variants — Scroll-Triggered Staggered Reveals
 *
 * Designed for asymmetric grid layouts (Apple/Linear-style).
 * Hero cards get dramatic entrances, standard cards get snappy pops.
 *
 * Features:
 * - 3D perspective transforms (rotateX/rotateY — GPU-only)
 * - Positional stagger (cards enter from different directions)
 * - Hero vs standard card differentiation
 * - whileInView-ready (no auto-start)
 *
 * Disney Principles per variant documented below.
 * Rules: Only transform + opacity. No filter. No layout properties.
 */

import type { Variants } from "framer-motion";
import { SPRING, TIMING } from "@/lib/animation-utils";

// ---------------------------------------------------------------------------
// Bento Grid Container
// ---------------------------------------------------------------------------

/**
 * BENTO CONTAINER — Orchestrates staggered child reveals.
 * Principles: Staging, Timing, Straight Ahead Action
 */
export const bentoContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
      when: "beforeChildren",
    },
  },
};

/**
 * BENTO CONTAINER SLOW — For dramatic section entrances.
 * Principles: Staging, Timing, Slow In Slow Out
 */
export const bentoContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
      when: "beforeChildren",
    },
  },
};

// ---------------------------------------------------------------------------
// Standard Bento Card Entrances
// ---------------------------------------------------------------------------

/**
 * BENTO ITEM — Default card entrance (fade + slide up + scale).
 * Principles: Timing, Slow In Slow Out, Follow Through
 */
export const bentoItem: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...SPRING.snappy },
  },
};

/**
 * BENTO ITEM FROM LEFT — Card enters from the left.
 * Principles: Arcs, Timing, Staging
 */
export const bentoItemLeft: Variants = {
  hidden: { opacity: 0, x: -40, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { ...SPRING.snappy },
  },
};

/**
 * BENTO ITEM FROM RIGHT — Card enters from the right.
 * Principles: Arcs, Timing, Staging
 */
export const bentoItemRight: Variants = {
  hidden: { opacity: 0, x: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { ...SPRING.snappy },
  },
};

// ---------------------------------------------------------------------------
// Hero Card Entrances (larger cards, more dramatic)
// ---------------------------------------------------------------------------

/**
 * BENTO HERO — Dramatic entrance for double-size cards.
 * Slower spring, more travel distance, slight scale.
 * Principles: Staging, Exaggeration, Slow In Slow Out, Follow Through
 */
export const bentoHero: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...SPRING.slow },
  },
};

/**
 * BENTO HERO WITH PERSPECTIVE — 3D tilt entrance for hero cards.
 * Card appears to tilt forward then settle flat.
 * Principles: Anticipation, Follow Through, Staging, Appeal
 *
 * Requires perspective on parent: style={{ perspective: 1000 }}
 */
export const bentoHero3D: Variants = {
  hidden: { opacity: 0, y: 60, rotateX: 12, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 16,
      mass: 1,
    },
  },
};

// ---------------------------------------------------------------------------
// 3D Perspective Effects
// ---------------------------------------------------------------------------

/**
 * PERSPECTIVE TILT — Subtle 3D tilt on card entrance.
 * Less dramatic than hero3D, for standard cards.
 * Principles: Arcs, Timing, Appeal
 *
 * Requires perspective on parent.
 */
export const perspectiveTilt: Variants = {
  hidden: { opacity: 0, y: 30, rotateX: 8 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { ...SPRING.snappy },
  },
};

/**
 * PERSPECTIVE TILT LEFT — Card tilts from left side.
 * Principles: Arcs, Staging, Timing
 */
export const perspectiveTiltLeft: Variants = {
  hidden: { opacity: 0, x: -30, rotateY: -8 },
  visible: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: { ...SPRING.snappy },
  },
};

/**
 * PERSPECTIVE TILT RIGHT — Card tilts from right side.
 * Principles: Arcs, Staging, Timing
 */
export const perspectiveTiltRight: Variants = {
  hidden: { opacity: 0, x: 30, rotateY: 8 },
  visible: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: { ...SPRING.snappy },
  },
};

// ---------------------------------------------------------------------------
// Hover Effects for Bento Cards
// ---------------------------------------------------------------------------

/**
 * BENTO HOVER LIFT — Standard card hover with subtle lift.
 * Principles: Anticipation, Secondary Action, Timing
 */
export const bentoHoverLift: Variants = {
  rest: { y: 0, scale: 1, transition: { ...SPRING.gentle } },
  hover: { y: -6, scale: 1.02, transition: { ...SPRING.snappy } },
  tap: { y: 0, scale: 0.98, transition: { duration: TIMING.instant } },
};

/**
 * BENTO HOVER 3D — 3D tilt on hover (interactive depth).
 * Principles: Arcs, Follow Through, Appeal
 *
 * Requires perspective on parent.
 */
export const bentoHover3D: Variants = {
  rest: { rotateX: 0, rotateY: 0, scale: 1, transition: { ...SPRING.gentle } },
  hover: { rotateX: -2, rotateY: 3, scale: 1.02, transition: { ...SPRING.snappy } },
  tap: { rotateX: 0, rotateY: 0, scale: 0.98, transition: { duration: TIMING.instant } },
};

// ---------------------------------------------------------------------------
// GSAP ScrollTrigger Helper Config (for non-Framer implementations)
// ---------------------------------------------------------------------------

/**
 * Bento-optimized ScrollTrigger config.
 * Use with GSAP ScrollTrigger.batch() for performant grid reveals.
 */
export const BENTO_SCROLL_CONFIG = {
  /** Trigger when 15% of the card is visible */
  start: "top 85%",
  /** Stagger interval between batched elements */
  batchInterval: 0.08,
  /** Default stagger within a batch */
  stagger: 0.06,
  /** Distance for slide animations */
  distance: 40,
} as const;

// ---------------------------------------------------------------------------
// Positional Variant Factory
// ---------------------------------------------------------------------------

/**
 * Creates a variant based on grid position for natural stagger.
 * Cards enter from the direction closest to their grid edge.
 *
 * @param col - Column index (0-based)
 * @param row - Row index (0-based)
 * @param totalCols - Total columns in grid
 */
export function getBentoEntrance(
  col: number,
  row: number,
  totalCols: number,
): Variants {
  // Cards on left edge enter from left, right edge from right
  const isLeftEdge = col === 0;
  const isRightEdge = col === totalCols - 1;

  if (isLeftEdge) return bentoItemLeft;
  if (isRightEdge) return bentoItemRight;
  return bentoItem;
}
