import type { Transition } from "framer-motion";

// ---------------------------------------------------------------------------
// Spring Configs — Quiz-Specific (bouncier than standard)
// ---------------------------------------------------------------------------

/** Extra bouncy for quiz interactions — Duolingo-style */
export const QUIZ_SPRING = {
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

export const loopTransition = (duration: number, delay = 0): Transition => ({
  duration,
  ease: "easeInOut",
  repeat: Infinity,
  repeatType: "loop" as const,
  delay,
});

export const mirrorTransition = (duration: number, delay = 0): Transition => ({
  duration,
  ease: "easeInOut",
  repeat: Infinity,
  repeatType: "mirror" as const,
  delay,
});
