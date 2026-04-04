/**
 * CHECKMARK STROKE — Individual stroke in checkmark draw sequence.
 * Principles: Anticipation, Staging, Timing, Appeal
 */

import type { Variants } from "framer-motion";

export const checkmarkStroke: Variants = {
  hidden: { pathLength: 0 },
  visible: {
    pathLength: 1,
    transition: {
      duration: 0.4,
      ease: [0.65, 0, 0.35, 1],
    },
  },
};
