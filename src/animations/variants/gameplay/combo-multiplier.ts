import type { Variants } from "framer-motion";
import { OVERSHOOT } from "./_shared";

/**
 * COMBO MULTIPLIER — Multiplier badge scales up with urgency.
 * Principles: Exaggeration, Squash & Stretch, Appeal
 */
export const comboMultiplier: Variants = {
  rest: { scale: 1, rotate: 0 },
  x2: {
    scale: [1, 1.2, 1.1],
    rotate: [0, -5, 0],
    transition: { duration: 0.4, ease: OVERSHOOT, times: [0, 0.4, 1] },
  },
  x3: {
    scale: [1, 1.3, 1.15],
    rotate: [0, -8, 3, 0],
    transition: { duration: 0.5, ease: OVERSHOOT, times: [0, 0.3, 0.7, 1] },
  },
  x5: {
    scale: [1, 1.5, 1.2],
    rotate: [0, -12, 5, 0],
    transition: { duration: 0.6, ease: OVERSHOOT, times: [0, 0.3, 0.7, 1] },
  },
};
