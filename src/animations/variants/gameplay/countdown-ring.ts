import type { Variants } from "framer-motion";

/**
 * COUNTDOWN RING — Circular progress ring shrinking.
 * Uses strokeDashoffset for timer visualization.
 * Principles: Timing, Staging, Slow In Slow Out
 */
export const countdownRing: Variants = {
  full: { strokeDashoffset: 0 },
  empty: {
    strokeDashoffset: 283, // 2 * PI * 45 (circumference)
    transition: { duration: 10, ease: "linear" },
  },
};
