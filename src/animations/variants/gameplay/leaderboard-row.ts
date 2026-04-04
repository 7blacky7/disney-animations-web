import type { Variants } from "framer-motion";
import { OVERSHOOT } from "./_shared";

/**
 * LEADERBOARD ROW — Individual rank row entrance.
 * Principles: Staging, Follow Through, Timing
 */
export const leaderboardRow: Variants = {
  hidden: { opacity: 0, x: -30, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.4, ease: OVERSHOOT },
  },
};
