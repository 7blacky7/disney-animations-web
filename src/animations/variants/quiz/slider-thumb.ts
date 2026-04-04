import type { Variants } from "framer-motion";
import { QUIZ_SPRING } from "./_shared";

/**
 * SLIDER THUMB — Bouncy slider interaction.
 * Principles: Squash & Stretch, Follow Through, Timing, Appeal
 */
export const sliderThumb: Variants = {
  rest: { scale: 1 },
  active: {
    scale: 1.2,
    transition: { ...QUIZ_SPRING.pop },
  },
  snap: {
    scale: [1.3, 0.9, 1.05, 1],
    transition: {
      duration: 0.4,
      times: [0, 0.4, 0.7, 1],
    },
  },
};
