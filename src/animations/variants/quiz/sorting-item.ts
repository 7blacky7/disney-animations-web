import type { Variants } from "framer-motion";
import { QUIZ_SPRING } from "./_shared";

/**
 * SORTING ITEM — Reorder animation for sorting quizzes.
 * Principles: Follow Through, Arcs, Timing, Appeal
 */
export const sortingItem: Variants = {
  rest: { y: 0, scale: 1 },
  moving: {
    scale: 1.05,
    transition: { ...QUIZ_SPRING.drag },
  },
  settled: {
    y: 0,
    scale: 1,
    transition: { ...QUIZ_SPRING.celebration },
  },
};
