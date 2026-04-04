import type { Variants } from "framer-motion";
import { loopTransition } from "./_shared";

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
