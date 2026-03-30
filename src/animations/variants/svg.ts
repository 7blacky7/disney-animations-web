/**
 * SVG Animation Variants — Animated Icon System
 *
 * Framer Motion variants for motion.path, motion.circle, motion.line etc.
 * Used with pathLength, strokeDasharray, and draw effects.
 *
 * Every variant uses at least 3 Disney Principles.
 *
 * Rules:
 * - Only transform + opacity + pathLength/strokeDashoffset (GPU-friendly SVG)
 * - prefers-reduced-motion: instant reveal without animation
 * - Looping variants use Infinity repeat
 */

import type { Variants, Transition } from "framer-motion";
import { SPRING, TIMING } from "@/lib/animation-utils";

// ---------------------------------------------------------------------------
// Path Draw Effects
// ---------------------------------------------------------------------------

/**
 * PATH DRAW — Animate pathLength from 0 to 1 (draw-on effect).
 * Like a pen drawing a shape. Classic SVG animation.
 * Principles: Slow In Slow Out, Timing, Staging
 *
 * Usage: <motion.path variants={pathDraw} pathLength={0} />
 */
export const pathDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 0.8,
        ease: [0.65, 0, 0.35, 1],
      },
      opacity: { duration: 0.2 },
    },
  },
};

/**
 * PATH DRAW LOOP — Continuously draws and erases a path.
 * Principles: Slow In Slow Out, Timing, Appeal
 */
export const pathDrawLoop: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: [0, 1, 1, 0],
    opacity: 1,
    transition: {
      pathLength: {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity,
        times: [0, 0.4, 0.6, 1],
      },
      opacity: { duration: 0.3 },
    },
  },
};

/**
 * CHECKMARK DRAW — Two-stroke checkmark with sequential draw.
 * Short stroke first, then long stroke (anticipation → action).
 * Principles: Anticipation, Staging, Timing, Appeal
 *
 * Usage: Apply to parent <motion.g>, children inherit stagger.
 */
export const checkmarkContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

export const checkmarkStroke: Variants = {
  hidden: { pathLength: 0 },
  visible: {
    pathLength: 1,
    transition: {
      duration: 0.4,
      ease: [0.65, 0, 0.35, 1],
    },
  },
};

// ---------------------------------------------------------------------------
// Circle/Shape Effects
// ---------------------------------------------------------------------------

/**
 * CIRCLE GROW — Circle expands from center with spring.
 * Like a ripple or selection indicator.
 * Principles: Squash & Stretch, Follow Through, Timing
 */
export const circleGrow: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { ...SPRING.bouncy },
  },
};

/**
 * CIRCLE PULSE — Looping scale pulse for attention.
 * Principles: Squash & Stretch, Timing, Appeal
 */
