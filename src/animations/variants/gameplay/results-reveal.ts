import type { Variants } from "framer-motion";
import { OVERSHOOT } from "./_shared";

/**
 * RESULTS REVEAL — Final score/results screen entrance.
 * Principles: Staging, Exaggeration, Follow Through, Appeal
 */
export const resultsReveal: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: OVERSHOOT, delay: 0.2 },
  },
};
