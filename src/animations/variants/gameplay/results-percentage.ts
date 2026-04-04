import type { Variants } from "framer-motion";
import { OVERSHOOT } from "./_shared";

/**
 * RESULTS PERCENTAGE — Animated percentage counter.
 * Principles: Timing, Slow In Slow Out, Appeal
 */
export const resultsPercentage: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: OVERSHOOT, delay: 0.5 },
  },
};
