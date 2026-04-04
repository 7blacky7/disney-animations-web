import type { Variants } from "framer-motion";
import { mirrorTransition } from "./_shared";

/**
 * TIMER URGENCY — Increasingly urgent pulse as time runs out.
 * Principles: Exaggeration, Timing, Staging, Appeal
 */
export const timerUrgent: Variants = {
  rest: { scale: 1 },
  ticking: {
    scale: [1, 1.02, 1],
    transition: mirrorTransition(1),
  },
  urgent: {
    scale: [1, 1.06, 1],
    transition: mirrorTransition(0.5),
  },
  critical: {
    scale: [1, 1.1, 1],
    rotate: [0, -1, 1, 0],
    transition: mirrorTransition(0.3),
  },
};
