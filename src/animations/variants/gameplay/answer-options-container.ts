import type { Variants } from "framer-motion";

/**
 * ANSWER OPTIONS STAGGER — Options appear sequentially.
 * Principles: Staging, Timing, Straight Ahead Action
 */
export const answerOptionsContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
      when: "beforeChildren",
    },
  },
};
