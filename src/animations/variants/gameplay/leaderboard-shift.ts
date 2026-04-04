import type { Variants } from "framer-motion";
import { OVERSHOOT } from "./_shared";

/**
 * LEADERBOARD POSITION CHANGE — Animated rank movement.
 * Principles: Arcs, Follow Through, Timing
 */
export const leaderboardShift: Variants = {
  up: {
    y: [0, -8, 0],
    scale: [1, 1.05, 1],
    transition: { duration: 0.5, ease: OVERSHOOT, times: [0, 0.4, 1] },
  },
  down: {
    y: [0, 8, 0],
    scale: [1, 0.97, 1],
    transition: { duration: 0.4, ease: "easeInOut", times: [0, 0.4, 1] },
  },
};
