import type { Variants } from "framer-motion";

/**
 * CELEBRATION BURST — Container for confetti particles.
 * Fast stagger for explosive feel.
 * Principles: Staging, Timing, Exaggeration
 */
export const celebrationBurst: Variants = {
  rest: { opacity: 0 },
  burst: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0,
    },
  },
};
