import type { Variants } from "framer-motion";
import { OVERSHOOT } from "./_shared";

/**
 * RESULTS STAT — Individual stat line entrance.
 * Principles: Staging, Timing, Follow Through
 */
export const resultsStat: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: OVERSHOOT },
  },
};
