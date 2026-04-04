import type { Variants } from "framer-motion";
import { TIMING } from "@/lib/animation-utils";
import { QUIZ_SPRING } from "./_shared";

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
    scale: 1.08,
    transition: { ...QUIZ_SPRING.celebration },
  },
};
