/**
 * Quiz Micro-Animation Variants — Playful but Professional
 *
 * Duolingo/Kahoot-Level: Bouncy, alive, clean.
 * Every variant uses at least 3 Disney Principles.
 *
 * Rules:
 * - Only transform + opacity (GPU-only, 60fps)
 * - prefers-reduced-motion: all keyframes collapse to static
 * - 6s auto-loop for demo animations
 * - Professional — not childish
 */

import type { Variants, Transition } from "framer-motion";
import { SPRING, TIMING, EASING } from "@/lib/animation-utils";

// ---------------------------------------------------------------------------
// Spring Configs — Quiz-Specific (bouncier than standard)
// ---------------------------------------------------------------------------

/** Extra bouncy for quiz interactions — Duolingo-style */
const QUIZ_SPRING = {
  /** Playful bounce for correct answers */
  celebration: {
    type: "spring" as const,
    stiffness: 400,
    damping: 12,
    mass: 0.5,
  },
  /** Soft wobble for idle elements */
  wobble: {
    type: "spring" as const,
    stiffness: 200,
    damping: 8,
    mass: 0.6,
  },
  /** Snappy pop for selections */
  pop: {
    type: "spring" as const,
    stiffness: 500,
    damping: 18,
    mass: 0.4,
  },
  /** Elastic drag feel */
  drag: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20,
    mass: 0.7,
  },
} as const;

// ---------------------------------------------------------------------------
// Looping Transition Helpers
// ---------------------------------------------------------------------------

const loopTransition = (duration: number, delay = 0): Transition => ({
  duration,
  ease: "easeInOut",
  repeat: Infinity,
  repeatType: "loop" as const,
  delay,
});

const mirrorTransition = (duration: number, delay = 0): Transition => ({
  duration,
  ease: "easeInOut",
  repeat: Infinity,
  repeatType: "mirror" as const,
  delay,
});

// ---------------------------------------------------------------------------
// Micro-Animations: Ambient "Alive" Effects
// ---------------------------------------------------------------------------

/**
 * WOBBLE — Subtle rotation oscillation for idle elements.
 * Like a card gently rocking. Duolingo uses this on mascot.
 * Principles: Slow In Slow Out, Secondary Action, Appeal
 */
export const wobble: Variants = {
  rest: { rotate: 0 },
  animate: {
    rotate: [-1.5, 1.5, -1.5],
    transition: loopTransition(3),
  },
};

/**
 * PULSE — Gentle scale breathing for attention elements.
 * Like a heart beating softly. Used on CTAs and active items.
 * Principles: Squash & Stretch, Timing, Appeal
 */
export const pulse: Variants = {
  rest: { scale: 1 },
  animate: {
    scale: [1, 1.04, 1],
    transition: loopTransition(2.5),
  },
};

/**
 * FLOAT — Vertical hovering for decorative elements.
 * Creates depth and life. Different from wobble (vertical vs rotational).
 * Principles: Slow In Slow Out, Arcs, Secondary Action
 */
export const float: Variants = {
  rest: { y: 0 },
  animate: {
    y: [-6, 6, -6],
    transition: loopTransition(4),
  },
};

/**
 * SHIMMER — Subtle opacity pulse for highlights/badges.
 * Principles: Staging, Timing, Appeal
 */
export const shimmer: Variants = {
  rest: { opacity: 0.7 },
  animate: {
    opacity: [0.7, 1, 0.7],
    transition: loopTransition(2),
  },
};

/**
 * BOUNCE IDLE — Vertical bounce for mascot/icon elements.
 * More energetic than float. Kahoot-style.
 * Principles: Squash & Stretch, Timing, Exaggeration, Appeal
 */
export const bounceIdle: Variants = {
  rest: { y: 0, scaleX: 1, scaleY: 1 },
  animate: {
    y: [0, -10, 0],
    scaleX: [1, 0.97, 1],
    scaleY: [1, 1.04, 1],
    transition: loopTransition(2, 0),
  },
};

// ---------------------------------------------------------------------------
// Quiz Card Interactions
// ---------------------------------------------------------------------------

/**
 * QUIZ CARD — Bouncy card entrance + hover.
 * Principles: Anticipation, Squash & Stretch, Follow Through, Appeal
 */
export const quizCard: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...QUIZ_SPRING.celebration },
  },
  hover: {
    y: -6,
    scale: 1.03,
    transition: { ...QUIZ_SPRING.pop },
  },
  tap: {
    scale: 0.97,
    transition: { duration: TIMING.instant },
  },
};

/**
 * QUIZ OPTION — Answer option with selection bounce.
 * Principles: Anticipation, Squash & Stretch, Timing, Appeal
 */
export const quizOption: Variants = {
  rest: { scale: 1, x: 0 },
  hover: {
    scale: 1.02,
    x: 4,
    transition: { ...QUIZ_SPRING.pop },
  },
  tap: {
    scale: 0.97,
    transition: { duration: TIMING.instant },
  },
  selected: {
    scale: [1, 1.08, 1],
    transition: { ...QUIZ_SPRING.celebration },
  },
};

/**
 * CORRECT ANSWER — Celebration bounce (Duolingo-style).
 * Principles: Squash & Stretch, Exaggeration, Follow Through, Appeal
 */
