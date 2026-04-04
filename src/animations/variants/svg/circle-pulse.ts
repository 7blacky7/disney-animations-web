/**
 * CIRCLE PULSE — Looping scale pulse for attention.
 * Principles: Squash & Stretch, Timing, Appeal
 */

import type { Variants } from "framer-motion";

export const circlePulse: Variants = {
  hidden: { scale: 1 },
  visible: {
    scale: [1, 1.15, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};
