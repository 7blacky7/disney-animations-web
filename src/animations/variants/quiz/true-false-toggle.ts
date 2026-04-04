import type { Variants } from "framer-motion";
import { EASING } from "@/lib/animation-utils";

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
