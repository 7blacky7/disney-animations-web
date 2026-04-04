import type { Variants } from "framer-motion";

/**
 * CELEBRATION STAR — Star/sparkle that grows and fades.
 * Principles: Squash & Stretch, Timing, Appeal
 */
export const celebrationStar: Variants = {
  hidden: { opacity: 0, scale: 0, rotate: 0 },
  visible: {
    opacity: [0, 1, 0],
    scale: [0, 1.2, 0],
    rotate: [0, 90, 180],
    transition: { duration: 0.8, ease: "easeOut", times: [0, 0.3, 1] },
  },
};
