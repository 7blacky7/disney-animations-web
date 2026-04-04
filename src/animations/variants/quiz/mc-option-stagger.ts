import type { Variants } from "framer-motion";

/**
 * MULTIPLE CHOICE DEMO — Options appear, one gets selected, feedback.
 * Principles: Staging, Anticipation, Follow Through, Appeal
 */
export const mcOptionStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
      when: "beforeChildren",
    },
  },
};
