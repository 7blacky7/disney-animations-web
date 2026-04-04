/**
 * BENTO CONTAINER — Orchestrates staggered child reveals.
 * Principles: Staging, Timing, Straight Ahead Action
 */

import type { Variants } from "framer-motion";

export const bentoContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
      when: "beforeChildren",
    },
  },
};
