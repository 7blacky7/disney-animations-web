import type { Variants } from "framer-motion";
import { OVERSHOOT } from "./_shared";

/**
 * STREAK FIRE — Escalating intensity per streak level.
 * Principles: Exaggeration, Timing, Squash & Stretch, Appeal
 */
export const streakFire: Variants = {
  rest: { scale: 1, rotate: 0 },
  streak1: {
    scale: [1, 1.1, 1.05],
    transition: { duration: 0.3, ease: OVERSHOOT, times: [0, 0.5, 1] },
  },
  streak3: {
    scale: [1, 1.2, 1.1],
    rotate: [0, -3, 0],
    transition: { duration: 0.4, ease: OVERSHOOT, times: [0, 0.4, 1] },
  },
  streak5: {
    scale: [1, 1.3, 1.15],
    rotate: [0, -5, 3, 0],
    transition: { duration: 0.5, ease: OVERSHOOT, times: [0, 0.3, 0.7, 1] },
  },
  streak10: {
    scale: [1, 1.5, 1.2],
    rotate: [0, -8, 5, 0],
    transition: { duration: 0.6, ease: OVERSHOOT, times: [0, 0.3, 0.7, 1] },
  },
};
