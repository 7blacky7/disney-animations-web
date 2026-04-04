/**
 * TIMER TICK — Clock hand rotation with tick stops.
 * Principles: Timing, Staging, Exaggeration
 */

import type { Variants } from "framer-motion";

export const timerHand: Variants = {
  hidden: { rotate: 0 },
  visible: {
    rotate: 360,
    transition: {
      duration: 4,
      ease: "linear",
      repeat: Infinity,
    },
  },
};
