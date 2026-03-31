/**
 * Gameplay Animation Variants — Quiz-Spielmodus Animationen
 *
 * Konfetti, Streaks, Countdowns, Leaderboards, Score-Reveals.
 * Duolingo/Kahoot-Level — professionell verspielt.
 *
 * Disney Principles per variant dokumentiert.
 * Alle GPU-only (transform/opacity). Kein Spring + 3-Keyframe!
 */

import type { Variants } from "framer-motion";
import { EASING } from "@/lib/animation-utils";

// ---------------------------------------------------------------------------
// Overshoot Ease (safe tween for multi-keyframe)
// ---------------------------------------------------------------------------

const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

// ---------------------------------------------------------------------------
// Countdown Timer
// ---------------------------------------------------------------------------

/**
 * COUNTDOWN NUMBER — Number flips in with scale + fade.
 * Used for 3-2-1 countdown before quiz starts.
 * Principles: Staging, Timing, Exaggeration, Appeal
 */
export const countdownNumber: Variants = {
  enter: { opacity: 0, scale: 2, y: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: OVERSHOOT },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    y: 20,
    transition: { duration: 0.2, ease: [...EASING.easeIn] },
  },
};

/**
 * COUNTDOWN RING — Circular progress ring shrinking.
 * Uses strokeDashoffset for timer visualization.
 * Principles: Timing, Staging, Slow In Slow Out
 */
export const countdownRing: Variants = {
  full: { strokeDashoffset: 0 },
  empty: {
    strokeDashoffset: 283, // 2 * PI * 45 (circumference)
    transition: { duration: 10, ease: "linear" },
  },
};

/**
 * COUNTDOWN PULSE — Background pulse synced with countdown.
 * Principles: Exaggeration, Timing, Appeal
 */
export const countdownPulse: Variants = {
  rest: { scale: 1, opacity: 0.5 },
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: { duration: 1, ease: "easeInOut", repeat: Infinity },
  },
  urgent: {
    scale: [1, 1.1, 1],
    opacity: [0.5, 1, 0.5],
    transition: { duration: 0.5, ease: "easeInOut", repeat: Infinity },
  },
};

// ---------------------------------------------------------------------------
// Score / Points
// ---------------------------------------------------------------------------

/**
 * SCORE POP — Score number pops and settles.
 * Principles: Squash & Stretch, Exaggeration, Follow Through
 */
export const scorePop: Variants = {
  rest: { scale: 1, y: 0 },
  pop: {
    scale: [1, 1.4, 1],
    y: [0, -12, 0],
    transition: { duration: 0.5, ease: OVERSHOOT, times: [0, 0.3, 1] },
  },
};

/**
 * POINTS FLOAT — Earned points float up and fade.
 * Like "+10" floating upward after correct answer.
 * Principles: Follow Through, Arcs, Timing
 */
export const pointsFloat: Variants = {
  enter: { opacity: 1, y: 0, scale: 1 },
  float: {
    opacity: 0,
    y: -60,
    scale: 0.8,
    transition: { duration: 1.2, ease: "easeOut" },
  },
};

/**
 * COMBO MULTIPLIER — Multiplier badge scales up with urgency.
 * Principles: Exaggeration, Squash & Stretch, Appeal
 */
export const comboMultiplier: Variants = {
  rest: { scale: 1, rotate: 0 },
  x2: {
    scale: [1, 1.2, 1.1],
    rotate: [0, -5, 0],
    transition: { duration: 0.4, ease: OVERSHOOT, times: [0, 0.4, 1] },
  },
  x3: {
    scale: [1, 1.3, 1.15],
    rotate: [0, -8, 3, 0],
    transition: { duration: 0.5, ease: OVERSHOOT, times: [0, 0.3, 0.7, 1] },
  },
  x5: {
    scale: [1, 1.5, 1.2],
    rotate: [0, -12, 5, 0],
    transition: { duration: 0.6, ease: OVERSHOOT, times: [0, 0.3, 0.7, 1] },
  },
};

// ---------------------------------------------------------------------------
// Streak Counter
// ---------------------------------------------------------------------------

/**
 * STREAK FIRE — Escalating intensity per streak level.
 * Principles: Exaggeration, Timing, Squash & Stretch, Appeal
 */
export const streakFire: Variants = {
  rest: { scale: 1, rotate: 0 },
  streak1: {
    scale: [1, 1.1, 1.05],
    transition: { duration: 0.3, ease: OVERSHOOT, times: [0, 0.5, 1] },
  },
  streak3: {
    scale: [1, 1.2, 1.1],
    rotate: [0, -3, 0],
    transition: { duration: 0.4, ease: OVERSHOOT, times: [0, 0.4, 1] },
  },
  streak5: {
    scale: [1, 1.3, 1.15],
    rotate: [0, -5, 3, 0],
    transition: { duration: 0.5, ease: OVERSHOOT, times: [0, 0.3, 0.7, 1] },
  },
  streak10: {
    scale: [1, 1.5, 1.2],
    rotate: [0, -8, 5, 0],
    transition: { duration: 0.6, ease: OVERSHOOT, times: [0, 0.3, 0.7, 1] },
  },
};

