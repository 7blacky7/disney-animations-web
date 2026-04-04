import type { Variants } from "framer-motion";

/**
 * QUIZ DEMO CONTAINER — Stagger children with playful entrance.
 * Principles: Staging, Timing, Straight Ahead Action
 */
export const quizDemoContainer: Variants = {
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
