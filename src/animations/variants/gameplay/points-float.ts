import type { Variants } from "framer-motion";

/**
 * POINTS FLOAT — Earned points float up and fade.
 * Like "+10" floating upward after correct answer.
 * Principles: Follow Through, Arcs, Timing
 */
export const pointsFloat: Variants = {
  enter: { opacity: 1, y: 0, scale: 1 },
  float: {
    opacity: 0,
    y: -60,
    scale: 0.8,
    transition: { duration: 1.2, ease: "easeOut" },
  },
};
