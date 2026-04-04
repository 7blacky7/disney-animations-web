import type { Variants } from "framer-motion";
import { OVERSHOOT } from "./_shared";

/**
 * PODIUM — Top-3 entrance with dramatic reveals.
 * Principles: Staging, Exaggeration, Timing, Appeal
 */
export const podiumReveal: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.85 },
  first: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: OVERSHOOT, delay: 0.6 },
  },
  second: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: OVERSHOOT, delay: 0.3 },
  },
  third: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: OVERSHOOT, delay: 0 },
  },
};
