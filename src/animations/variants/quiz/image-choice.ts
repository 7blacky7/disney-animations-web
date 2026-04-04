import type { Variants } from "framer-motion";
import { EASING } from "@/lib/animation-utils";
import { QUIZ_SPRING } from "./_shared";

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
    transition: { duration: 0.5, ease: [...EASING.overshoot], times: [0, 0.5, 1] },
  },
};
