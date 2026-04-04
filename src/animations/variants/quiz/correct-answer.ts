import type { Variants } from "framer-motion";
import { EASING } from "@/lib/animation-utils";

/**
 * CORRECT ANSWER — Celebration bounce (Duolingo-style).
 * Principles: Squash & Stretch, Exaggeration, Follow Through, Appeal
 */
export const correctAnswer: Variants = {
  rest: { scale: 1, rotate: 0 },
  celebrate: {
    scale: [1, 1.15, 0.95, 1.05, 1],
    rotate: [0, -3, 3, -1, 0],
    transition: {
      duration: 0.6,
      ease: [...EASING.overshoot],
      times: [0, 0.25, 0.5, 0.75, 1],
    },
  },
};