export const correctAnswer: Variants = {
  rest: { scale: 1, rotate: 0 },
  celebrate: {
    scale: [1, 1.15, 0.95, 1.05, 1],
    rotate: [0, -3, 3, -1, 0],
    transition: {
      duration: 0.6,
      ease: [...EASING.overshoot],
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  },
};

/**
 * WRONG ANSWER — Horizontal shake (gentle, not aggressive).
 * Principles: Exaggeration, Timing, Follow Through
 */
export const wrongAnswer: Variants = {
  rest: { x: 0 },
  shake: {
    x: [0, -8, 8, -5, 5, -2, 0],
    transition: {
      duration: 0.5,
      ease: "easeOut",
      times: [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1],
    },
  },
};

// ---------------------------------------------------------------------------
// Quiz-Type Specific Demo Animations (6s loops)
// ---------------------------------------------------------------------------

/**
 * MULTIPLE CHOICE DEMO — Options appear, one gets selected, feedback.
 * Principles: Staging, Anticipation, Follow Through, Appeal
 */
export const mcOptionStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
      when: "beforeChildren",
    },
  },
};

export const mcOptionItem: Variants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { ...QUIZ_SPRING.pop },
  },
};

/**
 * DRAG ELEMENT — Draggable item with elastic feel.
 * Principles: Squash & Stretch, Follow Through, Arcs, Appeal
 */
export const dragElement: Variants = {
  rest: { scale: 1, rotate: 0 },
  dragging: {
    scale: 1.08,
    rotate: 3,
    transition: { ...QUIZ_SPRING.drag },
  },
  dropped: {
    scale: [1.1, 0.95, 1],
    rotate: 0,
    transition: { ...QUIZ_SPRING.celebration },
  },
};

/**
 * MATCHING LINE DRAW — Connection lines animate in.
 * Uses scaleX from 0 to simulate drawing.
 * Principles: Slow In Slow Out, Arcs, Staging
 */
export const matchingLine: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: TIMING.normal,
      ease: [...EASING.overshoot],
    },
  },
};

/**
 * SLIDER THUMB — Bouncy slider interaction.
 * Principles: Squash & Stretch, Follow Through, Timing, Appeal
 */
export const sliderThumb: Variants = {
  rest: { scale: 1 },
  active: {
    scale: 1.2,
    transition: { ...QUIZ_SPRING.pop },
  },
  snap: {
    scale: [1.3, 0.9, 1.05, 1],
    transition: {
      duration: 0.4,
      times: [0, 0.4, 0.7, 1],
    },
  },
};

/**
 * TRUE/FALSE TOGGLE — Flip animation for binary choice.
 * Principles: Anticipation, Squash & Stretch, Timing, Appeal
 */
export const trueFalseToggle: Variants = {
  rest: { rotateY: 0, scale: 1 },
  flip: {
    rotateY: 180,
    scale: [1, 0.9, 1],
    transition: {
      duration: 0.5,
      ease: [...EASING.overshoot],
    },
  },
};

/**
 * FILL IN BLANK — Text cursor blink + answer reveal.
 * Principles: Staging, Timing, Follow Through
 */
export const fillBlankReveal: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...QUIZ_SPRING.celebration },
  },
};

/**
 * IMAGE CHOICE — Image card with playful hover.
 * Principles: Squash & Stretch, Anticipation, Secondary Action, Appeal
 */
export const imageChoice: Variants = {
  rest: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.05,
    rotate: 1.5,
    transition: { ...QUIZ_SPRING.pop },
  },
  selected: {
    scale: [1, 1.1, 1.02],
    rotate: [0, -2, 0],
    transition: { ...QUIZ_SPRING.celebration },
  },
};

/**
 * SORTING ITEM — Reorder animation for sorting quizzes.
 * Principles: Follow Through, Arcs, Timing, Appeal
 */
export const sortingItem: Variants = {
  rest: { y: 0, scale: 1 },
  moving: {
    scale: 1.05,
    transition: { ...QUIZ_SPRING.drag },
  },
  settled: {
    y: 0,
    scale: 1,
    transition: { ...QUIZ_SPRING.celebration },
  },
};

/**
 * TIMER URGENCY — Increasingly urgent pulse as time runs out.
 * Principles: Exaggeration, Timing, Staging, Appeal
 */
export const timerUrgent: Variants = {
  rest: { scale: 1 },
  ticking: {
    scale: [1, 1.02, 1],
    transition: mirrorTransition(1),
  },
  urgent: {
    scale: [1, 1.06, 1],
    transition: mirrorTransition(0.5),
  },
  critical: {
    scale: [1, 1.1, 1],
    rotate: [0, -1, 1, 0],
    transition: mirrorTransition(0.3),
  },
};

// ---------------------------------------------------------------------------
// Quiz Container / Orchestration
// ---------------------------------------------------------------------------

/**
 * QUIZ DEMO CONTAINER — Stagger children with playful entrance.
 * Principles: Staging, Timing, Straight Ahead Action
 */
export const quizDemoContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
      when: "beforeChildren",
    },
  },
};

/**
 * SCORE COUNTER — Number pop on score change.
 * Principles: Squash & Stretch, Exaggeration, Appeal
 */
export const scoreCounter: Variants = {
  rest: { scale: 1, y: 0 },
  increment: {
    scale: [1, 1.3, 1],
    y: [0, -8, 0],
    transition: { ...QUIZ_SPRING.celebration },
  },
};

/**
 * PROGRESS BAR FILL — Smooth progress with overshoot.
 * Uses scaleX for GPU-only width simulation.
 * Principles: Slow In Slow Out, Follow Through, Timing
 */
export const progressFill: Variants = {
  empty: { scaleX: 0 },
  filled: {
    scaleX: 1,
    transition: {
      duration: TIMING.moderate,
      ease: [...EASING.overshoot],
    },
  },
};

// ---------------------------------------------------------------------------
// Re-export quiz springs for component use
// ---------------------------------------------------------------------------

export { QUIZ_SPRING };
