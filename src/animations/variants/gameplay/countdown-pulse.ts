import type { Variants } from "framer-motion";

/**
 * COUNTDOWN PULSE — Background pulse synced with countdown.
 * Principles: Exaggeration, Timing, Appeal
 */
export const countdownPulse: Variants = {
  rest: { scale: 1, opacity: 0.5 },
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: { duration: 1, ease: "easeInOut", repeat: Infinity },
  },
  urgent: {
    scale: [1, 1.1, 1],
    opacity: [0.5, 1, 0.5],
    transition: { duration: 0.5, ease: "easeInOut", repeat: Infinity },
  },
};
