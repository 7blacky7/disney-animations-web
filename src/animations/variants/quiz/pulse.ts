import type { Variants } from "framer-motion";
import { loopTransition } from "./_shared";

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
