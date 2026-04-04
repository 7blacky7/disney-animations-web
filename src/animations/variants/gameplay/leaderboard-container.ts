import type { Variants } from "framer-motion";

/**
 * LEADERBOARD CONTAINER — Stagger reveal for rankings.
 * Principles: Staging, Timing, Straight Ahead Action
 */
export const leaderboardContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
      when: "beforeChildren",
    },
  },
};
