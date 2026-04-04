import type { Variants } from "framer-motion";
import { loopTransition } from "./_shared";

/**
 * WOBBLE — Subtle rotation oscillation for idle elements.
 * Like a card gently rocking. Duolingo uses this on mascot.
 * Principles: Slow In Slow Out, Secondary Action, Appeal
 */
export const wobble: Variants = {
  rest: { rotate: 0 },
  animate: {
    rotate: [-1.5, 1.5, -1.5],
    transition: loopTransition(3),
  },
};
