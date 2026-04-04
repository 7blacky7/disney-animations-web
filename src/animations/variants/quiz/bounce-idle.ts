import type { Variants } from "framer-motion";
import { loopTransition } from "./_shared";

/**
 * BOUNCE IDLE — Vertical bounce for mascot/icon elements.
 * More energetic than float. Kahoot-style.
 * Principles: Squash & Stretch, Timing, Exaggeration, Appeal
 */
export const bounceIdle: Variants = {
  rest: { y: 0, scaleX: 1, scaleY: 1 },
  animate: {
    y: [0, -10, 0],
    scaleX: [1, 0.97, 1],
    scaleY: [1, 1.04, 1],
    transition: loopTransition(2, 0),
  },
};
