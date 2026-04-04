import type { Variants } from "framer-motion";

/**
 * WRONG ANSWER — Horizontal shake (gentle, not aggressive).
 * Principles: Exaggeration, Timing, Follow Through
 */
export const wrongAnswer: Variants = {
  rest: { x: 0 },
  shake: {
    x: [0, -8, 8, -5, 5, -2, 0],
    transition: {
      duration: 0.5,
      ease: "easeOut",
      times: [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1],
    },
  },
};
