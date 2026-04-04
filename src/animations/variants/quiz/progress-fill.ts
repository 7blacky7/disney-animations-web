import type { Variants } from "framer-motion";
import { TIMING, EASING } from "@/lib/animation-utils";

/**
 * PROGRESS BAR FILL — Smooth progress with overshoot.
 * Uses scaleX for GPU-only width simulation.
 * Principles: Slow In Slow Out, Follow Through, Timing
 */
export const progressFill: Variants = {
  empty: { scaleX: 0 },
  filled: {
    scaleX: 1,
    transition: {
      duration: TIMING.moderate,
      ease: [...EASING.overshoot],
    },
  },
};
