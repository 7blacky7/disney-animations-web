import type { Variants } from "framer-motion";
import { OVERSHOOT } from "./_shared";

/**
 * STREAK BADGE — Badge shakes and glows when streak increases.
 * Principles: Exaggeration, Secondary Action, Appeal
 */
export const streakBadge: Variants = {
  rest: { scale: 1 },
  bump: {
    scale: [1, 1.15, 1],
    transition: { duration: 0.3, ease: OVERSHOOT, times: [0, 0.4, 1] },
  },
};