/**
 * STREAK BADGE — Badge shakes and glows when streak increases.
 * Principles: Exaggeration, Secondary Action, Appeal
 */
export const streakBadge: Variants = {
  rest: { scale: 1 },
  bump: {
    scale: [1, 1.15, 1],
    transition: { duration: 0.3, ease: OVERSHOOT, times: [0, 0.4, 1] },
  },
};

// ---------------------------------------------------------------------------
// Konfetti / Celebration
// ---------------------------------------------------------------------------

/**
 * CONFETTI PARTICLE — Single confetti piece trajectory.
 * Random-looking but deterministic (use index for variety).
 * Principles: Follow Through, Arcs, Timing, Appeal
 */
export const confettiParticle: Variants = {
  launch: { opacity: 1, y: 0, x: 0, rotate: 0, scale: 1 },
  fly: {
    opacity: [1, 1, 0],
    y: [0, -80, 120],
    rotate: [0, 180, 360],
    scale: [1, 1.2, 0.6],
    transition: {
      duration: 1.5,
      ease: "easeOut",
      times: [0, 0.3, 1],
    },
  },
};

/**
 * CELEBRATION BURST — Container for confetti particles.
 * Fast stagger for explosive feel.
 * Principles: Staging, Timing, Exaggeration
 */
export const celebrationBurst: Variants = {
  rest: { opacity: 0 },
  burst: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0,
    },
  },
};

/**
 * CELEBRATION STAR — Star/sparkle that grows and fades.
 * Principles: Squash & Stretch, Timing, Appeal
 */
export const celebrationStar: Variants = {
  hidden: { opacity: 0, scale: 0, rotate: 0 },
  visible: {
    opacity: [0, 1, 0],
    scale: [0, 1.2, 0],
    rotate: [0, 90, 180],
    transition: { duration: 0.8, ease: "easeOut", times: [0, 0.3, 1] },
  },
};

// ---------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------

/**
 * LEADERBOARD CONTAINER — Stagger reveal for rankings.
 * Principles: Staging, Timing, Straight Ahead Action
 */
export const leaderboardContainer: Variants = {
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
 * LEADERBOARD ROW — Individual rank row entrance.
 * Principles: Staging, Follow Through, Timing
 */
export const leaderboardRow: Variants = {
  hidden: { opacity: 0, x: -30, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.4, ease: OVERSHOOT },
  },
};

/**
 * LEADERBOARD POSITION CHANGE — Animated rank movement.
 * Principles: Arcs, Follow Through, Timing
 */
export const leaderboardShift: Variants = {
  up: {
    y: [0, -8, 0],
    scale: [1, 1.05, 1],
    transition: { duration: 0.5, ease: OVERSHOOT, times: [0, 0.4, 1] },
  },
  down: {
    y: [0, 8, 0],
    scale: [1, 0.97, 1],
    transition: { duration: 0.4, ease: "easeInOut", times: [0, 0.4, 1] },
  },
};

/**
 * PODIUM — Top-3 entrance with dramatic reveals.
 * Principles: Staging, Exaggeration, Timing, Appeal
 */
export const podiumReveal: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.85 },
  first: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: OVERSHOOT, delay: 0.6 },
  },
  second: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: OVERSHOOT, delay: 0.3 },
  },
  third: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: OVERSHOOT, delay: 0 },
  },
};

// ---------------------------------------------------------------------------
// Question Transitions
// ---------------------------------------------------------------------------

/**
 * QUESTION ENTER — New question slides in.
 * Principles: Staging, Timing, Slow In Slow Out
 */
export const questionEnter: Variants = {
  enter: { opacity: 0, x: 60, scale: 0.97 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.4, ease: OVERSHOOT },
  },
  exit: {
    opacity: 0,
    x: -60,
    scale: 0.97,
    transition: { duration: 0.25, ease: [...EASING.easeIn] },
  },
};

/**
 * ANSWER OPTIONS STAGGER — Options appear sequentially.
 * Principles: Staging, Timing, Straight Ahead Action
 */
export const answerOptionsContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
      when: "beforeChildren",
    },
  },
};

export const answerOptionItem: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: OVERSHOOT },
  },
};

// ---------------------------------------------------------------------------
// Results Screen
// ---------------------------------------------------------------------------

/**
 * RESULTS REVEAL — Final score/results screen entrance.
 * Principles: Staging, Exaggeration, Follow Through, Appeal
 */
export const resultsReveal: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: OVERSHOOT, delay: 0.2 },
  },
};

/**
 * RESULTS PERCENTAGE — Animated percentage counter.
 * Principles: Timing, Slow In Slow Out, Appeal
 */
export const resultsPercentage: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: OVERSHOOT, delay: 0.5 },
  },
};

/**
 * RESULTS STAT — Individual stat line entrance.
 * Principles: Staging, Timing, Follow Through
 */
export const resultsStat: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: OVERSHOOT },
  },
};