export const circlePulse: Variants = {
  hidden: { scale: 1 },
  visible: {
    scale: [1, 1.15, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

/**
 * CIRCLE RING — Expanding ring that fades out (like a sonar ping).
 * Principles: Follow Through, Timing, Staging
 */
export const circleRing: Variants = {
  hidden: { scale: 0.8, opacity: 0.6 },
  visible: {
    scale: [0.8, 1.5],
    opacity: [0.6, 0],
    transition: {
      duration: 1.5,
      ease: "easeOut",
      repeat: Infinity,
    },
  },
};

// ---------------------------------------------------------------------------
// Stroke Dash Animation
// ---------------------------------------------------------------------------

/**
 * DASH MARCH — Animated dashed stroke (marching ants).
 * Used for connection lines, drag paths, matching lines.
 * Principles: Timing, Secondary Action, Appeal
 *
 * CSS companion needed: stroke-dasharray on the element.
 */
export const dashMarch: Variants = {
  hidden: { strokeDashoffset: 0 },
  visible: {
    strokeDashoffset: [0, -20],
    transition: {
      duration: 1,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

// ---------------------------------------------------------------------------
// SVG Element Motion (transform-based)
// ---------------------------------------------------------------------------

/**
 * SVG BOUNCE IN — Element enters with bouncy spring.
 * For icons, badges, decorative shapes.
 * Principles: Squash & Stretch, Follow Through, Anticipation, Appeal
 */
export const svgBounceIn: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 12,
      mass: 0.5,
    },
  },
};

/**
 * SVG ROTATE LOOP — Gentle continuous rotation.
 * For spinners, timers, loading indicators.
 * Principles: Slow In Slow Out, Timing, Appeal
 */
export const svgRotateLoop: Variants = {
  hidden: { rotate: 0 },
  visible: {
    rotate: 360,
    transition: {
      duration: 3,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

/**
 * SVG WIGGLE — Small rotation oscillation for "alive" SVGs.
 * Principles: Secondary Action, Timing, Appeal
 */
export const svgWiggle: Variants = {
  hidden: { rotate: 0 },
  visible: {
    rotate: [-3, 3, -3],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

/**
 * SVG FLOAT Y — Gentle vertical bob for floating SVG elements.
 * Principles: Slow In Slow Out, Arcs, Appeal
 */
export const svgFloatY: Variants = {
  hidden: { y: 0 },
  visible: {
    y: [-3, 3, -3],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

// ---------------------------------------------------------------------------
// Stagger for Multi-Path SVGs
// ---------------------------------------------------------------------------

/**
 * SVG STAGGER CONTAINER — Orchestrates multi-path SVG reveals.
 * Principles: Staging, Timing, Straight Ahead Action
 */
export const svgStaggerContainer: Variants = {
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

/**
 * SVG STAGGER PATH — Individual path in staggered reveal.
 * Principles: Follow Through, Timing, Staging
 */
export const svgStaggerPath: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: [0.65, 0, 0.35, 1] },
      opacity: { duration: 0.15 },
    },
  },
};

// ---------------------------------------------------------------------------
// Quiz-Specific SVG Animations
// ---------------------------------------------------------------------------

/**
 * HAND GRAB — Motion for drag&drop hand icon.
 * Moves down slightly (grab) then slides.
 * Principles: Anticipation, Follow Through, Arcs, Timing
 */
export const handGrab: Variants = {
  rest: { y: 0, x: 0, scale: 1 },
  grab: {
    y: 2,
    scale: 0.95,
    transition: { duration: TIMING.instant },
  },
  drag: {
    x: [0, 15, 15],
    y: [2, -2, 0],
    scale: [0.95, 1, 1],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 1,
    },
  },
};

/**
 * CURSOR BLINK — Typing cursor for fill-in-blank.
 * Principles: Timing, Staging, Appeal
 */
export const cursorBlink: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [1, 1, 0, 0, 1],
    transition: {
      duration: 1.2,
      ease: "linear",
      repeat: Infinity,
      times: [0, 0.4, 0.5, 0.9, 1],
    },
  },
};

/**
 * SCALE TOGGLE — For true/false toggle flip effect.
 * Principles: Squash & Stretch, Anticipation, Timing
 */
export const scaleToggle: Variants = {
  a: { scaleX: 1, transition: { ...SPRING.snappy } },
  b: { scaleX: -1, transition: { ...SPRING.snappy } },
};

/**
 * TIMER TICK — Clock hand rotation with tick stops.
 * Principles: Timing, Staging, Exaggeration
 */
export const timerHand: Variants = {
  hidden: { rotate: 0 },
  visible: {
    rotate: 360,
    transition: {
      duration: 4,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

/**
 * SORTING ARROWS — Up/down arrows alternating.
 * Principles: Arcs, Timing, Secondary Action
 */
export const sortArrowUp: Variants = {
  rest: { y: 0 },
  animate: {
    y: [-4, 0, -4],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

export const sortArrowDown: Variants = {
  rest: { y: 0 },
  animate: {
    y: [4, 0, 4],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: Infinity,
      delay: 0.3,
    },
  },
};

/**
 * IMAGE FRAME — Picture frame wobble for image quiz.
 * Principles: Follow Through, Secondary Action, Appeal
 */
export const imageFrame: Variants = {
  rest: { rotate: 0, scale: 1 },
  animate: {
    rotate: [-2, 2, -1, 1, 0],
    scale: [1, 1.02, 1],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};
