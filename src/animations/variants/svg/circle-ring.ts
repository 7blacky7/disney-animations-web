/**
 * CIRCLE RING — Expanding ring that fades out (like a sonar ping).
 * Principles: Follow Through, Timing, Staging
 */

import type { Variants } from "framer-motion";

export const circleRing: Variants = {
  hidden: { scale: 0.8, opacity: 0.6 },
  visible: {
    scale: [0.8, 1.5],
    opacity: [0.6, 0],
    transition: {
      duration: 1.5,
      ease: "easeOut",
      repeat: Infinity,
    },
  },
};
