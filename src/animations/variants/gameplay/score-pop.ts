import type { Variants } from "framer-motion";
import { OVERSHOOT } from "./_shared";

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
