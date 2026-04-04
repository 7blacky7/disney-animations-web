import type { Variants } from "framer-motion";
import { EASING } from "@/lib/animation-utils";

/**
 * SCORE COUNTER — Number pop on score change.
 * Principles: Squash & Stretch, Exaggeration, Appeal
 */
export const scoreCounter: Variants = {
  rest: { scale: 1, y: 0 },
  increment: {
    scale: [1, 1.3, 1],
    y: [0, -8, 0],
    transition: { duration: 0.5, ease: [...EASING.overshoot], times: [0, 0.4, 1] },
  },
};
